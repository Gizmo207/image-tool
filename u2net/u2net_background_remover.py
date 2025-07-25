#!/usr/bin/env python3
"""
Professional Background Remover with SMART AUTO-DETECTION + Polish Layer
Industry-grade background removal with preprocessing and post-processing
"""

import sys
import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance

def install_dependencies():
    """Install required libraries"""
    packages = ['rembg', 'opencv-python', 'numpy', 'pillow']
    for package in packages:
        try:
            if package == 'rembg':
                import rembg
            elif package == 'opencv-python':
                import cv2
            elif package == 'numpy':
                import numpy
            elif package == 'pillow':
                from PIL import Image
        except ImportError:
            print(f"Installing {package}...")
            import subprocess
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            except Exception as e:
                print(f"Failed to install {package}: {e}")
                return False
    return True

def preprocess_image(image_path):
    """Polish the input image for better U-2-Net results"""
    try:
        # Open image
        img = Image.open(image_path).convert("RGB")
        
        # Enhance contrast to make subject/background distinction clearer
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)  # 20% more contrast
        
        # Enhance sharpness to make edges clearer
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.1)  # 10% sharper
        
        # Save preprocessed image
        temp_path = image_path.replace('.', '_preprocessed.')
        img.save(temp_path)
        
        print("Preprocessed image for better edge detection")
        return temp_path
        
    except Exception as e:
        print(f"Preprocessing failed, using original: {e}")
        return image_path

def postprocess_mask(output_path):
    """Polish the output for smoother edges and cleanup"""
    try:
        # Open the result image
        img = Image.open(output_path).convert("RGBA")
        img_array = np.array(img)
        
        # Extract alpha channel (the mask)
        alpha = img_array[:, :, 3]
        
        # Apply morphological operations to clean up the mask
        kernel = np.ones((3,3), np.uint8)
        
        # Close small holes in the subject
        alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
        
        # Smooth the edges
        alpha = cv2.GaussianBlur(alpha, (3,3), 0)
        
        # Dilate slightly to recover any lost edges (like sweater parts)
        alpha = cv2.dilate(alpha, kernel, iterations=1)
        
        # Apply the cleaned mask back
        img_array[:, :, 3] = alpha
        
        # Save the polished result
        polished_img = Image.fromarray(img_array)
        polished_img.save(output_path)
        
        print("Post-processed for smoother edges and recovery")
        return True
        
    except Exception as e:
        print(f"Post-processing failed: {e}")
        return False

def detect_image_content(image_path):
    """
    SMART AUTO-DETECTION: Analyze image content to choose optimal AI model
    Returns: best_model_name, confidence_score
    """
    try:
        print("Analyzing image content for smart model selection...")
        
        # Load image for analysis
        img = cv2.imread(image_path)
        if img is None:
            return 'u2net_human_seg', 0.5  # Safe default
        
        # Convert to RGB for face detection
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # METHOD 1: Human Face Detection (highest priority)
        try:
            # Use OpenCV's built-in face detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            
            if len(faces) > 0:
                print(f"DETECTED: {len(faces)} human face(s) - Using HUMAN-OPTIMIZED model")
                return 'u2net_human_seg', 0.9
        except:
            pass
        
        # METHOD 2: Image Characteristics Analysis
        height, width = img.shape[:2]
        total_pixels = height * width
        
        # Check for portrait orientation (likely human)
        if height > width * 1.2:
            print("DETECTED: Portrait orientation - Likely human subject")
            return 'u2net_human_seg', 0.7
        
        # METHOD 3: Color Analysis for Object vs Animal Detection
        # Convert to HSV for better color analysis
        hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Check for metallic/artificial colors (vehicles, objects)
        mask_blue = cv2.inRange(hsv_img, np.array([100, 50, 50]), np.array([130, 255, 255]))
        mask_gray = cv2.inRange(hsv_img, np.array([0, 0, 50]), np.array([180, 30, 200]))
        
        artificial_pixels = cv2.countNonZero(mask_blue) + cv2.countNonZero(mask_gray)
        artificial_ratio = artificial_pixels / total_pixels
        
        if artificial_ratio > 0.15:  # 15% artificial colors
            print("DETECTED: Metallic/artificial colors - Likely object/vehicle")
            return 'isnet-general-use', 0.8
        
        # METHOD 4: Natural color detection (animals, organic objects)
        mask_brown = cv2.inRange(hsv_img, np.array([10, 50, 20]), np.array([20, 255, 200]))
        mask_green = cv2.inRange(hsv_img, np.array([40, 40, 40]), np.array([80, 255, 255]))
        
        natural_pixels = cv2.countNonZero(mask_brown) + cv2.countNonZero(mask_green)
        natural_ratio = natural_pixels / total_pixels
        
        if natural_ratio > 0.10:  # 10% natural colors
            print("DETECTED: Natural colors - Likely animal/organic subject")
            return 'u2net', 0.7
        
        # METHOD 5: Edge complexity analysis
        edges = cv2.Canny(gray_img, 50, 150)
        edge_pixels = cv2.countNonZero(edges)
        edge_ratio = edge_pixels / total_pixels
        
        if edge_ratio > 0.15:  # Complex edges
            print("DETECTED: Complex edges - Using advanced edge model")
            return 'isnet-general-use', 0.6
        
        # DEFAULT: Human model (safest for most cases)
        print("DETECTED: General content - Using HUMAN-OPTIMIZED default")
        return 'u2net_human_seg', 0.5
        
    except Exception as e:
        print(f"Detection failed, using safe default: {e}")
        return 'u2net_human_seg', 0.5

def remove_background_professional(input_path, output_path, model_name='auto'):
    """Remove background using rembg with SMART AUTO-DETECTION and Polish Layer"""
    try:
        # Install dependencies if needed
        if not install_dependencies():
            return False
            
        from rembg import remove, new_session
        
        # SMART AUTO-DETECTION: Choose optimal model automatically
        if model_name == 'auto':
            detected_model, confidence = detect_image_content(input_path)
            model_name = detected_model
            print(f"SMART SELECTION: {model_name} (confidence: {confidence:.1f})")
        
        print(f"Processing with POLISHED {model_name} AI model")
        
        # Step 1: Preprocess image for better edge detection
        preprocessed_path = preprocess_image(input_path)
        
        # Step 2: Load preprocessed image
        with open(preprocessed_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Step 3: Create session with specified model
        session = new_session(model_name)
        
        # Step 4: Remove background with U-2-Net AI
        output_data = remove(input_data, session=session)
        
        # Step 5: Save initial result
        with open(output_path, 'wb') as output_file:
            output_file.write(output_data)
        
        # Step 6: Post-process for smoother edges and cleanup
        postprocess_mask(output_path)
        
        # Cleanup preprocessed file
        if preprocessed_path != input_path:
            try:
                os.remove(preprocessed_path)
            except:
                pass
        
        print(f"POLISHED background removal completed: {output_path}")
        return True
        
    except Exception as e:
        print(f"Professional background removal failed: {e}")
        return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python u2net_background_remover.py <input_path> <output_path> [model_name]")
        print("Models: auto (default - SMART DETECTION), u2net, u2net_human_seg, silueta, isnet-general-use")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    model_name = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    
    # Process image with SMART AUTO-DETECTION + POLISHED professional background removal
    success = remove_background_professional(input_path, output_path, model_name)
    
    if success:
        print("SUCCESS")
        sys.exit(0)
    else:
        print("FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
