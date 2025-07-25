// Image processing utilities
import { canvasHelpers } from './canvasHelpers';
import { gifCreator } from './gifCreator.js';

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
    return new Promise(async (resolve, reject) => {
      try {
        // Handle GIF conversion specially
        if (format.toLowerCase() === 'gif') {
          const gifDataUrl = await gifCreator.createStaticGif(image);
          resolve(gifDataUrl);
          return;
        }

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
  },

  // Comprehensive filter system with value-based adjustments
  filter(image, filterType, value = null) {
    return new Promise((resolve) => {
      console.log('🎨 Applying filter:', filterType, 'value:', value);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Use value if provided, otherwise use default intensity
      const intensity = value !== null ? Math.abs(value) / 100 : 0.8;
      
      // Apply filter based on type
      switch (filterType) {
        case 'blur':
          ctx.filter = `blur(${Math.round(intensity * 5)}px)`;
          break;
          
        case 'grayscale':
          ctx.filter = `grayscale(${intensity * 100}%)`;
          break;
          
        case 'sepia':
          ctx.filter = `sepia(${intensity * 100}%)`;
          break;
          
        case 'brightness':
          // Handle value-based brightness: -100 to +100 -> 0.0 to 2.0
          if (value !== null) {
            const brightnessValue = 1 + (value / 100); // -100 = 0.0, 0 = 1.0, +100 = 2.0
            ctx.filter = `brightness(${Math.max(0, brightnessValue)})`;
          } else {
            ctx.filter = `brightness(${0.5 + intensity * 1.5})`;
          }
          break;
          
        case 'contrast':
          // Handle value-based contrast: -100 to +100 -> 0.0 to 2.0
          if (value !== null) {
            const contrastValue = 1 + (value / 100); // -100 = 0.0, 0 = 1.0, +100 = 2.0
            ctx.filter = `contrast(${Math.max(0, contrastValue)})`;
          } else {
            ctx.filter = `contrast(${0.5 + intensity * 1.5})`;
          }
          break;
          
        case 'saturate':
        case 'saturation':
          // Handle value-based saturation: -100 to +100 -> 0.0 to 2.0
          if (value !== null) {
            const saturationValue = 1 + (value / 100); // -100 = 0.0, 0 = 1.0, +100 = 2.0
            ctx.filter = `saturate(${Math.max(0, saturationValue)})`;
          } else {
            ctx.filter = `saturate(${intensity * 2})`;
          }
          break;
          
        case 'vintage':
          ctx.filter = `sepia(0.3) contrast(1.2) brightness(0.9) saturate(0.8)`;
          break;
          
        case 'cool':
          ctx.filter = `hue-rotate(210deg) saturate(1.2)`;
          break;
          
        case 'warm':
          ctx.filter = `hue-rotate(30deg) saturate(1.1) brightness(1.1)`;
          break;
          
        case 'vibrant':
          ctx.filter = `saturate(1.5) contrast(1.2) brightness(1.05)`;
          break;
          
        case 'dramatic':
          ctx.filter = `contrast(1.5) brightness(0.9) saturate(1.3)`;
          break;
          
        case 'dreamy':
          ctx.filter = `blur(1px) brightness(1.1) saturate(0.9) contrast(0.9)`;
          break;
          
        case 'sharp':
          // Sharpening requires pixel manipulation
          this.applySharpening(ctx, image, intensity);
          resolve(canvas.toDataURL('image/png'));
          return;
          
        case 'remove-bg':
          // Use existing background removal
          const processed = this.removeBackground(image);
          resolve(processed.src);
          return;
          
        default:
          ctx.filter = 'none';
      }
      
      ctx.drawImage(image, 0, 0);
      
      // Apply vignette effect for certain filters
      if (['vintage', 'dramatic', 'dreamy'].includes(filterType)) {
        this.applyVignette(ctx, canvas.width, canvas.height, intensity * 0.3);
      }
      
      const dataURL = canvas.toDataURL('image/png');
      console.log('✅ Filter applied successfully:', filterType);
      resolve(dataURL);
    });
  },

  // Apply sharpening effect using convolution
  applySharpening(ctx, image, intensity = 1.0) {
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    const width = image.width;
    const height = image.height;
    
    // Sharpening kernel
    const sharpenStrength = intensity * 0.5;
    const kernel = [
      0, -sharpenStrength, 0,
      -sharpenStrength, 1 + 4 * sharpenStrength, -sharpenStrength,
      0, -sharpenStrength, 0
    ];
    
    const outputData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kernelIdx];
            }
          }
          const outputIdx = (y * width + x) * 4 + c;
          outputData[outputIdx] = Math.max(0, Math.min(255, sum));
        }
      }
    }
    
    const outputImageData = new ImageData(outputData, width, height);
    ctx.putImageData(outputImageData, 0, 0);
  },

  // Apply vignette effect
  applyVignette(ctx, width, height, intensity = 0.3) {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) * 0.7
    );
    
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
    
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  },

  // Convert file to GIF (only handles video files now)
  async convertToGif(file) {
    console.log('🎨 ImageProcessor: Starting GIF conversion for:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: Math.round(file.size / 1024) + 'KB'
    });

    try {
      if (!gifCreator.isVideoFile(file)) {
        throw new Error('GIF conversion is only supported for video files');
      }

      console.log('🎥 Processing video file...');
      
      // Convert video to animated GIF
      console.log('📹 Getting video information...');
      const videoInfo = await gifCreator.getVideoInfo(file);
      console.log('📹 Video info retrieved:', videoInfo);
      
      const options = {
        startTime: 0,
        duration: Math.min(videoInfo.duration, 10), // Max 10 seconds
        fps: 10,
        width: Math.min(videoInfo.width, 480), // Max width 480px
        height: Math.min(videoInfo.height, 360) // Max height 360px
      };
      
      console.log('⚙️ Using conversion options:', options);
      console.log('🎬 Starting video to GIF conversion (this may take 30-60 seconds)...');
      
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('GIF conversion timeout after 60 seconds - file might be too large or complex'));
        }, 60000);
      });
      
      const conversionPromise = gifCreator.createGifFromVideo(file, options);
      
      return await Promise.race([conversionPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('❌ GIF conversion failed:', error);
      throw error;
    }
  }
};
