// Image processing utilities
import { canvasHelpers } from './canvasHelpers';

export const imageProcessor = {
  // Resize an image to new dimensions
  resize(image, newWidth, newHeight) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(image, 0, 0, newWidth, newHeight);
      
      // Return data URL directly - no need for Image object
      const dataURL = canvas.toDataURL('image/png');
      console.log('Resize complete:', { original: `${image.width}x${image.height}`, new: `${newWidth}x${newHeight}` });
      resolve(dataURL);
    });
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
    
    return new Promise((resolve) => {
      const processedImage = new Image();
      processedImage.onload = () => {
        processedImage.width = canvas.width;
        processedImage.height = canvas.height;
        resolve(processedImage);
      };
      processedImage.src = canvas.toDataURL('image/png');
    });
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
    
    return new Promise((resolve) => {
      const processedImage = new Image();
      processedImage.onload = () => {
        processedImage.width = canvas.width;
        processedImage.height = canvas.height;
        resolve(processedImage);
      };
      processedImage.src = canvas.toDataURL('image/png');
    });
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
  },

  // Convert image to different format
  convert(image, format) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Ensure high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // If converting to JPG, fill white background (JPG doesn't support transparency)
        if (format === 'jpg' || format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(image, 0, 0);
        
        // Convert format with appropriate quality settings
        let mimeType, quality;
        switch (format.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            quality = 0.92; // High quality JPEG
            break;
          case 'png':
            mimeType = 'image/png';
            quality = 1.0; // PNG is lossless
            break;
          case 'webp':
            mimeType = 'image/webp';
            quality = 0.90; // High quality WebP
            break;
          default:
            mimeType = 'image/png';
            quality = 1.0;
        }
        
        const dataURL = canvas.toDataURL(mimeType, quality);
        console.log('Format conversion complete:', { 
          format, 
          mimeType, 
          quality,
          originalSize: `${image.width}x${image.height}`,
          dataURLLength: dataURL.length 
        });
        resolve(dataURL);
      } catch (error) {
        console.error('Format conversion failed:', error);
        reject(error);
      }
    });
  }
};
