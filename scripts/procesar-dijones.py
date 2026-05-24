"""procesar-dijones.py — Detecta y recorta objetos desde una imagen PNG

Uso:
    python procesar-dijones.py imagen.png
    python procesar-dijones.py imagen.png --output dijones_recortados/ --min-area 2000

- Recibe una imagen PNG con objetos sobre fondo blanco
- Detecta objetos separados usando connected components
- Recorta cada uno con padding de 15px
- Convierte fondo blanco a transparente
- Guarda PNGs individuales + HTML preview

Dependencias: pip install pillow scipy numpy
"""

import os
import sys
import argparse
from pathlib import Path
import numpy as np

try:
    from PIL import Image
except ImportError:
    print("Pillow no instalado. Ejecuta: pip install pillow")
    sys.exit(1)

try:
    from scipy import ndimage
except ImportError:
    print("scipy no instalado. Ejecuta: pip install scipy")
    sys.exit(1)

PADDING = 15
MIN_AREA = 2000
BG_THRESHOLD = 230


def process_image(input_path: str, output_dir: str = "dijones_output", min_area: int = MIN_AREA):
    input_path = Path(input_path)
    if not input_path.exists():
        print(f"ERROR: Archivo no encontrado: {input_path}")
        sys.exit(1)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"Procesando: {input_path.name}")

    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)

    # Detectar fondo blanco (R>230, G>230, B>230)
    white_mask = (arr[:, :, 0] > BG_THRESHOLD) & (arr[:, :, 1] > BG_THRESHOLD) & (arr[:, :, 2] > BG_THRESHOLD)

    # Objetos son los pixeles NO blancos
    obj_mask = ~white_mask

    # Etiquetar componentes conectados
    labeled, num_features = ndimage.label(obj_mask)

    objects = []
    for i in range(1, num_features + 1):
        coords = np.argwhere(labeled == i)
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)

        # Calcular area real
        area = coords.shape[0]

        if area < min_area:
            continue

        # Padding
        y_min = max(0, y_min - PADDING)
        x_min = max(0, x_min - PADDING)
        y_max = min(arr.shape[0] - 1, y_max + PADDING)
        x_max = min(arr.shape[1] - 1, x_max + PADDING)

        # Extraer el objeto
        obj_arr = arr[y_min:y_max + 1, x_min:x_max + 1].copy()

        # Hacer transparente el fondo blanco
        obj_white = (obj_arr[:, :, 0] > BG_THRESHOLD) & (obj_arr[:, :, 1] > BG_THRESHOLD) & (obj_arr[:, :, 2] > BG_THRESHOLD)
        obj_arr[obj_white, 3] = 0

        h, w = obj_arr.shape[:2]
        objects.append({
            "index": len(objects) + 1,
            "array": obj_arr,
            "x": x_min,
            "y": y_min,
            "width": w,
            "height": h,
            "area": area,
        })

    # Ordenar: arriba a abajo, luego izquierda a derecha
    objects.sort(key=lambda o: (o["y"], o["x"]))

    print(f"  Objetos detectados: {num_features}")
    print(f"  Objetos validos (area >= {min_area}px): {len(objects)}")

    if not objects:
        print("  No se encontraron objetos para recortar.")
        return

    saved = []
    for obj in objects:
        idx = obj["index"]
        filename = f"dijon-{idx:02d}.png"
        filepath = output_path / filename

        obj_img = Image.fromarray(obj["array"], "RGBA")
        obj_img.save(filepath, "PNG")

        saved.append({
            "filename": filename,
            "path": str(filepath),
            "width": obj["width"],
            "height": obj["height"],
            "area": obj["area"],
            "position": (obj["x"], obj["y"]),
        })

        print(f"  [{idx:02d}] {filename}  {obj['width']}x{obj['height']}px  area:{obj['area']}px  pos:({obj['x']},{obj['y']})")

    # Generar HTML preview
    html_path = output_path / "preview.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write("""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Preview Dijones</title>
<style>
  body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; }
  h1 { font-size: 1.2rem; margin-bottom: 20px; color: #d4af37; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; }
  .card { background: #2a2a2a; border-radius: 8px; padding: 12px; text-align: center; }
  .card img { max-width: 100px; max-height: 100px; display: block; margin: 0 auto 8px; }
  .card .label { font-size: 0.75rem; color: #aaa; }
  .card .dims { font-size: 0.65rem; color: #666; margin-top: 4px; }
</style></head>
<body>
  <h1>Dijones Recortados</h1>
  <div class="grid">\n""")

        for s in saved:
            f.write(f'    <div class="card">\n')
            f.write(f'      <img src="{s["filename"]}" alt="{s["filename"]}" />\n')
            f.write(f'      <div class="label">{s["filename"]}</div>\n')
            f.write(f'      <div class="dims">{s["width"]}x{s["height"]}px</div>\n')
            f.write(f'    </div>\n')

        f.write("""  </div>
</body>
</html>""")

    print(f"\n  HTML preview: {html_path}")
    print(f"  Total guardados: {len(saved)}")


def main():
    parser = argparse.ArgumentParser(description="Procesa imagen PNG y recorta objetos individuales")
    parser.add_argument("input", help="Imagen PNG de entrada con objetos sobre fondo blanco")
    parser.add_argument("--output", "-o", default="dijones_output", help="Directorio de salida")
    parser.add_argument("--min-area", type=int, default=MIN_AREA, help=f"Area minima en px (default: {MIN_AREA})")
    args = parser.parse_args()

    process_image(args.input, args.output, args.min_area)


if __name__ == "__main__":
    main()
