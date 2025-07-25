#!/usr/bin/env python3
"""
Professional Background Remover using rembg library
Industry-grade background removal with U-2-Net models
"""

import sys
import os
from PIL import Image
import tempfile

def install_rembg():
    """Install rembg library if not present"""
    try:
        import rembg
        return True
    except ImportError:
        print("🔄 Installing rembg (professional background removal)...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'rembg[gpu]'])
            import rembg
            return True
        except:
            # Fallback to CPU version
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'rembg'])
            import rembg
            return True

def remove_background_professional(input_path, output_path):
    """Remove background using rembg (U-2-Net based)"""
    try:
        # Install rembg if needed
        if not install_rembg():
            return False
            
        from rembg import remove, new_session
        
        print(f"🚀 Processing with professional U-2-Net AI: {input_path}")
        
        # Load input image
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Create U-2-Net session for best quality
        session = new_session('u2net')  # Industry-standard model
        
        # Remove background
        output_data = remove(input_data, session=session)
        
        # Save result
        with open(output_path, 'wb') as output_file:
            output_file.write(output_data)
        
        print(f"✅ Professional background removal completed: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Professional background removal failed: {e}")
        return False

def main():
    if len(sys.argv) != 3:
        print("Usage: python professional_bg_remover.py <input_path> <output_path>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    # Process image
    success = remove_background_professional(input_path, output_path)
    
    if success:
        print("SUCCESS")
        sys.exit(0)
    else:
        print("FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
