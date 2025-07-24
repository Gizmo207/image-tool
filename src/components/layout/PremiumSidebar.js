// PremiumSidebar.js - Stunning premium UI sidebar
import React, { useState, useRef } from 'react';
import { imageProcessor } from '../../utils/imageProcessor';
import './PremiumSidebar.css';

const PremiumSidebar = ({ onImageUpload, originalImage, setProcessedImage, setIsProcessing, hasProLicense }) => {
  console.log('🎨 PremiumSidebar render:', { 
    hasOriginalImage: !!originalImage, 
    originalImageDimensions: originalImage ? `${originalImage.width}x${originalImage.height}` : 'none',
    hasProLicense 
  });
  
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    console.log('🎯 PremiumSidebar: File selected:', file);
    if (file && file.type.startsWith('image/')) {
      console.log('✅ Valid image file, calling onImageUpload');
      onImageUpload(file);
      setActiveTab('resize');
    } else {
      console.log('❌ Invalid file type:', file?.type);
      alert('Please select a valid image file (JPG, PNG, GIF, WebP)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleResize = async (width, height) => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const resizedDataUrl = await imageProcessor.resize(originalImage, width, height);
      if (resizedDataUrl) {
        setProcessedImage(resizedDataUrl);
      }
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Error resizing image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const socialPresets = [
    { name: "Instagram Square", width: 1080, height: 1080, icon: "📷" },
    { name: "Discord Avatar", width: 512, height: 512, icon: "🎮" },
    { name: "YouTube Thumbnail", width: 1280, height: 720, icon: "📺" },
    { name: "Twitter Header", width: 1500, height: 500, icon: "🐦" },
    { name: "Facebook Cover", width: 1200, height: 630, icon: "📘" },
    { name: "LinkedIn Banner", width: 1584, height: 396, icon: "💼" }
  ];

  return (
    <div className="premium-sidebar">
      <div className="sidebar-content">
        {/* App Header */}
        <div className="app-header">
          <h1 className="app-title">Image Editor Pro</h1>
          <p className="app-subtitle">Professional Image Processing Suite</p>
          {hasProLicense && <div className="pro-badge">✨ PRO</div>}
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="section-title">
            <span className="status-dot upload"></span>
            📁 Upload Image
          </h2>
          
          <div 
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">🎨</div>
            <div className="upload-text">
              {originalImage ? 'Image Loaded - Upload New' : 'Drop image here or click to browse'}
            </div>
            <div className="upload-hint">
              Supports JPG, PNG, GIF, WebP up to 10MB
            </div>
            
            {!originalImage && (
              <div className="tools-preview">
                <p className="preview-title">� Step 1: Upload an image above ☝️</p>
                <div className="step-indicator">
                  <span className="step current">1️⃣ Upload Image</span>
                  <span className="step-arrow">→</span>
                  <span className="step next">2️⃣ Choose Tool</span>
                  <span className="step-arrow">→</span>
                  <span className="step next">3️⃣ Process & Download</span>
                </div>
                <p className="preview-subtitle">🔧 Tools that will unlock:</p>
                <div className="preview-tools">
                  <span className="preview-tool">📷 Social Media Resize</span>
                  <span className="preview-tool">✂️ AI Background Removal</span>
                  <span className="preview-tool">🔄 Format Converter</span>
                  <span className="preview-tool">🎨 Premium Filters</span>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>

          {originalImage && (
            <div className="image-info">
              <span className="info-label">📏 Original:</span>
              <span className="info-value">{originalImage.width} × {originalImage.height}px</span>
            </div>
          )}
        </div>

        {/* Tools Container */}
        {originalImage && (
          <div className="tools-container">
            
            {/* Resize Tool */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🔧</div>
                <div className="tool-info">
                  <h3>Smart Resize</h3>
                  <p>Resize images with social media presets and custom dimensions</p>
                </div>
              </div>

              <div className="preset-grid">
                {socialPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="preset-btn"
                    onClick={() => handleResize(preset.width, preset.height)}
                    title={`${preset.width} × ${preset.height}px`}
                  >
                    <span className="preset-icon">{preset.icon}</span>
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-size">{preset.width}×{preset.height}</span>
                  </button>
                ))}
              </div>

              <button className="tool-button" onClick={() => setActiveTab('resize-custom')}>
                ✏️ Custom Dimensions
              </button>
            </div>

            {/* Background Remover Tool */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">✂️</div>
                <div className="tool-info">
                  <h3>AI Background Remover</h3>
                  <p>Remove backgrounds with professional AI processing</p>
                </div>
              </div>
              
              <button 
                className="tool-button"
                onClick={() => alert('Background removal feature - integrate with your existing BackgroundRemover component')}
              >
                🎭 Remove Background
              </button>
            </div>

            {/* Format Converter Tool */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🔄</div>
                <div className="tool-info">
                  <h3>Format Converter</h3>
                  <p>Convert between JPG, PNG, WebP, and other formats</p>
                </div>
              </div>
              
              <div className="format-buttons">
                <button className="format-btn" onClick={() => alert('Convert to JPG')}>JPG</button>
                <button className="format-btn" onClick={() => alert('Convert to PNG')}>PNG</button>
                <button className="format-btn" onClick={() => alert('Convert to WebP')}>WebP</button>
                <button className="format-btn" onClick={() => alert('Convert to GIF')}>GIF</button>
              </div>
            </div>

            {/* Filters Tool */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🎨</div>
                <div className="tool-info">
                  <h3>Premium Filters</h3>
                  <p>Professional photo filters and adjustments</p>
                </div>
              </div>
              
              <button 
                className="tool-button"
                onClick={() => alert('Filters feature - integrate with your existing FilterControls component')}
              >
                ✨ Apply Filters
              </button>
            </div>

            {/* Batch Processing Tool */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">⚡</div>
                <div className="tool-info">
                  <h3>Batch Processing</h3>
                  <p>Process multiple images simultaneously</p>
                </div>
              </div>
              
              <button 
                className="tool-button"
                disabled={!hasProLicense}
                onClick={() => alert('Batch processing - PRO feature')}
              >
                {hasProLicense ? '🔥 Batch Process' : '🔒 Upgrade to Pro'}
              </button>
            </div>

          </div>
        )}

        {/* Pro Upgrade Section */}
        {!hasProLicense && (
          <div className="upgrade-section">
            <div className="upgrade-card">
              <h3>🚀 Upgrade to Pro</h3>
              <p>Unlock unlimited processing, batch operations, and premium filters</p>
              <button className="upgrade-button">
                ✨ Get Pro - $40
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PremiumSidebar;
