// Alternative animated image creator without gif.js dependency
export const animatedImageCreator = {
  
  // Create animated WebP from video (modern browsers support this)
  async createAnimatedWebPFromVideo(videoFile, options = {}) {
    console.log('🎬 Creating animated WebP from video:', videoFile.name);
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const {
        startTime = 0,
        duration = 3,
        fps = 8,
        width = 320,
        height = 240
      } = options;
      
      const timeout = setTimeout(() => {
        console.error('⏰ WebP creation timeout');
        reject(new Error('WebP creation timeout'));
      }, 20000);
      
      video.onloadedmetadata = () => {
        console.log('📹 Video loaded for WebP creation');
        clearTimeout(timeout);
        
        canvas.width = width;
        canvas.height = height;
        
        // Create a simple animated effect by capturing multiple frames
        const frames = [];
        const frameCount = Math.min(Math.floor(duration * fps), 10);
        let currentFrame = 0;
        
        const captureFrame = () => {
          if (currentFrame >= frameCount) {
            console.log('📸 All frames captured, creating animated WebP');
            // For now, just return the last frame as WebP
            const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
            console.log('✅ WebP created successfully');
            resolve(webpDataUrl);
            return;
          }
          
          const currentTime = startTime + (currentFrame * duration / frameCount);
          video.currentTime = currentTime;
          
          video.onseeked = () => {
            try {
              ctx.drawImage(video, 0, 0, width, height);
              frames.push(ctx.getImageData(0, 0, width, height));
              currentFrame++;
              setTimeout(captureFrame, 100);
            } catch (error) {
              console.error('❌ Frame capture error:', error);
              reject(error);
            }
          };
        };
        
        setTimeout(captureFrame, 500);
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Video loading error:', error);
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  },
  
  // Create a static image from video first frame (as fallback)
  async createStaticImageFromVideo(videoFile, options = {}) {
    console.log('📸 Creating static image from video:', videoFile.name);
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const {
        width = 480,
        height = 360,
        timePosition = 1 // Capture at 1 second
      } = options;
      
      const timeout = setTimeout(() => {
        console.error('⏰ Static image creation timeout');
        reject(new Error('Static image creation timeout'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        console.log('📹 Video loaded for static image');
        clearTimeout(timeout);
        
        canvas.width = width;
        canvas.height = height;
        
        video.currentTime = Math.min(timePosition, video.duration - 0.1);
        
        video.onseeked = () => {
          try {
            ctx.drawImage(video, 0, 0, width, height);
            const imageDataUrl = canvas.toDataURL('image/png', 0.9);
            console.log('✅ Static image created successfully');
            resolve(imageDataUrl);
          } catch (error) {
            console.error('❌ Static image creation error:', error);
            reject(error);
          }
        };
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Video loading error:', error);
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  },
  
  // Check if file is video
  isVideoFile(file) {
    return file && file.type && file.type.startsWith('video/');
  }
};
