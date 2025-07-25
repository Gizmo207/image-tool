// GIF creation utility using gif.js
import GIF from 'gif.js';

export const gifCreator = {
  // Create static GIF from single image
  createStaticGif(image) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: canvas.width,
          height: canvas.height
        });
        
        // Add single frame (static GIF)
        gif.addFrame(canvas, { delay: 0 });
        
        gif.on('finished', function(blob) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        gif.on('error', reject);
        gif.render();
        
      } catch (error) {
        reject(error);
      }
    });
  },

  // Create animated GIF from video
  createGifFromVideo(videoFile, options = {}) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const {
        startTime = 0,
        duration = 3, // Default 3 seconds
        fps = 10, // 10 frames per second
        width = 320,
        height = 240
      } = options;
      
      video.onloadedmetadata = () => {
        canvas.width = width;
        canvas.height = height;
        
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: canvas.width,
          height: canvas.height
        });
        
        const frameCount = Math.floor(duration * fps);
        const frameDelay = 1000 / fps; // Delay in milliseconds
        let currentFrame = 0;
        
        const captureFrame = () => {
          const currentTime = startTime + (currentFrame / fps);
          
          if (currentFrame >= frameCount || currentTime >= video.duration) {
            gif.on('finished', function(blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            
            gif.on('error', reject);
            gif.render();
            return;
          }
          
          video.currentTime = currentTime;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            gif.addFrame(canvas, { delay: frameDelay });
            currentFrame++;
            setTimeout(captureFrame, 50); // Small delay to ensure frame is ready
          };
        };
        
        captureFrame();
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoFile);
    });
  },

  // Create animated GIF from multiple images
  createGifFromImages(images, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const { delay = 500, width, height } = options;
        
        if (!images || images.length === 0) {
          reject(new Error('No images provided'));
          return;
        }
        
        // Use first image dimensions if not specified
        const firstImg = images[0];
        const gifWidth = width || firstImg.width;
        const gifHeight = height || firstImg.height;
        
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: gifWidth,
          height: gifHeight
        });
        
        images.forEach(image => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = gifWidth;
          canvas.height = gifHeight;
          
          // Scale image to fit canvas
          ctx.drawImage(image, 0, 0, gifWidth, gifHeight);
          gif.addFrame(canvas, { delay });
        });
        
        gif.on('finished', function(blob) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        gif.on('error', reject);
        gif.render();
        
      } catch (error) {
        reject(error);
      }
    });
  },

  // Check if file is video
  isVideoFile(file) {
    return file.type.startsWith('video/');
  },

  // Get video info
  getVideoInfo(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(videoFile);
    });
  }
};
