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
TARGET_SIZE_KB = 120
TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024

# Project directory
PROJECT_DIR = r"D:\Downloads\Home-Sofa"

# Image extensions to process
IMAGE_EXTENSIONS = ['.jpg', '.jpeg']

def compress_image(image_path, target_size_bytes):
    """
    Compress an image to meet target file size.
    Uses iterative quality reduction to achieve target size.
    """
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Convert to RGB if necessary (for JPEG)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get original file size
        original_size = os.path.getsize(image_path)
        
        # If already under target size, skip
        if original_size <= target_size_bytes:
            print(f"  [OK] Already under target: {original_size / 1024:.1f} KB")
            return True
        
        print(f"  Original size: {original_size / 1024:.1f} KB")
        
        # Start with high quality and reduce iteratively
        quality = 95
        min_quality = 10
        temp_path = image_path + '.temp'
        
        while quality >= min_quality:
            # Save with current quality
            img.save(temp_path, 'JPEG', quality=quality, optimize=True)
            
            # Check file size
            compressed_size = os.path.getsize(temp_path)
            
            if compressed_size <= target_size_bytes:
                # Replace original with compressed version
                os.replace(temp_path, image_path)
                print(f"  [OK] Compressed to: {compressed_size / 1024:.1f} KB (Quality: {quality})")
                return True
            
            # Try lower quality
            quality -= 5
        
        # If we couldn't reach target size, use the best we got
        os.replace(temp_path, image_path)
        final_size = os.path.getsize(image_path)
        print(f"  [WARNING] Best effort: {final_size / 1024:.1f} KB (Quality: {quality})")
        return True
        
    except Exception as e:
        print(f"  [ERROR] Error compressing {image_path}: {e}")
        # Clean up temp file if it exists
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
