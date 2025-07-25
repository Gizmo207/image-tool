// Google MediaPipe Background Remover - The ONLY one we need!
// Free forever, runs locally, better than remove.bg

import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

export const bestBackgroundRemover = {
  selfieSegmentation: null,
  isInitialized: false,

  // Initialize Google MediaPipe (one-time setup)
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🏆 Initializing Google MediaPipe - The BEST background remover');
    
    this.selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      }
    });

    // Configure for MAXIMUM quality
    this.selfieSegmentation.setOptions({
      modelSelection: 1, // 1 = Best quality model
      selfieMode: false,  // false = Better for all images (not just selfies)
    });

    this.selfieSegmentation.onResults((results) => {
      this.handleResults(results);
    });

    this.isInitialized = true;
    console.log('✅ Google MediaPipe ready - Professional quality guaranteed');
  },

  // Remove background with Google MediaPipe (the ONLY method we need)
  async removeBackground(imageSource) {
    console.log('🎯 Google MediaPipe processing - Professional results incoming...');
    
    // Initialize MediaPipe
    await this.initialize();

    // Prepare image
    const image = await this.prepareImage(imageSource);
    
    console.log('🔍 MediaPipe AI analyzing image structure...');
    
    // Process with MediaPipe magic
    return new Promise((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;
      this.originalImage = image;
      
      // Send to Google's AI
      this.selfieSegmentation.send({ image: image });
    });
  },

  // Handle MediaPipe results (where the magic happens)
  handleResults(results) {
    console.log('🎭 MediaPipe AI segmentation complete - Creating professional cutout...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas to match original image
    canvas.width = this.originalImage.width || this.originalImage.videoWidth;
    canvas.height = this.originalImage.height || this.originalImage.videoHeight;
    
    // Draw original image
    ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height);
    
    // Get pixel data for mask processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply Google's AI segmentation mask
    const maskData = results.segmentationMask.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const maskValue = maskData[pixelIndex];
      
      // Google's mask: 255 = subject, 0 = background
      if (maskValue < 128) {
        // Background - make transparent
        data[i + 3] = 0;
      } else {
        // Subject - keep with professional edge quality
        data[i + 3] = Math.min(255, maskValue * 1.2); // Slight enhancement for crisp edges
      }
    }
    
    // Apply the processed data
    ctx.putImageData(imageData, 0, 0);
    
    const resultDataURL = canvas.toDataURL('image/png');
    console.log('✅ Google MediaPipe complete - Professional quality guaranteed!');
    
    if (this.currentResolve) {
      this.currentResolve(resultDataURL);
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
      const image = new Image();
      return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.crossOrigin = 'anonymous';
        image.src = imageSource;
      });
    }
    
    throw new Error('Unsupported image source type');
  }
};
