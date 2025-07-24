// ResizeControls.js - Improved version with popular social media presets
import React, { useState, useEffect } from 'react';

const ResizeControls = ({ originalImage, onResize }) => {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

  // Popular preset sizes for social media and common use cases
  const POPULAR_PRESETS = [
    {
      name: "Instagram Square",
      width: 1080,
      height: 1080,
      icon: "📷",
      description: "Perfect for Instagram posts"
    },
    {
      name: "Discord Avatar",
      width: 512,
      height: 512,
      icon: "🎮",
      description: "Discord profile picture"
    },
    {
      name: "YouTube Thumbnail",
      width: 1280,
      height: 720,
      icon: "📺",
      description: "YouTube video thumbnail"
    },
    {
      name: "Twitter Header",
      width: 1500,
      height: 500,
      icon: "🐦",
      description: "Twitter profile header"
    }
  ];

  // Update dimensions when image changes
  useEffect(() => {
    if (originalImage) {
      setWidth(originalImage.width);
      setHeight(originalImage.height);
      setOriginalAspectRatio(originalImage.width / originalImage.height);
    }
  }, [originalImage]);

  // Handle width change with aspect ratio
  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);
    if (maintainAspect && originalImage) {
      setHeight(Math.round(newWidth / originalAspectRatio));
    }
  };

  // Handle height change with aspect ratio
  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    if (maintainAspect && originalImage) {
      setWidth(Math.round(newHeight * originalAspectRatio));
    }
  };

  // Apply preset dimensions
  const applyPreset = (preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    // Temporarily disable aspect ratio for presets
    setMaintainAspect(false);
  };

  // Check if dimensions have changed
  const hasChanges = originalImage && 
    (parseInt(width) !== originalImage.width || parseInt(height) !== originalImage.height);

  // Handle resize
  const handleResize = () => {
    if (!originalImage || !hasChanges) return;
    
    const newWidth = parseInt(width);
    const newHeight = parseInt(height);
    
    if (newWidth > 0 && newHeight > 0) {
      onResize(newWidth, newHeight);
    }
  };

  return (
    <div className="resize-controls">
      <h3>🔧 Resize Settings</h3>
      
      {/* Original Image Info */}
      {originalImage && (
        <div className="image-info">
          <p><strong>Original:</strong> {originalImage.width} × {originalImage.height}px</p>
        </div>
      )}

      {/* Popular Presets */}
      <div className="presets-section">
        <h4>🎯 Quick Presets</h4>
        <div className="preset-buttons">
          {POPULAR_PRESETS.map((preset, index) => (
            <button
              key={index}
              className="preset-btn"
              onClick={() => applyPreset(preset)}
              title={preset.description}
            >
              {preset.icon} {preset.name}
              <small>{preset.width}×{preset.height}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="manual-controls">
        <h4>✏️ Custom Size</h4>
        
        <div className="dimension-inputs">
          <div className="input-group">
            <label>Width (px):</label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="1"
              max="4000"
            />
          </div>
          
          <div className="input-group">
            <label>Height (px):</label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="1"
              max="4000"
            />
          </div>
        </div>

        <div className="aspect-ratio-control">
          <label>
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
            />
            🔗 Lock aspect ratio
          </label>
        </div>
      </div>

      {/* Status and Resize Button */}
      <div className="resize-status">
        {originalImage && (
          <div className={`status-indicator ${hasChanges ? 'ready' : 'no-change'}`}>
            {hasChanges ? (
              <p>✅ Ready to resize to {width} × {height}px</p>
            ) : (
              <p>⚪ No changes - same as original</p>
            )}
          </div>
        )}
        
        <button
          className="resize-btn"
          onClick={handleResize}
          disabled={!originalImage || !hasChanges}
        >
          🔄 Apply Resize
        </button>
      </div>
    </div>
  );
};

export default ResizeControls;
