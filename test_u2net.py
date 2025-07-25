"""
Test U-2-Net Background Remover
Quick test to verify the setup works
"""

import sys
import os
import tempfile
from PIL import Image, ImageDraw
import numpy as np

def create_test_image():
    """Create a simple test image with a clear subject"""
    # Create a 300x300 RGB image
    img = Image.new('RGB', (300, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple person silhouette (circle head + rectangle body)
    # Head
    draw.ellipse([125, 50, 175, 100], fill='red')
    # Body
    draw.rectangle([135, 100, 165, 200], fill='blue')
    # Arms
    draw.rectangle([110, 120, 135, 140], fill='blue')
    draw.rectangle([165, 120, 190, 140], fill='blue')
    # Legs
    draw.rectangle([140, 200, 150, 250], fill='green')
    draw.rectangle([150, 200, 160, 250], fill='green')
    
    return img

def main():
    print("🧪 Testing U-2-Net Background Remover Setup...")
    
    # Create test image
    test_image = create_test_image()
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_input:
        test_image.save(temp_input.name, 'PNG')
        input_path = temp_input.name
    
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_output:
        output_path = temp_output.name
    
    try:
        # Import our U-2-Net remover
        import sys
        sys.path.append('u2net')
        from u2net_background_remover import U2NetBackgroundRemover
        
        # Test background removal
        print("🔄 Testing background removal...")
        remover = U2NetBackgroundRemover()
        success = remover.remove_background(input_path, output_path)
        
        if success and os.path.exists(output_path):
            # Check output file
            output_img = Image.open(output_path)
            print(f"✅ Background removal test successful!")
            print(f"   Input: {test_image.size} RGB")
            print(f"   Output: {output_img.size} {output_img.mode}")
            
            # Basic validation
            if output_img.mode == 'RGBA':
                print("✅ Output has transparency (RGBA)")
            else:
                print("⚠️ Output doesn't have transparency")
                
        else:
            print("❌ Background removal test failed")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Cleanup
        try:
            os.unlink(input_path)
            os.unlink(output_path)
        except:
            pass

if __name__ == "__main__":
    main()
