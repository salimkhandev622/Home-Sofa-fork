#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Image Compression Script
Compresses all JPG images in the project to 120KB or less.
"""

import os
import sys
from PIL import Image
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Target file size in KB
TARGET_SIZE_KB = 80
TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024

# Project directory
PROJECT_DIR = r"D:\Downloads\Home-Sofa"

# Image extensions to process
IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

def compress_image(image_path, target_size_bytes):
    """
    Compress an image to meet target file size.
    Uses iterative quality reduction, then dimension scaling as last resort.
    """
    temp_path = image_path + '.temp'
    try:
        img = Image.open(image_path)
        ext = Path(image_path).suffix.lower()

        # Determine save format
        if ext in ('.jpg', '.jpeg'):
            fmt = 'JPEG'
        elif ext == '.png':
            fmt = 'PNG'
        elif ext == '.webp':
            fmt = 'WEBP'
        else:
            fmt = 'JPEG'

        # Convert to RGB for JPEG/WebP (strip alpha)
        if fmt in ('JPEG', 'WEBP') and img.mode in ('RGBA', 'P', 'LA'):
            img = img.convert('RGB')

        original_size = os.path.getsize(image_path)

        if original_size <= target_size_bytes:
            print(f"  [OK] Already under target: {original_size / 1024:.1f} KB")
            return True

        print(f"  Original size: {original_size / 1024:.1f} KB")

        quality = 90
        min_quality = 10
        current_img = img.copy()

        # Phase 1: reduce quality iteratively
        while quality >= min_quality:
            if fmt == 'PNG':
                current_img.save(temp_path, fmt, optimize=True, compress_level=9)
            else:
                current_img.save(temp_path, fmt, quality=quality, optimize=True)

            compressed_size = os.path.getsize(temp_path)

            if compressed_size <= target_size_bytes:
                os.replace(temp_path, image_path)
                print(f"  [OK] Compressed to: {compressed_size / 1024:.1f} KB (Quality: {quality})")
                return True

            quality -= 5

        # Phase 2: scale down dimensions until target reached
        scale = 0.9
        current_img = img.copy()
        while scale >= 0.2:
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            resized = img.resize((new_w, new_h), Image.LANCZOS)

            save_quality = 60 if fmt != 'PNG' else None
            if fmt == 'PNG':
                resized.save(temp_path, fmt, optimize=True, compress_level=9)
            else:
                resized.save(temp_path, fmt, quality=save_quality, optimize=True)

            compressed_size = os.path.getsize(temp_path)

            if compressed_size <= target_size_bytes:
                os.replace(temp_path, image_path)
                print(f"  [OK] Scaled+compressed to: {compressed_size / 1024:.1f} KB ({new_w}x{new_h}, scale={scale:.1f})")
                return True

            scale -= 0.1

        # Best effort: save whatever we have
        os.replace(temp_path, image_path)
        final_size = os.path.getsize(image_path)
        print(f"  [WARNING] Best effort: {final_size / 1024:.1f} KB")
        return True

    except Exception as e:
        print(f"  [ERROR] {image_path}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False

def find_images(directory):
    """
    Find all JPG images in the directory and subdirectories.
    """
    image_files = []
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and .git directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.devin']]
        
        for file in files:
            if any(file.lower().endswith(ext) for ext in IMAGE_EXTENSIONS):
                image_files.append(os.path.join(root, file))
    
    return image_files

def main():
    print(f"Image Compression Script")
    print(f"Target size: {TARGET_SIZE_KB} KB or less")
    print(f"Project directory: {PROJECT_DIR}")
    print("-" * 50)
    
    # Find all images
    image_files = find_images(PROJECT_DIR)
    
    if not image_files:
        print("No images found to compress.")
        return
    
    print(f"Found {len(image_files)} images to process")
    print("-" * 50)
    
    # Process each image
    success_count = 0
    fail_count = 0
    
    for image_path in image_files:
        # Get relative path for display
        rel_path = os.path.relpath(image_path, PROJECT_DIR)
        print(f"\nProcessing: {rel_path}")
        
        if compress_image(image_path, TARGET_SIZE_BYTES):
            success_count += 1
        else:
            fail_count += 1
    
    print("-" * 50)
    print(f"Compression complete!")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nScript interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
