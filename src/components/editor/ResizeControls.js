// ResizeControls.js - Clean version with fixed presets and improved layout
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
      name: "Instagram Story (Vertical)",
      width: 1080,
      height: 1920,
      icon: "📱",
      description: "Instagram/Facebook Stories"
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
    },
    {
      name: "LinkedIn Post",
      width: 1200,
      height: 627,
      icon: "💼",
      description: "LinkedIn social media post"
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
    const widthValue = parseInt(newWidth) || 0;
    setWidth(widthValue);
    if (maintainAspect && originalAspectRatio && widthValue > 0) {
      setHeight(Math.round(widthValue / originalAspectRatio));
    }
  };

  // Handle height change with aspect ratio
  const handleHeightChange = (newHeight) => {
    const heightValue = parseInt(newHeight) || 0;
    setHeight(heightValue);
    if (maintainAspect && originalAspectRatio && heightValue > 0) {
      setWidth(Math.round(heightValue * originalAspectRatio));
    }
  };

  // Apply preset dimensions
  const applyPreset = (preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    // Temporarily disable aspect ratio for presets since they have specific dimensions
    setMaintainAspect(false);
  };

  // Check if dimensions have changed
  const hasChanges = originalImage && 
    (parseInt(width) !== originalImage.width || parseInt(height) !== originalImage.height);

  // Handle resize
  const handleApplyResize = () => {
    if (!originalImage || !hasChanges) return;
    
    const newWidth = parseInt(width);
    const newHeight = parseInt(height);
    
    if (newWidth > 0 && newHeight > 0 && newWidth <= 4000 && newHeight <= 4000) {
      onResize(newWidth, newHeight);
    }
  };

  if (!originalImage) {
    return (
      <div className="resize-controls">
        <div className="no-image-message">
          <p>� Upload an image to start resizing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resize-controls">
      {/* Current Image Info */}
      <div className="image-info-section">
        <div className="size-label">Size</div>
        <div className="current-dimensions">
          {originalImage.width} × {originalImage.height} px
        </div>
      </div>

      {/* Quick Presets Section */}
      <div className="presets-section">
        <h4>🎯 Quick Presets</h4>
        <div className="preset-grid">
          {POPULAR_PRESETS.map((preset, index) => (
            <button
              key={index}
              className="preset-btn"
              onClick={() => applyPreset(preset)}
              title={preset.description}
            >
              <span className="preset-icon">{preset.icon}</span>
              <div className="preset-info">
                <div className="preset-name">{preset.name}</div>
                <div className="preset-size">{preset.width}×{preset.height}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Size Controls */}
      <div className="manual-controls">
        <h4>✏️ Custom Dimensions</h4>
        
        <div className="dimension-inputs">
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="width-input">Width</label>
              <input
                id="width-input"
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                min="1"
                max="4000"
                placeholder="Width"
              />
              <span className="unit">px</span>
            </div>
            
            <div className="dimension-separator">×</div>
            
            <div className="input-group">
              <label htmlFor="height-input">Height</label>
              <input
                id="height-input"
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                min="1"
                max="4000"
                placeholder="Height"
              />
              <span className="unit">px</span>
            </div>
          </div>
        </div>

        <div className="aspect-ratio-control">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
            />
            <span className="checkbox-text">🔗 Lock aspect ratio</span>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <div className="apply-section">
        {hasChanges && (
          <div className="resize-preview">
            ➡️ New size: <strong>{width} × {height} px</strong>
          </div>
        )}
        
        <button
          className={`apply-btn ${hasChanges ? 'ready' : 'disabled'}`}
          onClick={handleApplyResize}
          disabled={!hasChanges}
        >
          {hasChanges ? '✅ Apply Resize' : '⚪ No Changes'}
        </button>
      </div>
    </div>
  );
};

export default ResizeControls;
