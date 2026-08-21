#!/usr/bin/env python3
"""
Script to remove background from logo.webp
"""

from PIL import Image
import sys
import os

def remove_background(input_path, output_path=None):
    """
    Remove background from an image using color thresholding.
    This is a simple method that works well for logos with solid backgrounds.
    
    Args:
        input_path: Path to input image (webp format)
        output_path: Path to save output image (default: input_path with '_no_bg' suffix)
    """
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get the pixel data
        try:
            data = img.get_flattened_data()
        except AttributeError:
            data = img.getdata()
        
        # Create new data with transparent background
        new_data = []
        
        # Get the corner pixel as the background color (assumes background is in corners)
        # This is a simple heuristic - adjust if your logo has different background
        bg_color = data[0]  # Top-left corner
        
        # Color threshold for background matching (0-255, lower = more sensitive)
        threshold = 30
        
        for item in data:
            # Check if pixel is close to background color
            if all(abs(item[i] - bg_color[i]) < threshold for i in range(3)):
                # Make transparent
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        
        # Update image with new data
        img.putdata(new_data)
        
        # Generate output path if not provided
        if output_path is None:
            base, ext = os.path.splitext(input_path)
            output_path = f"{base}_no_bg{ext}"
        
        # Save the image
        img.save(output_path, 'WEBP')
        print("Background removed successfully!")
        print(f"Output saved to: {output_path}")
        
        return output_path
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def remove_background_with_rembg(input_path, output_path=None):
    """
    Remove background using rembg library (more advanced AI-based method).
    Requires: pip install rembg
    
    Args:
        input_path: Path to input image
        output_path: Path to save output image
    """
    try:
        from rembg import remove
        
        # Open input image
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Generate output path if not provided
        if output_path is None:
            base, ext = os.path.splitext(input_path)
            output_path = f"{base}_no_bg{ext}"
        
        # Save output
        with open(output_path, 'wb') as output_file:
            output_file.write(output_data)
        
        print("Background removed using rembg!")
        print(f"Output saved to: {output_path}")
        
        return output_path
        
    except ImportError:
        print("rembg library not found. Install with: pip install rembg")
        print("Falling back to simple color thresholding method...")
        return remove_background(input_path, output_path)
    except Exception as e:
        print(f"Error with rembg: {e}")
        print("Falling back to simple color thresholding method...")
        return remove_background(input_path, output_path)

if __name__ == "__main__":
    # Default logo path
    logo_path = "assets/logo.webp"
    
    # Check if file exists
    if not os.path.exists(logo_path):
        print(f"Logo file not found: {logo_path}")
        print("Please provide the correct path to your logo.webp file")
        sys.exit(1)
    
    print(f"Processing: {logo_path}")
    print("=" * 50)
    
    # Try rembg first (better quality), fall back to simple method
    result = remove_background_with_rembg(logo_path)
    
    if result:
        print("=" * 50)
        print("Done! Your logo with transparent background is ready.")
        print(f"Original: {logo_path}")
        print(f"Transparent: {result}")
    else:
        print("Failed to remove background.")
        sys.exit(1)
