
import cv2
import numpy as np
from rembg import remove
import os
import argparse

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

parser = argparse.ArgumentParser(description='Extrae frames con fondo transparente del video de animación del hero.')
parser.add_argument('--input', default=os.path.join(
    PROJECT_ROOT, 'public', 'assets', 'images', 'animacion',
    'PixVerse_V6_Image_Text_360P_necesito_al_tio_ri.mp4'
), help='Ruta al video fuente')
parser.add_argument('--output', default=os.path.join(
    PROJECT_ROOT, 'public', 'assets', 'images', 'animacion', 'frames'
), help='Carpeta de salida para los frames PNG')
args = parser.parse_args()

input_video = args.input
output_folder = args.output

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

cap = cv2.VideoCapture(input_video)
frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Remove background
    result = remove(frame_rgb)

    # Save as PNG
    output_path = os.path.join(output_folder, f'frame_{frame_count:03d}.png')

    # Convert back to BGR for opencv saving (rembg returns RGBA)
    # But since we want alpha, we can use PIL or just save with opencv
    # cv2.imwrite expects BGR(A)

    # result is RGBA. Let's convert it to BGRA for OpenCV
    bgr_rgba = cv2.cvtColor(result, cv2.COLOR_RGBA2BGRA)
    cv2.imwrite(output_path, bgr_rgba)

    frame_count += 1
    if frame_count % 10 == 0:
        print(f'Processed {frame_count} frames...')

cap.release()
print(f'Done! Processed {frame_count} frames.')
