"""importar-productos.py — Importa/actualiza productos desde CSV a PostgreSQL

Uso:
    python importar-productos.py productos.csv             # Importar productos
    python importar-productos.py productos.csv --dry-run   # Solo validar, no insertar
    python importar-productos.py productos.csv --update    # Actualizar existentes por nombre

Formato CSV:
    name,description,price,image_url,category_slug,stock,features
    "Pulsera Clásica","Elegante...",125000,/assets/images/x.jpg,pulsos,20,"['Material: Acero']"

Requiere DATABASE_URL en .env o variable de entorno.
"""

import os
import csv
import json
import argparse
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import DictCursor
except ImportError:
    print("psycopg2 no instalado. Ejecuta: pip install psycopg2-binary")
    sys.exit(1)


def get_connection():
    url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DATABASE_URL")
    if not url:
        env_path = Path(__file__).parent.parent / ".env"
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("DATABASE_URL="):
                        url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
    if not url:
        print("ERROR: DATABASE_URL no encontrada en .env ni en entorno")
        print("Ejemplo: DATABASE_URL=postgresql://user:pass@host:5432/db")
        sys.exit(1)
    return psycopg2.connect(url, sslmode="require")


def build_category_map(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT id, slug, name FROM categories ORDER BY id")
        rows = cur.fetchall()
        by_slug = {row[1]: row[0] for row in rows}
        by_name = {row[2].lower(): row[0] for row in rows}
        return by_slug, by_name


def parse_features(val):
    if not val or val.strip().lower() == "none" or val.strip() == "":
        return None
    val = val.strip()
    if val.startswith("[") or val.startswith("{"):
        try:
            return json.loads(val)
        except json.JSONDecodeError:
            pass
    if val.startswith('"') and val.endswith('"'):
        val = val[1:-1]
    lines = [v.strip().strip('"').strip("'") for v in val.split(",") if v.strip()]
    return json.dumps(lines) if lines else None


def validate_row(row, idx, category_map):
    errors = []
    name = row.get("name", "").strip()
    if not name:
        errors.append(f"Fila {idx}: name requerido")

    price_str = row.get("price", "0").strip()
    try:
        price = float(price_str.replace(",", "").replace("$", ""))
        if price < 0:
            errors.append(f"Fila {idx}: price negativo")
    except ValueError:
        errors.append(f"Fila {idx}: price inválido '{price_str}'")
        price = 0

    slug = row.get("category_slug", "").strip().lower()
    if slug and slug not in category_map:
        errors.append(f"Fila {idx}: category_slug '{slug}' no existe")
        suggestions = [s for s in category_map if slug in s]
        if suggestions:
            errors[-1] += f" (sugerencias: {', '.join(suggestions)})"

    return errors


def import_csv(csv_path, dry_run=False, update=False):
    csv_path = Path(csv_path)
    if not csv_path.exists():
        print(f"ERROR: Archivo no encontrado: {csv_path}")
        sys.exit(1)

    conn = get_connection()
    category_map_slug, category_map_name = build_category_map(conn)
    category_map = {**category_map_slug, **category_map_name}
    print(f"Categorias disponibles: {', '.join(sorted(category_map.keys()))}")

    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        required = {"name", "price"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            print(f"ERROR: Columnas requeridas faltantes: {missing}")
            print(f"Columnas encontradas: {reader.fieldnames}")
            sys.exit(1)

        rows = list(reader)

    print(f"\nLeyendo {len(rows)} filas desde '{csv_path}'...")

    all_errors = []
    for i, row in enumerate(rows, start=2):
        errs = validate_row(row, i, category_map)
        if errs:
            all_errors.extend(errs)

    if all_errors:
        print(f"\n{len(all_errors)} error(es) de validacion:")
        for e in all_errors:
            print(f"  ! {e}")
        sys.exit(1)

    print("  ✓ Validación exitosa")

    if dry_run:
        print(f"\nDry-run: {len(rows)} filas listas para importar")
        conn.close()
        return

    conn.autocommit = False
    inserted = 0
    updated = 0
    skipped = 0
    errors = []

    try:
        for i, row in enumerate(rows, start=2):
            name = row["name"].strip()
            description = row.get("description", "").strip()
            price_str = row["price"].strip().replace(",", "").replace("$", "")
            price = float(price_str)
            image_url = row.get("image_url", "").strip() or None
            slug = row.get("category_slug", "").strip().lower()
            stock = int(row.get("stock", "0").strip() or 0)
            features = parse_features(row.get("features", ""))

            cat_id = category_map.get(slug) if slug else None

            with conn.cursor() as cur:
                if update:
                    cur.execute("SELECT id FROM products WHERE name = %s", (name,))
                    existing = cur.fetchone()
                    if existing:
                        cur.execute("""
                            UPDATE products SET
                                description = COALESCE(NULLIF(%s, ''), description),
                                price = %s,
                                image_url = COALESCE(NULLIF(%s, ''), image_url),
                                category_id = COALESCE(%s, category_id),
                                stock = %s,
                                features = COALESCE(NULLIF(%s::jsonb, '[]'::jsonb), features),
                                active = true
                            WHERE id = %s
                        """, (description, price, image_url, cat_id, stock, features, existing[0]))
                        updated += 1
                    else:
                        cur.execute("""
                            INSERT INTO products (name, description, price, image_url, category_id, stock, features, active)
                            VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, true)
                        """, (name, description, price, image_url, cat_id, stock, features))
                        inserted += 1
                else:
                    cur.execute("SELECT id FROM products WHERE name = %s", (name,))
                    if cur.fetchone():
                        print(f"  ~ Fila {i}: '{name}' ya existe (usa --update para actualizar)")
                        skipped += 1
                        continue
                    cur.execute("""
                        INSERT INTO products (name, description, price, image_url, category_id, stock, features, active)
                        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, true)
                    """, (name, description, price, image_url, cat_id, stock, features))
                    inserted += 1

        conn.commit()
        print(f"\n{'='*50}")
        print(f"  Importacion completada:")
        print(f"    Insertados: {inserted}")
        if update:
            print(f"    Actualizados: {updated}")
        if skipped:
            print(f"    Saltados (ya existen): {skipped}")
        print(f"  Total procesadas: {len(rows)}")
        print(f"{'='*50}")

    except Exception as e:
        conn.rollback()
        print(f"\nERROR: {e}")
        errors.append(str(e))
    finally:
        conn.close()

    if errors:
        sys.exit(1)


def export_to_csv(output_path="productos-backup.csv"):
    """Exporta productos actuales a CSV (util como backup)."""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("""
                SELECT p.name, p.description, p.price, p.image_url,
                       c.slug as category_slug, p.stock, p.features
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                WHERE p.active = true
                ORDER BY p.id
            """)
            rows = cur.fetchall()

            if not rows:
                print("No hay productos activos para exportar")
                return

            fieldnames = ["name", "description", "price", "image_url", "category_slug", "stock", "features"]
            with open(output_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for row in rows:
                    features = row["features"]
                    if features and isinstance(features, list):
                        features = json.dumps(features, ensure_ascii=False)
                    writer.writerow({
                        "name": row["name"],
                        "description": row["description"] or "",
                        "price": float(row["price"]),
                        "image_url": row["image_url"] or "",
                        "category_slug": row["category_slug"] or "",
                        "stock": row["stock"] or 0,
                        "features": features or "",
                    })

            print(f"Exportados {len(rows)} productos a '{output_path}'")
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Importa/exporta productos desde/hacia CSV")
    parser.add_argument("csv", nargs="?", help="Archivo CSV de productos a importar")
    parser.add_argument("--dry-run", action="store_true", help="Solo validar, no insertar")
    parser.add_argument("--update", action="store_true", help="Actualizar productos existentes por nombre")
    parser.add_argument("--export", nargs="?", const="productos-backup.csv", metavar="OUTPUT",
                        help="Exportar productos actuales a CSV")
    args = parser.parse_args()

    if args.export:
        export_to_csv(args.export)
    elif args.csv:
        import_csv(args.csv, dry_run=args.dry_run, update=args.update)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
