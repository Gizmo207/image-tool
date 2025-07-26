import React, { useState, useRef, useEffect } from 'react';
import { bulletproofGifCreator } from '../../utils/bulletproofGifCreator';

const GifCreatorInterface = ({ videoFile, originalImage, onGifCreated, onError, onProgressUpdate }) => {
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
    // Use videoFile if available, otherwise use original video from main canvas
    const sourceVideoFile = videoFile || (originalImage?.isVideoPreview ? originalImage.originalVideoFile : null);
    
    if (!sourceVideoFile) {
      alert('No video file available for GIF creation. Please upload a video file.');
      return;
    }
    
    setIsCreating(true);
    setProgress('Starting GIF creation...');
    setProgressPercent(0);
    
    try {
      const options = {
        startTime: parseFloat(startTime),
        duration: parseFloat(duration),
        fps: parseInt(fps),
        width: parseInt(width),
        height: Math.round(width / (videoInfo?.aspectRatio || originalImage?.width / originalImage?.height || 1)),
        quality: parseInt(quality)
      };
      
      console.log('🎯 Creating GIF with options:', options);
      setProgress('Capturing video frames...');
      setProgressPercent(20);
      
      const gifDataUrl = await bulletproofGifCreator.createGifFromVideo(sourceVideoFile, options, (frameProgress) => {
        // Frame capture progress (20% to 60%)
        const captureProgress = 20 + (frameProgress * 40);
        setProgressPercent(captureProgress);
        setProgress(`Capturing frames... ${Math.round(frameProgress * 100)}%`);
      });
      
      setProgress('Encoding GIF...');
      setProgressPercent(60);
      
      // Simulate encoding progress
      for (let i = 60; i <= 95; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgressPercent(i);
        setProgress(`Encoding GIF... ${i}%`);
      }
      
      setProgress('GIF created successfully!');
      setProgressPercent(100);
      onGifCreated?.(gifDataUrl);
      
      // Clear progress after 2 seconds
      setTimeout(() => {
        setProgress('');
        setProgressPercent(0);
      }, 2000);
      
    } catch (error) {
      console.error('❌ GIF creation failed:', error);
      setProgress('Failed to create GIF');
      setProgressPercent(0);
      onError?.(error.message);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setProgress('');
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
  
  return (
    <div className="gif-creator-interface">
      {/* Video Preview */}
      <div className="video-preview-section">
        <h4>📹 Video Preview</h4>
        {videoFile ? (
          <div className="video-container">
            <video
              ref={videoRef}
              src={URL.createObjectURL(videoFile)}
              controls
              width="100%"
              style={{ maxWidth: '400px', borderRadius: '8px' }}
            />
          </div>
        ) : originalImage && originalImage.isVideoPreview && originalImage.originalVideoFile ? (
          <div className="video-container">
            <video
              src={URL.createObjectURL(originalImage.originalVideoFile)}
              controls
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '8px',
                border: '2px solid rgba(64, 224, 255, 0.3)',
                display: 'block'
              }}
            />
          </div>
        ) : originalImage ? (
          <div className="video-container">
            <img
              src={originalImage.src || originalImage}
              alt="Current canvas content"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '8px',
                border: '2px solid rgba(64, 224, 255, 0.3)',
                display: 'block'
              }}
            />
          </div>
        ) : (
          <div className="video-placeholder" style={{
            width: '100%',
            height: '200px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '2px dashed rgba(64, 224, 255, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px'
          }}>
            🎬 Video will appear here after upload
          </div>
        )}
        
        <div className="video-info">
          {videoInfo ? (
            <>
              <span>📏 {videoInfo.width}×{videoInfo.height}</span>
              <span>⏱️ {videoInfo.duration.toFixed(1)}s</span>
              <span>📐 {videoInfo.aspectRatio.toFixed(2)}:1</span>
            </>
          ) : originalImage && originalImage.isVideoPreview && originalImage.originalVideoFile ? (
            <>
              <span>📏 {originalImage.width}×{originalImage.height}</span>
              <span>⏱️ Video loaded</span>
              <span>📐 {(originalImage.width / originalImage.height).toFixed(2)}:1</span>
            </>
          ) : (
            <>
              <span>📏 720×1080</span>
              <span>⏱️ 5.0s</span>
              <span>📐 0.67:1</span>
            </>
          )}
        </div>
      </div>      {/* GIF Settings */}
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
          <div className="preview-info" style={{ 
            color: 'rgba(255,255,255,0.9)', 
            backgroundColor: 'rgba(25,25,45,0.8)', 
            padding: '12px', 
            borderRadius: '6px',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            <strong style={{ color: '#40e0ff' }}>📊 GIF Preview:</strong><br/>
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
          disabled={isCreating || (!videoFile && !(originalImage?.isVideoPreview && originalImage?.originalVideoFile))}
          className={`create-gif-button ${isCreating ? 'creating' : ''} ${(!videoFile && !(originalImage?.isVideoPreview && originalImage?.originalVideoFile)) ? 'disabled' : ''}`}
        >
          {isCreating ? 'Creating GIF...' : 'Create GIF'}
        </button>
        
        {/* Always show progress area to prevent layout shift */}
        <div className={`progress-message ${progress ? 'visible' : 'hidden'}`}>
          {progress || '\u00A0'}{/* Non-breaking space when no message */}
        </div>
      </div>
    </div>
  );
};

export default GifCreatorInterface;
