// Canvas helper utilities
export const canvasHelpers = {
  // Create a canvas from an image
  createCanvasFromImage(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    
    return { canvas, ctx };
  },

  // Convert canvas to blob
  canvasToBlob(canvas, type = 'image/png', quality = 0.95) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
  },

  // Get image data from canvas
  getImageData(canvas) {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  },

  // Put image data back to canvas
  putImageData(canvas, imageData) {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  },

  // Calculate aspect ratio
  calculateAspectRatio(width, height) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return {
      ratio: width / height,
      display: `${width / divisor}:${height / divisor}`
    };
  },

  // Resize while maintaining aspect ratio
  resizeWithAspectRatio(originalWidth, originalHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  },

  // Check if point is inside rectangle
  isPointInRect(x, y, rect) {
    return x >= rect.x && 
           x <= rect.x + rect.width && 
           y >= rect.y && 
           y <= rect.y + rect.height;
  },

  // Get color at specific pixel
  getPixelColor(canvas, x, y) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    };
  }
};
