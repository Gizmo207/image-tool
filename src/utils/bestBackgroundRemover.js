// BEST Free Background Remover - Google MediaPipe Selfie Segmentation
// This is what Google uses internally - professional quality and FREE!

import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

export const bestBackgroundRemover = {
  selfieSegmentation: null,
  isInitialized: false,

  // Initialize MediaPipe (only once)
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Google MediaPipe (BEST free background remover)...');
    
    try {
      this.selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

      // Configure for best quality
      this.selfieSegmentation.setOptions({
        modelSelection: 1, // 1 = General model (best quality), 0 = Landscape model (faster)
        selfieMode: false,  // false = more accurate for general images
      });

      this.selfieSegmentation.onResults((results) => {
        this.handleResults(results);
      });

      this.isInitialized = true;
      console.log('✅ MediaPipe initialized successfully');
      
    } catch (error) {
      console.error('❌ MediaPipe initialization failed:', error);
      throw error;
    }
  },

  // Process image and remove background (BEST quality)
  async removeBackground(imageSource) {
    console.log('🎯 Starting BEST background removal with Google MediaPipe...');
    
    try {
      // Initialize if not done
      await this.initialize();

      // Convert image source to format MediaPipe can use
      const image = await this.prepareImage(imageSource);
      
      console.log('🔍 MediaPipe analyzing image...');
      
      // Process with MediaPipe
      return new Promise((resolve, reject) => {
        this.currentResolve = resolve;
        this.currentReject = reject;
        this.originalImage = image;
        
        // Send to MediaPipe for processing
        this.selfieSegmentation.send({ image: image });
      });
      
    } catch (error) {
      console.error('❌ MediaPipe background removal failed:', error);
      
      // Fallback to our improved local method
      console.log('🔄 Using local computer vision fallback...');
      return await this.localFallback(imageSource);
    }
  },

  // Handle MediaPipe results
  handleResults(results) {
    try {
      console.log('🎭 MediaPipe segmentation complete, creating mask...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match original image
      canvas.width = this.originalImage.width || this.originalImage.videoWidth;
      canvas.height = this.originalImage.height || this.originalImage.videoHeight;
      
      // Draw original image
      ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height);
      
      // Get image data for mask processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply MediaPipe segmentation mask
      const maskData = results.segmentationMask.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const maskValue = maskData[pixelIndex];
        
        // MediaPipe mask: 255 = foreground, 0 = background
        // Apply with smooth alpha blending
        if (maskValue < 128) {
          // Background - make transparent
          data[i + 3] = 0;
        } else {
          // Foreground - keep with smooth edges
          const alpha = Math.min(255, maskValue * 2); // Enhance edge quality
          data[i + 3] = alpha;
        }
      }
      
      // Apply processed data back to canvas
      ctx.putImageData(imageData, 0, 0);
      
      const resultDataURL = canvas.toDataURL('image/png');
      console.log('✅ BEST background removal complete!');
      
      if (this.currentResolve) {
        this.currentResolve(resultDataURL);
      }
      
    } catch (error) {
      console.error('❌ MediaPipe result processing failed:', error);
      if (this.currentReject) {
        this.currentReject(error);
      }
    }
  },

  // Prepare image for MediaPipe processing
  async prepareImage(imageSource) {
    if (imageSource instanceof HTMLImageElement) {
      return imageSource;
    }
    
    if (imageSource instanceof HTMLCanvasElement) {
      return imageSource;
    }
    
    if (typeof imageSource === 'string') {
      // Data URL or regular URL
      const image = new Image();
      return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.crossOrigin = 'anonymous';
        image.src = imageSource;
      });
    }
    
    throw new Error('Unsupported image source type');
  },

  // Local computer vision fallback (improved)
  async localFallback(imageSource) {
    console.log('🔧 Using improved local background removal...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const image = await this.prepareImage(imageSource);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Advanced subject detection using multiple techniques
    const subjectMask = this.detectSubject(data, canvas.width, canvas.height);
    
    // Apply mask with alpha blending
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const maskValue = subjectMask[pixelIndex];
      
      if (maskValue < 128) {
        data[i + 3] = 0; // Background
      } else {
        // Smooth edges for foreground
        data[i + 3] = Math.min(255, maskValue);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  },

  // Advanced subject detection algorithm
  detectSubject(imageData, width, height) {
    const mask = new Uint8Array(width * height);
    
    // 1. Compute edge strength map
    const edges = this.computeEdges(imageData, width, height);
    
    // 2. Find center of visual attention
    const { centerX, centerY } = this.findVisualCenter(imageData, edges, width, height);
    
    // 3. Region growing from center with adaptive thresholds
    this.regionGrowing(imageData, mask, centerX, centerY, width, height);
    
    // 4. Morphological operations to clean up
    return this.morphologicalCleanup(mask, width, height);
  },

  // Compute edge strength using Sobel operator
  computeEdges(imageData, width, height) {
    const edges = new Float32Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        // Sobel operator
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const gray = (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
            
            // Sobel kernels
            const sobelX = (dx === -1 ? -1 : dx === 1 ? 1 : 0) * (dy === -1 ? 1 : dy === 1 ? 1 : dy === 0 ? 2 : 0);
            const sobelY = (dy === -1 ? -1 : dy === 1 ? 1 : 0) * (dx === -1 ? 1 : dx === 1 ? 1 : dx === 0 ? 2 : 0);
            
            gx += gray * sobelX;
            gy += gray * sobelY;
          }
        }
        
        edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return edges;
  },

  // Find center of visual attention
  findVisualCenter(imageData, edges, width, height) {
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const edgeStrength = edges[idx];
        
        // Combine edge strength with center bias
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const centerBias = Math.exp(-distanceFromCenter / (width * 0.3));
        
        const weight = edgeStrength * centerBias;
        
        totalWeight += weight;
        weightedX += x * weight;
        weightedY += y * weight;
      }
    }
    
    return {
      centerX: totalWeight > 0 ? Math.round(weightedX / totalWeight) : Math.round(centerX),
      centerY: totalWeight > 0 ? Math.round(weightedY / totalWeight) : Math.round(centerY)
    };
  },

  // Adaptive region growing
  regionGrowing(imageData, mask, seedX, seedY, width, height) {
    const visited = new Uint8Set(width * height);
    const stack = [[seedX, seedY]];
    
    // Get seed color
    const seedIdx = (seedY * width + seedX) * 4;
    const seedColor = {
      r: imageData[seedIdx],
      g: imageData[seedIdx + 1],
      b: imageData[seedIdx + 2]
    };
    
    let threshold = 40;
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const idx = y * width + x;
      if (visited.has(idx)) continue;
      
      visited.add(idx);
      
      const pixelIdx = idx * 4;
      const pixelColor = {
        r: imageData[pixelIdx],
        g: imageData[pixelIdx + 1],
        b: imageData[pixelIdx + 2]
      };
      
      const colorDiff = Math.sqrt(
        (pixelColor.r - seedColor.r) ** 2 +
        (pixelColor.g - seedColor.g) ** 2 +
        (pixelColor.b - seedColor.b) ** 2
      );
      
      if (colorDiff < threshold) {
        mask[idx] = 255;
        
        // Add 8-connected neighbors
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            stack.push([x + dx, y + dy]);
          }
        }
      }
    }
  },

  // Morphological cleanup
  morphologicalCleanup(mask, width, height) {
    // Simple closing operation to fill holes
    const cleaned = new Uint8Array(mask.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        let maxVal = 0;
        
        // 3x3 morphological dilation
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighIdx = (y + dy) * width + (x + dx);
            maxVal = Math.max(maxVal, mask[neighIdx]);
          }
        }
        
        cleaned[idx] = maxVal;
      }
    }
    
    return cleaned;
  }
};

// Utility class for efficient set operations
class Uint8Set {
  constructor(maxSize) {
    this.data = new Uint8Array(Math.ceil(maxSize / 8));
  }
  
  add(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.data[byteIndex] |= (1 << bitIndex);
  }
  
  has(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.data[byteIndex] & (1 << bitIndex)) !== 0;
  }
}
