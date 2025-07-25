"""
Create a test image for background removal
"""

from PIL import Image, ImageDraw

def create_test_image():
    """Create a simple test image with a clear subject"""
    # Create a 400x400 RGB image with white background
    img = Image.new('RGB', (400, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple person silhouette (circle head + rectangle body)
    # Head (red circle)
    draw.ellipse([175, 80, 225, 130], fill='red', outline='darkred', width=3)
    
    # Body (blue rectangle)
    draw.rectangle([185, 130, 215, 250], fill='blue', outline='darkblue', width=2)
    
    # Arms (green rectangles)
    draw.rectangle([150, 150, 185, 170], fill='green', outline='darkgreen', width=2)
    draw.rectangle([215, 150, 250, 170], fill='green', outline='darkgreen', width=2)
    
    # Legs (purple rectangles)
    draw.rectangle([190, 250, 205, 320], fill='purple', outline='indigo', width=2)
    draw.rectangle([205, 250, 220, 320], fill='purple', outline='indigo', width=2)
    
    # Add some background elements to make it more realistic
    # Background circles (should be removed)
    draw.ellipse([50, 50, 100, 100], fill='lightgray', outline='gray', width=2)
    draw.ellipse([300, 300, 350, 350], fill='lightblue', outline='blue', width=2)
    
    return img

if __name__ == "__main__":
    # Create and save test image
    test_img = create_test_image()
    test_img.save('test_person.png', 'PNG')
    print("✅ Test image created: test_person.png")
    print("   Size: 400x400 pixels")
    print("   Format: PNG with RGB colors")
    print("   Subject: Simple person figure (should remain after background removal)")
    print("   Background: White with some gray/blue elements (should be removed)")
