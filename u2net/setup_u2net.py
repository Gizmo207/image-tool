"""
Professional U-2-Net Background Remover
Install dependencies for professional background removal
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages for U-2-Net"""
    requirements = [
        'torch',
        'torchvision', 
        'Pillow',
        'numpy',
        'scipy',
        'scikit-image',
        'gdown'  # For downloading pretrained models
    ]
    
    print("🔄 Installing U-2-Net dependencies...")
    
    for package in requirements:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return False
    
    print("✅ All dependencies installed successfully!")
    return True

def test_installation():
    """Test if U-2-Net can run"""
    try:
        import torch
        import torchvision
        from PIL import Image
        import numpy as np
        import scipy
        import skimage
        import gdown
        
        print("✅ All imports successful!")
        
        # Test basic functionality
        print(f"PyTorch version: {torch.__version__}")
        print(f"CUDA available: {torch.cuda.is_available()}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up U-2-Net Professional Background Remover")
    
    if install_requirements():
        if test_installation():
            print("🎉 U-2-Net setup complete! Ready for professional background removal.")
        else:
            print("❌ Setup test failed. Please check the installation.")
    else:
        print("❌ Installation failed. Please check your Python environment.")
