// PremiumSidebar.js - Stunning premium UI sidebar
import React, { useState, useRef, useEffect } from 'react';
import { imageProcessor } from '../../utils/imageProcessor';
import './PremiumSidebar.css';

const PremiumSidebar = ({ onImageUpload, originalImage, setProcessedImage, setIsProcessing, isProcessing, setProcessedFormat, hasProLicense }) => {
  console.log('🎨 PremiumSidebar render:', { 
    hasOriginalImage: !!originalImage, 
    originalImageDimensions: originalImage ? `${originalImage.width}x${originalImage.height}` : 'none',
    hasProLicense 
  });
  
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Update custom dimensions when image changes
  useEffect(() => {
    if (originalImage) {
      setCustomWidth(originalImage.width.toString());
      setCustomHeight(originalImage.height.toString());
    }
  }, [originalImage]);

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
    
    // Update the custom width/height to reflect the chosen dimensions
    setCustomWidth(width.toString());
    setCustomHeight(height.toString());
    
    setIsProcessing(true);
    try {
      const resizedDataUrl = await imageProcessor.resize(originalImage, width, height);
      setProcessedImage(resizedDataUrl);
      setProcessedFormat('png'); // Reset to PNG after resize
    } catch (error) {
      console.error('Resize failed:', error);
      alert('Failed to resize image. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleCustomResize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0 && width <= 4000 && height <= 4000) {
      handleResize(width, height);
    } else {
      alert('Please enter valid dimensions (1-4000 pixels)');
    }
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
  };

  const handleFormatConvert = async () => {
    if (!originalImage || !selectedFormat) return;
    
    setIsProcessing(true);
    setConversionSuccess(false);
    try {
      const convertedDataUrl = await imageProcessor.convert(originalImage, selectedFormat);
      setProcessedImage(convertedDataUrl);
      setProcessedFormat(selectedFormat); // Update the format state
      
      // Show success feedback
      setConversionSuccess(true);
      setSuccessMessage(`✨ Successfully converted to ${selectedFormat.toUpperCase()}! Your image is ready to download. 📥`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setConversionSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Format conversion failed:', error);
      alert('Failed to convert format. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleFilter = async (filterType) => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const filteredDataUrl = await imageProcessor.filter(originalImage, filterType);
      setProcessedImage(filteredDataUrl);
      setProcessedFormat('png'); // Reset to PNG after filter
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
      setProcessedFormat(format); // Update format
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

        </section>

        {originalImage && (
          <div className="tools-container">
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">📷</div>
                <div className="tool-info">
                  <h3>Social Media Resize</h3>
                  <p>Perfect sizes for Instagram, Facebook, Twitter and Discord</p>
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
                <button className="preset-btn" onClick={() => handleResize(512, 512)}>
                  <span className="preset-icon">🎮</span>
                  <span className="preset-name">Discord</span>
                  <span className="preset-size">512×512</span>
                </button>
              </div>
              
              {/* Custom Size Inputs */}
              <div className="custom-resize-section">
                <h4>✏️ Custom Size</h4>
                <div className="custom-inputs">
                  <div className="input-row">
                    <div className="input-group">
                      <label>Width</label>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min="1"
                        max="4000"
                        placeholder="Width"
                      />
                      <span className="unit">px</span>
                    </div>
                    
                    <div className="dimension-separator">×</div>
                    
                    <div className="input-group">
                      <label>Height</label>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        min="1"
                        max="4000"
                        placeholder="Height"
                      />
                      <span className="unit">px</span>
                    </div>
                  </div>
                  
                  {/* Final Dimensions Display */}
                  <div className="final-dimensions">
                    <span className="dimensions-label">Final Size:</span>
                    <span className="dimensions-value">
                      {customWidth || originalImage?.width || 0} × {customHeight || originalImage?.height || 0}px
                    </span>
                  </div>
                  
                  <button 
                    className="custom-resize-btn"
                    onClick={handleCustomResize}
                    disabled={!customWidth || !customHeight || customWidth === originalImage?.width.toString() && customHeight === originalImage?.height.toString()}
                  >
                    ✅ Apply Custom Size
                  </button>
                </div>
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
                <button 
                  className={`format-btn ${selectedFormat === 'png' ? 'selected' : ''}`}
                  onClick={() => handleFormatSelect('png')}
                >
                  PNG
                </button>
                <button 
                  className={`format-btn ${selectedFormat === 'jpg' ? 'selected' : ''}`}
                  onClick={() => handleFormatSelect('jpg')}
                >
                  JPG
                </button>
                <button 
                  className={`format-btn ${selectedFormat === 'webp' ? 'selected' : ''}`}
                  onClick={() => handleFormatSelect('webp')}
                >
                  WebP
                </button>
                <button 
                  className={`format-btn ${selectedFormat === 'gif' ? 'selected' : ''}`}
                  onClick={() => handleFormatSelect('gif')}
                  title="Create GIF - Upload video/multiple images for animation, or single image for static GIF"
                >
                  GIF
                </button>
              </div>
              
              <button 
                className={`tool-button ${isProcessing ? 'processing' : ''} ${selectedFormat && !isProcessing ? 'ready' : ''}`}
                onClick={handleFormatConvert}
                disabled={!selectedFormat || !originalImage || isProcessing}
              >
                {isProcessing ? (
                  <>🔄 Converting...</>
                ) : (
                  <>🔄 Convert to {selectedFormat ? selectedFormat.toUpperCase() : 'Format'}</>
                )}
              </button>
              
              {conversionSuccess && (
                <div className="success-notification">
                  <div className="success-icon">✅</div>
                  <div className="success-message">{successMessage}</div>
                </div>
              )}
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
