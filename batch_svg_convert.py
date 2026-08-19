#!/usr/bin/env python3
"""
batch_svg_convert.py
Converts all images in a folder to SVG using vtracer.
Usage: python batch_svg_convert.py <input_dir> <output_dir>
"""

import sys
from pathlib import Path
from vtracer import convert_image_to_svg_py

SUPPORTED_EXT = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".webp"}

def convert_folder(input_dir: str, output_dir: str):
    in_path = Path(input_dir)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    images = [f for f in in_path.iterdir() if f.suffix.lower() in SUPPORTED_EXT]
    if not images:
        print("No supported images found.")
        return

    for img in images:
        svg_file = out_path / (img.stem + ".svg")
        print(f"Converting {img.name} -> {svg_file.name}")
        try:
            convert_image_to_svg_py(
                str(img),
                str(svg_file),
                colormode="color",
                mode="spline",
                filter_speckle=4,
            )
            print(f"  Successfully converted to {svg_file.name}")
        except Exception as e:
            print(f"  Failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python batch_svg_convert.py <input_dir> <output_dir>")
        sys.exit(1)
    convert_folder(sys.argv[1], sys.argv[2])