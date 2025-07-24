// Image processing utilities
import { canvasHelpers } from './canvasHelpers';

export const imageProcessor = {
  // Resize an image to new dimensions
  resize(image, newWidth, newHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    
    // Convert canvas to image
    const processedImage = new Image();
    processedImage.src = canvas.toDataURL('image/png');
    processedImage.width = newWidth;
    processedImage.height = newHeight;
    
    return processedImage;
  },

  // Remove background using edge detection
  removeBackground(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple background removal (removes pixels similar to corners)
    const cornerColor = {
      r: data[0],
      g: data[1], 
      b: data[2]
    };
    
    const threshold = 50;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const diff = Math.abs(r - cornerColor.r) + 
                   Math.abs(g - cornerColor.g) + 
                   Math.abs(b - cornerColor.b);
      
      if (diff < threshold) {
        data[i + 3] = 0; // Make transparent
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const processedImage = new Image();
    processedImage.src = canvas.toDataURL('image/png');
    processedImage.width = canvas.width;
    processedImage.height = canvas.height;
    
    return processedImage;
  },

  // Apply color filters
  applyFilters(image, filters) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Apply CSS filters
    ctx.filter = `
      brightness(${filters.brightness}) 
      contrast(${filters.contrast}) 
      saturate(${filters.saturation})
    `;
    
    ctx.drawImage(image, 0, 0);
    
    const processedImage = new Image();
    processedImage.src = canvas.toDataURL('image/png');
    processedImage.width = canvas.width;
    processedImage.height = canvas.height;
    
    return processedImage;
  },

  // Crop image to specified rectangle
  crop(image, x, y, width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    
    const processedImage = new Image();
    processedImage.src = canvas.toDataURL('image/png');
    processedImage.width = width;
    processedImage.height = height;
    
    return processedImage;
  },

  // Add watermark to image
  addWatermark(image, text, position = 'bottom-right') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    
    // Set watermark style
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px Arial';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    
    // Position watermark
    const textWidth = ctx.measureText(text).width;
    let x, y;
    
    switch (position) {
      case 'bottom-right':
        x = canvas.width - textWidth - 10;
        y = canvas.height - 10;
        break;
      case 'bottom-left':
        x = 10;
        y = canvas.height - 10;
        break;
      case 'top-right':
        x = canvas.width - textWidth - 10;
        y = 30;
        break;
      case 'top-left':
        x = 10;
        y = 30;
        break;
      default:
        x = 10;
        y = canvas.height - 10;
    }
    
    ctx.fillText(text, x, y);
    
    const processedImage = new Image();
    processedImage.src = canvas.toDataURL('image/png');
    processedImage.width = canvas.width;
    processedImage.height = canvas.height;
    
    return processedImage;
  }
};
