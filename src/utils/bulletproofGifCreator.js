// Bulletproof GIF Creator with gifshot library
import gifshot from 'gifshot';

export const bulletproofGifCreator = {
  
  // Create GIF from video with user-specified parameters
  async createGifFromVideo(videoFile, options = {}, progressCallback = null) {
    const {
      startTime = 0,      // When to start in the video (seconds)
      duration = 3,       // How long the GIF should be (seconds) 
      fps = 10,          // Frames per second (8-15 is good)
      width = 320,       // GIF width (smaller = smaller file)
      height = 240,      // GIF height
      quality = 10       // GIF quality (1-20, lower = better quality but larger file)
    } = options;
    
    console.log('🎬 Starting bulletproof GIF creation:', {
      file: videoFile.name,
      startTime: startTime + 's',
      duration: duration + 's', 
      fps: fps + ' fps',
      dimensions: width + 'x' + height,
      estimatedFrames: Math.floor(duration * fps)
    });
    
    return new Promise((resolve, reject) => {
      // Create video element
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';
      
      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      
      // Timeout protection
      const timeout = setTimeout(() => {
        console.error('⏰ GIF creation timeout after 60 seconds');
        reject(new Error('GIF creation took too long. Try a shorter duration or smaller size.'));
      }, 60000);
      
      // When video metadata is loaded
      video.onloadedmetadata = async () => {
        try {
          console.log('📹 Video loaded:', {
            totalDuration: video.duration.toFixed(2) + 's',
            videoDimensions: video.videoWidth + 'x' + video.videoHeight
          });
          
          // Validate parameters
          if (startTime >= video.duration) {
            throw new Error(`Start time (${startTime}s) is beyond video duration (${video.duration.toFixed(1)}s)`);
          }
          
          const actualDuration = Math.min(duration, video.duration - startTime);
          const frameCount = Math.floor(actualDuration * fps);
          const frameDelay = 1000 / fps; // Delay between frames in milliseconds
          
          console.log('🎯 Creating GIF with:', {
            actualDuration: actualDuration + 's',
            frameCount: frameCount + ' frames',
            frameDelay: frameDelay + 'ms per frame'
          });
          
          // Use a simpler approach - create frames as images and combine them
          const frames = [];
          let currentFrame = 0;
          
          const captureFrame = () => {
            if (currentFrame >= frameCount) {
              console.log('📸 All frames captured, creating GIF...');
              console.log('Frame data lengths:', frames.map(f => f.length));
              progressCallback?.(1.0); // 100% frame capture complete
              createGifFromFrames(frames, frameDelay)
                .then(resolve)
                .catch(reject);
              return;
            }
            
            const frameTime = startTime + (currentFrame * actualDuration / frameCount);
            console.log(`📸 Capturing frame ${currentFrame + 1}/${frameCount} at ${frameTime.toFixed(2)}s`);
            
            video.currentTime = frameTime;
            
            video.onseeked = () => {
              try {
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, width, height);
                
                // Convert to image data - use JPEG for smaller size
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                frames.push(imageData);
                
                console.log(`✅ Frame ${currentFrame + 1} captured (${imageData.length} bytes)`);
                
                currentFrame++;
                
                // Report progress
                const frameProgress = currentFrame / frameCount;
                progressCallback?.(frameProgress);
                
                // Small delay before next frame
                setTimeout(captureFrame, 150);
                
              } catch (error) {
                console.error('❌ Frame capture error:', error);
                reject(error);
              }
            };
          };
          
          // Start capturing frames
          setTimeout(captureFrame, 500);
          
        } catch (error) {
          clearTimeout(timeout);
          console.error('❌ Video processing error:', error);
          reject(error);
        }
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Video loading error:', error);
        reject(new Error('Failed to load video file. Please check the format.'));
      };
      
      // Load the video
      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;
      
      // Cleanup function
      const cleanup = () => {
        URL.revokeObjectURL(videoUrl);
        clearTimeout(timeout);
      };
      
      // Auto cleanup after timeout
      setTimeout(cleanup, 65000);
    });
    
    // Function to create GIF from captured frames
    async function createGifFromFrames(frames, delay) {
      console.log('🔄 Creating animated GIF from', frames.length, 'frames...');
      
      return new Promise((resolve, reject) => {
        if (frames.length === 0) {
          reject(new Error('No frames captured'));
          return;
        }
        
        const gifshotOptions = {
          images: frames,
          gifWidth: width,
          gifHeight: height,
          interval: Math.max(0.05, delay / 1000), // At least 50ms per frame, but respect user setting
          numFrames: frames.length,
          sampleInterval: 1,
          numWorkers: 2,
          repeat: 0, // 0 = infinite loop
          quality: 10, // Quality setting
          progressCallback: (captureProgress) => {
            console.log('🎬 GIF encoding progress:', Math.round(captureProgress * 100) + '%');
          }
        };

        console.log('🎬 Using gifshot with options:', {
          ...gifshotOptions,
          images: `${frames.length} frames`,
          interval: gifshotOptions.interval + 's per frame'
        });

        gifshot.createGIF(gifshotOptions, (obj) => {
          if (!obj.error) {
            console.log('✅ Animated GIF created successfully!');
            resolve(obj.image);
          } else {
            console.error('❌ Gifshot error:', obj.error);
            reject(new Error('Failed to create animated GIF: ' + obj.error));
          }
        });
      });
    }
  },
  
  // Get video information for user interface
  async getVideoInfo(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'metadata';
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout getting video information'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        const info = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight
        };
        console.log('📹 Video info:', info);
        resolve(info);
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error('Failed to get video information'));
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  },
  
  // Check if browser supports GIF creation
  checkSupport() {
    return {
      canvas: !!document.createElement('canvas').getContext,
      video: !!document.createElement('video').canPlayType,
      fileReader: !!window.FileReader,
      objectUrl: !!window.URL.createObjectURL
    };
  }
};
