// Simple GIF creation without web workers
import GIF from 'gif.js';

export const simpleGifCreator = {
  async createGifFromVideo(videoFile, options = {}) {
    console.log('🎥 Simple GIF Creator: Starting conversion for:', videoFile.name);
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const {
        startTime = 0,
        duration = 2, // Shorter duration for testing
        fps = 6, // Lower FPS for faster processing
        width = 240, // Smaller size for testing
        height = 180
      } = options;
      
      // Shorter timeout for testing
      const timeout = setTimeout(() => {
        console.error('⏰ Simple GIF timeout after 30 seconds');
        reject(new Error('GIF creation timeout - please try a shorter video'));
      }, 30000);
      
      video.onloadedmetadata = () => {
        console.log('📹 Video loaded for simple GIF:', {
          duration: video.duration,
          dimensions: `${video.videoWidth}x${video.videoHeight}`
        });
        
        clearTimeout(timeout);
        
        canvas.width = width;
        canvas.height = height;
        
        // Try creating GIF without workers for simplicity
        const gif = new GIF({
          workers: 1,
          quality: 20, // Lower quality for faster processing
          width: width,
          height: height,
          repeat: 0
        });
        
        gif.on('finished', function(blob) {
          console.log('🎉 Simple GIF created successfully');
          const reader = new FileReader();
          reader.onload = () => {
            console.log('📝 Simple GIF data URL ready');
            resolve(reader.result);
          };
          reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            reject(error);
          };
          reader.readAsDataURL(blob);
        });
        
        gif.on('error', (error) => {
          console.error('❌ Simple GIF encoding error:', error);
          reject(error);
        });
        
        gif.on('progress', (progress) => {
          console.log('🔄 Simple GIF progress:', Math.round(progress * 100) + '%');
        });
        
        // Capture frames
        const frameCount = Math.min(Math.floor(duration * fps), 12); // Max 12 frames
        const frameDelay = 1000 / fps;
        let currentFrame = 0;
        
        const captureFrame = () => {
          if (currentFrame >= frameCount) {
            console.log('📸 All frames captured, starting encoding...');
            gif.render();
            return;
          }
          
          const currentTime = startTime + (currentFrame * duration / frameCount);
          console.log(`📸 Capturing frame ${currentFrame + 1}/${frameCount} at ${currentTime.toFixed(2)}s`);
          
          video.currentTime = currentTime;
          video.onseeked = () => {
            try {
              ctx.drawImage(video, 0, 0, width, height);
              gif.addFrame(canvas, { delay: frameDelay });
              currentFrame++;
              setTimeout(captureFrame, 100); // Small delay between frames
            } catch (error) {
              console.error('❌ Frame capture error:', error);
              reject(error);
            }
          };
        };
        
        // Start frame capture
        setTimeout(captureFrame, 500); // Initial delay
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Video loading error:', error);
        reject(new Error('Failed to load video for GIF creation'));
      };
      
      // Load the video
      const videoURL = URL.createObjectURL(videoFile);
      video.src = videoURL;
      video.load();
      
      // Cleanup URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(videoURL);
      }, 60000);
    });
  }
};
