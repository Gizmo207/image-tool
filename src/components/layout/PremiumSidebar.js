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
      setProcessedImage(resizedDataUrl);
    } catch (error) {
      console.error('Resize failed:', error);
      alert('Failed to resize image. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleFilter = async (filterType) => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const filteredDataUrl = await imageProcessor.filter(originalImage, filterType);
      setProcessedImage(filteredDataUrl);
    } catch (error) {
      console.error('Filter failed:', error);
      alert('Failed to apply filter. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleFormat = async (format) => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const convertedDataUrl = await imageProcessor.convert(originalImage, format);
      setProcessedImage(convertedDataUrl);
    } catch (error) {
      console.error('Format conversion failed:', error);
      alert('Failed to convert format. Please try again.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="premium-sidebar">
      <div className="sidebar-content">
        <header className="app-header">
          <h1 className="app-title">Image Editor</h1>
          <p className="app-subtitle">Professional Image Processing</p>
          {hasProLicense && <div className="pro-badge">PRO</div>}
        </header>

        <section className="upload-section">
          <h2 className="section-title">
            <span className="status-dot upload"></span>
            Upload Image
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
              <div className="step-indicator">
                <span className="step current">1️⃣ Upload Image</span>
                <span className="step next">2️⃣ Choose Tool</span>
                <span className="step next">3️⃣ Process & Download</span>
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
              <span className="info-label">Size:</span>
              <span className="info-value">{originalImage.width} × {originalImage.height}px</span>
            </div>
          )}
        </section>

        {originalImage && (
          <div className="tools-container">
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">📷</div>
                <div className="tool-info">
                  <h3>Social Media Resize</h3>
                  <p>Perfect sizes for Instagram, Facebook, Twitter and more</p>
                </div>
              </div>
              
              <div className="preset-grid">
                <button className="preset-btn" onClick={() => handleResize(1080, 1080)}>
                  <span className="preset-icon">📱</span>
                  <span className="preset-name">Instagram</span>
                  <span className="preset-size">1080×1080</span>
                </button>
                <button className="preset-btn" onClick={() => handleResize(1200, 630)}>
                  <span className="preset-icon">📘</span>
                  <span className="preset-name">Facebook</span>
                  <span className="preset-size">1200×630</span>
                </button>
                <button className="preset-btn" onClick={() => handleResize(1024, 512)}>
                  <span className="preset-icon">🐦</span>
                  <span className="preset-name">Twitter</span>
                  <span className="preset-size">1024×512</span>
                </button>
                <button className="preset-btn" onClick={() => handleResize(1080, 1920)}>
                  <span className="preset-icon">📱</span>
                  <span className="preset-name">Story</span>
                  <span className="preset-size">1080×1920</span>
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🔄</div>
                <div className="tool-info">
                  <h3>Format Converter</h3>
                  <p>Convert between JPG, PNG, WebP formats</p>
                </div>
              </div>
              
              <div className="format-buttons">
                <button className="format-btn" onClick={() => handleFormat('png')}>PNG</button>
                <button className="format-btn" onClick={() => handleFormat('jpg')}>JPG</button>
                <button className="format-btn" onClick={() => handleFormat('webp')}>WebP</button>
                <button className="format-btn" onClick={() => handleFormat('gif')}>GIF</button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🎨</div>
                <div className="tool-info">
                  <h3>Premium Filters</h3>
                  <p>Professional photo effects and enhancements</p>
                </div>
              </div>
              
              <button className="tool-button" onClick={() => handleFilter('blur')}>
                Blur Effect
              </button>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">✂️</div>
                <div className="tool-info">
                  <h3>AI Background Removal</h3>
                  <p>Automatically remove backgrounds with AI</p>
                </div>
              </div>
              
              <button className="tool-button" onClick={() => handleFilter('remove-bg')}>
                Remove Background
              </button>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🔧</div>
                <div className="tool-info">
                  <h3>Quick Tools</h3>
                  <p>Essential image editing functions</p>
                </div>
              </div>
              
              <button className="tool-button" onClick={() => handleFilter('grayscale')}>
                Grayscale
              </button>
            </div>
          </div>
        )}

        <section className="upgrade-section">
          <div className="upgrade-card">
            <h3>Unlock Premium Features</h3>
            <p>Get access to advanced AI tools, unlimited exports, and premium filters</p>
            <button className="upgrade-button">Upgrade to Pro</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PremiumSidebar;
