// GIF creation utility using gif.js
import GIF from 'gif.js';

export const gifCreator = {
  // Create animated GIF from video
  createGifFromVideo(videoFile, options = {}) {
    return new Promise((resolve, reject) => {
      console.log('🎥 Starting video to GIF conversion:', {
        fileName: videoFile.name,
        fileSize: Math.round(videoFile.size / 1024) + 'KB',
        fileType: videoFile.type,
        options
      });

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
      
      // Timeout to prevent infinite waiting
      const timeout = setTimeout(() => {
        console.error('⏰ Video processing timeout after 30 seconds');
        reject(new Error('Video processing timeout - file might be corrupted or too large'));
      }, 30000);
      
      video.onloadedmetadata = () => {
        console.log('📹 Video metadata loaded:', {
          duration: video.duration + 's',
          dimensions: video.videoWidth + 'x' + video.videoHeight,
          plannedGifDuration: duration + 's',
          plannedFrames: Math.floor(duration * fps)
        });
        
        clearTimeout(timeout);
        
        canvas.width = width;
        canvas.height = height;
        
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: canvas.width,
          height: canvas.height
        });
        
        // Progress tracking
        gif.on('progress', function(progress) {
          console.log('🔄 GIF encoding progress:', Math.round(progress * 100) + '%');
        });
        
        const frameCount = Math.floor(duration * fps);
        const frameDelay = 1000 / fps; // Delay in milliseconds
        let currentFrame = 0;
        
        console.log('🎬 Starting frame capture...');
        
        const captureFrame = () => {
          const currentTime = startTime + (currentFrame / fps);
          
          if (currentFrame >= frameCount || currentTime >= video.duration) {
            console.log('✅ All frames captured, starting GIF encoding...');
            
            gif.on('finished', function(blob) {
              console.log('🎉 Video to GIF conversion complete!', {
                finalSize: Math.round(blob.size / 1024) + 'KB',
                framesCaptured: currentFrame,
                duration: duration + 's'
              });
              
              const reader = new FileReader();
              reader.onload = () => {
                console.log('📝 GIF data URL created successfully');
                resolve(reader.result);
              };
              reader.onerror = (error) => {
                console.error('❌ FileReader error:', error);
                reject(error);
              };
              reader.readAsDataURL(blob);
            });
            
            gif.on('error', (error) => {
              console.error('❌ GIF encoding error:', error);
              reject(error);
            });
            
            gif.render();
            return;
          }
          
          console.log(`📸 Capturing frame ${currentFrame + 1}/${frameCount} at ${currentTime.toFixed(2)}s`);
          
          video.currentTime = currentTime;
          video.onseeked = () => {
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              gif.addFrame(canvas, { delay: frameDelay });
              currentFrame++;
              setTimeout(captureFrame, 50); // Small delay to ensure frame is ready
            } catch (error) {
              console.error('❌ Frame capture error:', error);
              reject(error);
            }
          };
        };
        
        captureFrame();
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Video loading error:', error);
        reject(new Error('Failed to load video file - format might not be supported'));
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  },

  // Check if file is video
  isVideoFile(file) {
    return file.type.startsWith('video/');
  },

  // Get video info
  getVideoInfo(videoFile) {
    return new Promise((resolve, reject) => {
      console.log('📹 Getting video information for:', videoFile.name);
      
      const video = document.createElement('video');
      
      const timeout = setTimeout(() => {
        console.error('⏰ Video info timeout after 15 seconds');
        reject(new Error('Video info timeout - file might be corrupted or too large'));
      }, 15000);
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        const info = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        };
        console.log('✅ Video info retrieved:', info);
        resolve(info);
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Video info error:', error);
        reject(new Error('Failed to get video information - format might not be supported'));
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  }
};
