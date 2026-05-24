"""subir-assets.py ? Optimiza PNGs y los sube a Supabase Storage

Uso: python subir-assets.py [--input DIR] [--output DIR]

- Lee PNGs del directorio --input (default: public/assets/images)
- Redimensiona a max 200x200px manteniendo proporcion
- Convierte a WebP calidad 85 con fondo transparente
- Si SUPABASE_URL y SUPABASE_SERVICE_KEY estan en .env, sube a Supabase Storage
- Genera assets_urls.csv con las rutas/nombres

Dependencias: Pillow (supabase-py opcional para upload)
"""

import os
import csv
import argparse
from pathlib import Path
from PIL import Image, ImageFilter

# Cargar .env manualmente si existe
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

MAX_SIZE = 200
WEBP_QUALITY = 85

ASSETS_DIRS = [
    "balines/generados",
    "dijones",
]


def optimize_png(input_path: Path, output_dir: Path) -> dict | None:
    """Optimiza un PNG: redimensiona y convierte a WebP."""
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"  X Error abriendo {input_path.name}: {e}")
        return None

    orig_size = os.path.getsize(input_path)
    orig_w, orig_h = img.size

    # Redimensionar manteniendo proporcion
    if orig_w > MAX_SIZE or orig_h > MAX_SIZE:
        ratio = min(MAX_SIZE / orig_w, MAX_SIZE / orig_h)
        new_w = int(orig_w * ratio)
        new_h = int(orig_h * ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)

    # Determinar tipo y nombre
    name = input_path.stem
    parent_dir = input_path.parent.name

    if "balin" in name:
        asset_type = "balines"
        # Extraer tipo, material, tamano
        parts = name.split("-")
        tipo = parts[1] if len(parts) > 1 else "liso"
        material = parts[2] if len(parts) > 2 else "dorado"
        size_str = parts[3] if len(parts) > 3 else "60px"
        webp_name = f"balin-{tipo}-{material}-{size_str}.webp"
        subdir = "balines"
    elif "dijon" in name:
        asset_type = "dijones"
        webp_name = f"{name}.webp"
        subdir = "dijones"
    else:
        asset_type = "otros"
        webp_name = f"{name}.webp"
        subdir = "otros"

    # Asegurar directorio de salida
    out_subdir = output_dir / subdir
    out_subdir.mkdir(parents=True, exist_ok=True)

    # Guardar como WebP
    webp_path = out_subdir / webp_name
    img.save(webp_path, "WEBP", quality=WEBP_QUALITY, lossless=False)
    webp_size = os.path.getsize(webp_path)

    # Guardar tambien PNG optimizado
    png_optimized = out_subdir / f"{name}.png"
    img.save(png_optimized, "PNG", optimize=True)
    png_size = os.path.getsize(png_optimized)

    savings_orig = ((orig_size - webp_size) / orig_size) * 100

    print(f"  OK {input_path.name}")
    print(f"    -> {webp_name} ({img.size[0]}x{img.size[1]}, {webp_size/1024:.1f}KB, ahorro {savings_orig:.0f}%)")

    return {
        "nombre_original": input_path.name,
        "nombre_webp": webp_name,
        "nombre_png": f"{name}.png",
        "tipo": asset_type,
        "ancho": img.size[0],
        "alto": img.size[1],
        "ruta_webp": str(webp_path),
        "ruta_png": str(png_optimized),
        "tamano_original_kb": round(orig_size / 1024, 1),
        "tamano_webp_kb": round(webp_size / 1024, 1),
        "ahorro_pct": round(savings_orig, 1),
    }


def upload_to_supabase(results: list[dict]) -> list[dict]:
    """Sube los WebP a Supabase Storage (requiere credenciales en .env)."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    bucket = os.getenv("SUPABASE_BUCKET", "assets")

    if not supabase_url or not supabase_key:
        print("\n  !! SUPABASE_URL o SUPABASE_SERVICE_KEY no definidos en .env")
        print("  Los assets se guardaron localmente. Para subir a Supabase Storage:")
        print("  1. Agrega al .env:")
        print("     SUPABASE_URL=https://tu-proyecto.supabase.co")
        print("     SUPABASE_SERVICE_KEY=tu-service-role-key")
        print("     SUPABASE_BUCKET=assets")
        print("  2. Vuelve a ejecutar: python subir-assets.py --upload")
        return results

    try:
        import requests
    except ImportError:
        print("\n  !! requests no instalado. Ejecuta: pip install requests")
        return results

    auth_headers = {"Authorization": f"Bearer {supabase_key}"}

    # Crear bucket si no existe
    try:
        bucket_url = f"{supabase_url}/storage/v1/bucket"
        r = requests.get(bucket_url, headers=auth_headers)
        existing = [b["id"] for b in (r.json() if r.ok else [])]
        if bucket not in existing:
            resp = requests.post(bucket_url, json={
                "name": bucket, "id": bucket, "public": True
            }, headers={**auth_headers, "Content-Type": "application/json"})
            if resp.ok:
                print(f"  + Bucket '{bucket}' creado")
            else:
                print(f"  !! No se pudo crear bucket '{bucket}': {resp.status_code} {resp.text[:100]}")
    except Exception as e:
        print(f"  !! Error verificando bucket: {e}")

    uploaded = []
    for r in results:
        webp_path = r["ruta_webp"]
        if not os.path.exists(webp_path):
            continue
        storage_path = f"{r['tipo']}/{r['nombre_webp']}"
        try:
            upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
            with open(webp_path, "rb") as f:
                resp = requests.post(
                    f"{upload_url}?upsert=true",
                    headers={**auth_headers, "Content-Type": "image/webp"},
                    data=f
                )
                resp.raise_for_status()
            public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
            r["url_publica"] = public_url
            uploaded.append(r)
            print(f"  ^ {storage_path} -> {public_url}")
        except requests.RequestException as e:
            detail = e.response.text[:80] if e.response is not None else str(e)
            print(f"  X Error subiendo {storage_path}: {detail}")
        except Exception as e:
            print(f"  X Error subiendo {storage_path}: {e}")

    print(f"\n  {len(uploaded)} assets subidos a Supabase Storage")
    return uploaded


def main():
    parser = argparse.ArgumentParser(description="Optimiza y sube assets PNG")
    parser.add_argument("--input", "-i", default="public/assets/images",
                        help="Directorio con PNGs de entrada (default: public/assets/images)")
    parser.add_argument("--output", "-o", default="public/assets/optimized",
                        help="Directorio de salida para archivos optimizados (default: public/assets/optimized)")
    parser.add_argument("--upload", action="store_true",
                        help="Subir a Supabase Storage (requiere credenciales en .env)")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)

    if not input_dir.exists():
        print(f"X El directorio '{input_dir}' no existe")
        return

    # Recopilar todos los PNGs de los directorios de assets
    png_files = []
    for sub in ASSETS_DIRS:
        sub_path = input_dir / sub
        if sub_path.exists():
            png_files.extend(sorted(sub_path.glob("*.png")))

    if not png_files:
        print(f"X No se encontraron PNGs en {input_dir}/{{{','.join(ASSETS_DIRS)}}}")
        return

    total = len(png_files)
    print(f"\nProcesando {total} PNGs desde '{input_dir}/'...\n")

    results = []
    for png_path in png_files:
        result = optimize_png(png_path, output_dir)
        if result:
            results.append(result)

    # Generar CSV
    csv_path = output_dir / "assets_urls.csv"
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        if results:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)

    print(f"\n{'='*50}")
    print(f"  {len(results)}/{total} assets optimizados")
    total_orig = sum(r["tamano_original_kb"] for r in results)
    total_webp = sum(r["tamano_webp_kb"] for r in results)
    print(f"  Tamano original: {total_orig:.1f} KB -> WebP: {total_webp:.1f} KB")
    print(f"  Ahorro total: {(1 - total_webp/total_orig)*100:.0f}%")
    print(f"  CSV generado: {csv_path}")

    # Upload si se solicita
    if args.upload:
        print(f"\n{'='*50}")
        print("Subiendo a Supabase Storage...")
        upload_to_supabase(results)

    print()


if __name__ == "__main__":
    main()
