"""generar-balines.py — Genera PNG de balines realistas para el configurador web

Uso: python generar-balines.py [--output DIR]

Genera combinaciones de tipo × material × tamaño:
  - Tipos: liso, diamantado
  - Materiales: dorado (#D4AF37), plateado (#C0C0C0), negro (#2C2C2C)
  - Tamaños: 40x40px, 60x60px, 80x80px

Dependencias: Pillow, numpy
"""

import os
import argparse
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# ─── Configuración ───────────────────────────────────────────────────────────

MATERIALS = {
    "dorado":  {"base": (212, 175, 55),  "dark": (160, 130, 30),  "light": (255, 230, 120)},
    "plateado": {"base": (192, 192, 192), "dark": (140, 140, 140), "light": (240, 240, 240)},
    "negro":   {"base": (44, 44, 44),    "dark": (20, 20, 20),    "light": (100, 100, 100)},
}

SIZES = [40, 60, 80]
TYPES = ["liso", "diamantado"]

BEAD_PREFIX = "balin"


def hex_to_rgb(h: str) -> tuple:
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def lerp_color(a: tuple, b: tuple, t):
    return tuple(ax + (bx - ax) * t for ax, bx in zip(a, b))


def create_liso(size: int, mat: dict) -> Image.Image:
    """Crea un balín liso con gradiente radial y brillo."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    r = size / 2 - 1

    base_color = mat["base"]
    dark_color = mat["dark"]
    light_color = mat["light"]

    # Gradiente radial pixel por pixel con numpy
    arr = np.zeros((size, size, 4), dtype=np.uint8)
    yy, xx = np.mgrid[:size, :size]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    max_dist = r
    mask = dist <= max_dist

    t = np.where(mask, dist / max_dist, 0)
    t = np.clip(t, 0, 1)

    # Gradiente base: centro claro → borde oscuro
    grad = lerp_color(light_color, dark_color, t ** 0.8)
    for c in range(3):
        arr[:, :, c] = np.where(mask, np.clip(base_color[c] + (grad[c] - base_color[c]) * 0.6, 0, 255), arr[:, :, c])
    arr[:, :, 3] = np.where(mask, 255, arr[:, :, 3])

    # Highlight superior-izquierdo
    h_dist = np.sqrt((xx - (cx - r * 0.3)) ** 2 + (yy - (cy - r * 0.3)) ** 2)
    h_max = r * 0.6
    h_mask = (h_dist <= h_max) & mask
    h_intensity = np.where(h_mask, 1 - (h_dist / h_max), 0)
    h_intensity = np.clip(h_intensity * 0.5, 0, 0.5)
    for c in range(3):
        arr[:, :, c] = np.where(h_mask,
                                np.clip(arr[:, :, c] + h_intensity * (255 - arr[:, :, c]), 0, 255),
                                arr[:, :, c])

    img = Image.fromarray(arr, "RGBA")

    # Borde fino oscuro
    draw = ImageDraw.Draw(img)
    draw.ellipse([1, 1, size - 2, size - 2], outline=dark_color + (180,), width=1)

    # Sombra exterior (expandimos canvas, aplicamos blur, recortamos)
    shadow = Image.new("RGBA", (size + 8, size + 8), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse([4, 4, size + 3, size + 3], fill=(0, 0, 0, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=2))
    shadow.paste(img, (4, 4), img)
    img = shadow

    return img


def create_diamantado(size: int, mat: dict) -> Image.Image:
    """Crea un balín diamantado con facetas geométricas."""
    base = create_liso(size, mat)
    arr = np.array(base, dtype=np.float32)
    h, w = arr.shape[:2]

    cx = w / 2
    cy = h / 2
    r = size / 2 - 1

    yy, xx = np.mgrid[:h, :w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    mask = dist <= r

    # Generar facetas triangulares radiales
    num_facets = 12
    angles = np.arctan2(yy - cy, xx - cx) + np.pi
    facet_angle = (2 * np.pi) / num_facets
    facet_idx = (angles / facet_angle).astype(int) % num_facets

    # Alternar brillo por faceta
    for fi in range(num_facets):
        f_mask = mask & (facet_idx == fi)
        brightness = 1.0 + (0.25 if fi % 2 == 0 else -0.2)
        # Gradiente radial: más brillante al centro
        f_dist = np.where(f_mask, dist / r, 0)
        radial_factor = np.where(f_mask, 1 - f_dist * 0.3, 1)
        for c in range(3):
            arr[:, :, c] = np.where(
                f_mask,
                np.clip(arr[:, :, c] * brightness * radial_factor, 0, 255),
                arr[:, :, c]
            )

    # Líneas de facetas (sutiles)
    img = Image.fromarray(arr.astype(np.uint8), "RGBA")
    draw = ImageDraw.Draw(img)

    for fi in range(num_facets):
        angle = fi * facet_angle
        ex = cx + np.cos(angle) * r
        ey = cy + np.sin(angle) * r
        line_color = tuple(int(c * 0.8) for c in mat["base"]) + (50,)
        draw.line([cx, cy, ex, ey], fill=line_color, width=1)

    # Reflejo central brillante
    arr2 = np.array(img, dtype=np.float32)
    center_mask = mask & (dist <= r * 0.2)
    for c in range(3):
        arr2[:, :, c] = np.where(
            center_mask,
            np.clip(arr2[:, :, c] * 1.2, 0, 255),
            arr2[:, :, c]
        )
    img = Image.fromarray(arr2.astype(np.uint8), "RGBA")

    return img


def main():
    parser = argparse.ArgumentParser(description="Genera PNG de balines realistas")
    parser.add_argument("--output", "-o", default="balines_output",
                        help="Directorio de salida (default: balines_output)")
    args = parser.parse_args()

    out_dir = args.output
    os.makedirs(out_dir, exist_ok=True)

    total = 0
    for bead_type in TYPES:
        for mat_name, mat_data in MATERIALS.items():
            for size in SIZES:
                filename = f"{BEAD_PREFIX}-{bead_type}-{mat_name}-{size}px.png"
                filepath = os.path.join(out_dir, filename)

                if bead_type == "liso":
                    img = create_liso(size, mat_data)
                else:
                    img = create_diamantado(size, mat_data)

                img.save(filepath, "PNG")
                print(f"  -> {filename} ({size}x{size})")
                total += 1

    print(f"\n==> {total} balines generados en '{out_dir}/'")
    print(f"\nCombinaciones: {len(TYPES)} tipos × {len(MATERIALS)} materiales × {len(SIZES)} tamaños")


if __name__ == "__main__":
    main()
