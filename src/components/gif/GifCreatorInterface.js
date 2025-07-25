import React, { useState, useRef, useEffect } from 'react';
import { bulletproofGifCreator } from '../../utils/bulletproofGifCreator';

const GifCreatorInterface = ({ videoFile, onGifCreated, onError, onProgressUpdate }) => {
  const [videoInfo, setVideoInfo] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  
  // User settings
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);
  const [quality, setQuality] = useState(10);
  
  const videoRef = useRef(null);
  
  // Load video info when component mounts
  useEffect(() => {
    if (videoFile) {
      loadVideoInfo();
    }
  }, [videoFile]);
  
  const loadVideoInfo = async () => {
    try {
      console.log('📹 Loading video info...');
      const info = await bulletproofGifCreator.getVideoInfo(videoFile);
      setVideoInfo(info);
      
      // Set smart defaults based on video
      const maxDuration = Math.min(5, info.duration);
      setDuration(maxDuration);
      
      // Calculate optimal size maintaining aspect ratio
      const targetWidth = 320;
      const calculatedHeight = Math.round(targetWidth / info.aspectRatio);
      setWidth(targetWidth);
      
      console.log('✅ Video info loaded:', info);
      
    } catch (error) {
      console.error('❌ Failed to load video info:', error);
      onError?.(error.message);
    }
  };
  
  const createGif = async () => {
    if (!videoFile || !videoInfo) return;
    
    setIsCreating(true);
    setProgress('🎬 Starting GIF creation...');
    setProgressPercent(0);
    onProgressUpdate?.({ isCreating: true, progress: 0, message: '🎬 Starting GIF creation...' });
    
    try {
      const options = {
        startTime: parseFloat(startTime),
        duration: parseFloat(duration),
        fps: parseInt(fps),
        width: parseInt(width),
        height: Math.round(width / videoInfo.aspectRatio),
        quality: parseInt(quality)
      };
      
      console.log('🎯 Creating GIF with options:', options);
      setProgress('📸 Capturing video frames...');
      setProgressPercent(20);
      onProgressUpdate?.({ isCreating: true, progress: 20, message: '📸 Capturing video frames...' });
      
      const gifDataUrl = await bulletproofGifCreator.createGifFromVideo(videoFile, options, (frameProgress) => {
        // Frame capture progress (20% to 60%)
        const captureProgress = 20 + (frameProgress * 40);
        setProgressPercent(captureProgress);
        onProgressUpdate?.({ isCreating: true, progress: captureProgress, message: `📸 Capturing frame ${Math.round(frameProgress * 100)}%...` });
      });
      
      setProgress('🎬 Encoding GIF...');
      setProgressPercent(60);
      onProgressUpdate?.({ isCreating: true, progress: 60, message: '🎬 Encoding GIF...' });
      
      // Simulate encoding progress
      for (let i = 60; i <= 95; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgressPercent(i);
        onProgressUpdate?.({ isCreating: true, progress: i, message: '🎬 Encoding GIF...' });
      }
      
      setProgress('✅ GIF created successfully!');
      setProgressPercent(100);
      onProgressUpdate?.({ isCreating: true, progress: 100, message: '✅ GIF created successfully!' });
      onGifCreated?.(gifDataUrl);
      
      // Clear progress after 2 seconds
      setTimeout(() => {
        setProgress('');
        setProgressPercent(0);
        onProgressUpdate?.({ isCreating: false, progress: 0, message: '' });
      }, 2000);
      
    } catch (error) {
      console.error('❌ GIF creation failed:', error);
      setProgress('❌ Failed to create GIF');
      setProgressPercent(0);
      onProgressUpdate?.({ isCreating: false, progress: 0, message: '❌ Failed to create GIF' });
      onError?.(error.message);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setProgress('');
        onProgressUpdate?.({ isCreating: false, progress: 0, message: '' });
      }, 3000);
      
    } finally {
      setIsCreating(false);
    }
  };
  
  const previewAtTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };
  
  if (!videoFile) {
    return (
      <div className="gif-creator-empty">
        <div className="empty-icon">🎬</div>
        <p>Upload a video file to create GIFs</p>
      </div>
    );
  }
  
  return (
    <div className="gif-creator-interface">
      {/* Video Preview */}
      <div className="video-preview-section">
        <h4>📹 Video Preview</h4>
        <div className="video-container">
          <video
            ref={videoRef}
            src={URL.createObjectURL(videoFile)}
            controls
            width="100%"
            style={{ maxWidth: '400px', borderRadius: '8px' }}
          />
        </div>
        
        {videoInfo && (
          <div className="video-info">
            <span>📏 {videoInfo.width}×{videoInfo.height}</span>
            <span>⏱️ {videoInfo.duration.toFixed(1)}s</span>
            <span>📐 {videoInfo.aspectRatio.toFixed(2)}:1</span>
          </div>
        )}
      </div>
      
      {/* GIF Settings */}
      <div className="gif-settings-section">
        <h4>⚙️ GIF Settings</h4>
        
        <div className="setting-group">
          <label>
            <span>⏰ Start Time: {startTime}s</span>
            <input
              type="range"
              min="0"
              max={videoInfo?.duration || 10}
              step="0.1"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                previewAtTime(parseFloat(e.target.value));
              }}
              className="time-slider"
            />
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            <span>⏳ Duration: {duration}s</span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="duration-slider"
            />
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            <span>🎞️ Frame Rate: {fps} fps</span>
            <input
              type="range"
              min="6"
              max="15"
              step="1"
              value={fps}
              onChange={(e) => setFps(e.target.value)}
              className="fps-slider"
            />
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            <span>📐 Width: {width}px</span>
            <input
              type="range"
              min="240"
              max="480"
              step="20"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="width-slider"
            />
          </label>
        </div>
        
        <div className="setting-preview">
          <div className="preview-info">
            <strong>📊 GIF Preview:</strong><br/>
            Size: {width}×{Math.round(width / (videoInfo?.aspectRatio || 1))}px<br/>
            Frames: ~{Math.floor(duration * fps)} frames<br/>
            Est. Size: ~{Math.round((width * Math.round(width / (videoInfo?.aspectRatio || 1)) * duration * fps) / 1000)}KB
          </div>
        </div>
      </div>
      
      {/* Create Button */}
      <div className="create-section">
        <button
          onClick={createGif}
          disabled={isCreating || !videoInfo}
          className={`create-gif-button ${isCreating ? 'creating' : ''}`}
        >
          {isCreating ? '🔄 Creating GIF...' : '🎬 Create GIF'}
        </button>
        
        {progress && (
          <div className="progress-message">
            {progress}
          </div>
        )}
      </div>
    </div>
  );
};

export default GifCreatorInterface;
