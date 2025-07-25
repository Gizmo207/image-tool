// PremiumSidebar.js - Stunning premium UI sidebar
import React, { useState, useRef, useEffect } from 'react';
import { imageProcessor } from '../../utils/imageProcessor';
import GifCreatorInterface from '../gif/GifCreatorInterface';
import './PremiumSidebar.css';
import '../gif/GifCreatorInterface.css';

const PremiumSidebar = ({ onImageUpload, originalImage, setProcessedImage, setIsProcessing, isProcessing, setProcessedFormat, hasProLicense, onGifProgressUpdate }) => {
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
  const [originalFile, setOriginalFile] = useState(null); // Store original file for GIF conversion
  const [processingStatus, setProcessingStatus] = useState(''); // Show current processing step
  const [processingTimeout, setProcessingTimeout] = useState(null);
  const [isVideoFile, setIsVideoFile] = useState(false); // Track if uploaded file is video
  const [isGifCreating, setIsGifCreating] = useState(false); // Track if GIF is being created
  const [showBgRemovalProgress, setShowBgRemovalProgress] = useState(false); // Track background removal progress
  const [usageLimiterReady, setUsageLimiterReady] = useState(false); // Track usageLimiter initialization
  const [videoFile, setVideoFile] = useState(null); // Track uploaded video file for GIF creation
  const fileInputRef = useRef(null);
  
  // Collapsible tool card states
  const [expandedCards, setExpandedCards] = useState({
    resize: false,
    colorTools: false,
    format: false,
    gifCreator: false,
    backgroundRemoval: false
  });
  
  // Fine-tuning adjustment values
  const [adjustmentValues, setAdjustmentValues] = useState({
    brightness: 0, // -100 to +100
    contrast: 0,   // -100 to +100
    saturation: 0  // -100 to +100
  });

  // Compute locked tools status from usageLimiter
  const getLockedToolsStatus = () => {
    if (!window.usageLimiter) {
      return {
        resize: { locked: false },
        filters: { locked: false },
        format: { locked: false },
        gifCreator: { locked: false },
        backgroundRemoval: { locked: false }
      };
    }

    const resizeStatus = window.usageLimiter.canUseTool('resize');
    const filtersStatus = window.usageLimiter.canUseTool('filters');
    const formatStatus = window.usageLimiter.canUseTool('format');
    const gifStatus = window.usageLimiter.canUseTool('gif-creator');
    const bgRemovalStatus = window.usageLimiter.canUseTool('background-removal');
    
    return {
      resize: {
        locked: !resizeStatus.allowed,
        upgradePrompt: resizeStatus.allowed ? null : {
          title: 'Resize Tool Trial Exhausted',
          message: 'You\'ve used your free resize. Get unlimited resizing with Pro.',
          cta: 'Unlock Unlimited Resizing'
        }
      },
      filters: {
        locked: !filtersStatus.allowed,
        upgradePrompt: filtersStatus.allowed ? null : {
          title: 'Filters Trial Exhausted',
          message: 'You\'ve used your free filter. Get unlimited filters with Pro.',
          cta: 'Unlock All Premium Filters'
        }
      },
      format: {
        locked: !formatStatus.allowed,
        upgradePrompt: formatStatus.allowed ? null : {
          title: 'Format Converter Trial Exhausted',
          message: 'You\'ve used your free conversion. Get unlimited conversions with Pro.',
          cta: 'Unlock Unlimited Conversions'
        }
      },
      gifCreator: {
        locked: !gifStatus.allowed,
        upgradePrompt: gifStatus.allowed ? null : {
          title: 'GIF Creator Trial Exhausted',
          message: 'You\'ve used your free GIF creation. Get unlimited GIF creation with Pro.',
          cta: 'Unlock Unlimited GIF Creation'
        }
      },
      backgroundRemoval: {
        locked: !bgRemovalStatus.allowed,
        upgradePrompt: bgRemovalStatus.allowed ? null : {
          title: 'Background Removal Trial Exhausted',
          message: 'You\'ve used your free background removal. Get unlimited removals with Pro.',
          cta: 'Unlock Unlimited Background Removal'
        }
      }
    };
  };

  const lockedTools = getLockedToolsStatus();

  // Check for usageLimiter initialization
  useEffect(() => {
    const checkUsageLimiter = () => {
      if (window.usageLimiter) {
        setUsageLimiterReady(true);
      } else {
        // Check again in 100ms if not ready
        setTimeout(checkUsageLimiter, 100);
      }
    };
    checkUsageLimiter();
  }, []);

  // Update custom dimensions when image changes
  useEffect(() => {
    if (originalImage) {
      setCustomWidth(originalImage.width.toString());
      setCustomHeight(originalImage.height.toString());
    }
  }, [originalImage]);

  // Toggle tool card expansion
  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  // Handle fine-tuning adjustments with sliders
  const handleAdjustmentChange = (type, value) => {
    const numValue = parseInt(value);
    setAdjustmentValues(prev => ({
      ...prev,
      [type]: numValue
    }));
    
    // Apply the adjustment with the new value
    handleFilterWithValue(type, numValue);
  };

  // Apply filter with specific value for fine-tuning
  const handleFilterWithValue = async (filterType, value) => {
    if (!originalImage) return;
    
    // Check trial limits for filters
    if (window.usageLimiter && ['brightness', 'contrast', 'saturation', 'vintage', 'vibrant', 'dramatic', 'dreamy', 'blur', 'sharp', 'grayscale'].includes(filterType)) {
      const canUse = window.usageLimiter.canUseTool('filters');
      if (!canUse.allowed) {
        alert('Trial limit reached! You\'ve used your free filter. Upgrade to Pro for unlimited filters.');
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      const filteredImage = await imageProcessor.filter(originalImage, filterType, value);
      setProcessedImage(filteredImage);
      
      // Record usage for filters (not adjustments)
      if (window.usageLimiter && ['vintage', 'vibrant', 'dramatic', 'dreamy', 'blur', 'sharp', 'grayscale'].includes(filterType)) {
        window.usageLimiter.recordUsage('filters', { filterType, value });
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file) => {
    console.log('🎯 PremiumSidebar: File selected:', file);
    
    // Accept both images and videos for GIF conversion
    const isValidFile = file && (
      file.type.startsWith('image/') || 
      file.type.startsWith('video/')
    );
    
    if (isValidFile) {
      console.log('✅ Valid file, calling onImageUpload');
      setOriginalFile(file); // Store the original file
      setIsVideoFile(file.type.startsWith('video/')); // Track if it's a video
      onImageUpload(file);
      setActiveTab('resize');
    } else {
      console.log('❌ Invalid file type:', file?.type);
      alert('Please select a valid image file (JPG, PNG, WebP) or video file for GIF conversion');
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
    
    // Check trial usage before proceeding
    const canUse = window.usageLimiter?.canUseTool('resize');
    if (canUse && !canUse.allowed) {
      const upgradePrompt = window.usageLimiter.getUpgradePrompt('resize');
      alert(`${upgradePrompt.title}\n\n${upgradePrompt.message}\n\nClick "${upgradePrompt.cta}" to unlock unlimited resizing!`);
      return;
    }
    
    // Update the custom width/height to reflect the chosen dimensions
    setCustomWidth(width.toString());
    setCustomHeight(height.toString());
    
    setIsProcessing(true);
    try {
      const resizedDataUrl = await imageProcessor.resize(originalImage, width, height);
      setProcessedImage(resizedDataUrl);
      setProcessedFormat('png'); // Reset to PNG after resize
      
      // Record usage for trial system
      if (window.usageLimiter) {
        const result = window.usageLimiter.recordUsage('resize', {
          width: width,
          height: height,
          aspectRatio: width / height
        });
        console.log('✅ Resize usage recorded:', result);
      }
      
    } catch (error) {
      console.error('Resize failed:', error);
      alert('Failed to resize image. Please try again.');
    }
    setIsProcessing(false);
  };

const handleCustomResize = () => {
  const width = parseInt(customWidth);
  const height = parseInt(customHeight);
  
  if (width && height && width > 0 && height > 0) {
    handleResize(width, height);
  } else {
    alert('Please enter valid dimensions (1-4000 pixels)');
  }
};

const handleFormatSelect = (format) => {
  setSelectedFormat(format);
};

const handleFormatConvert = async () => {
  if (!selectedFormat || !originalImage) return;
  
  // Check trial limits
  if (window.usageLimiter) {
    const canUse = window.usageLimiter.canUseTool('format');
    if (!canUse.allowed) {
      alert('Trial limit reached! You\'ve used your free format conversion. Upgrade to Pro for unlimited conversions.');
      return;
    }
  }
  
  setIsProcessing(true);
  setProcessingStatus('Initializing conversion...');
  setConversionSuccess(false);
  
  // Clear any existing timeout
  if (processingTimeout) {
    clearTimeout(processingTimeout);
  }
  
  try {
    setProcessingStatus(`Converting to ${selectedFormat.toUpperCase()}...`);
    
    const convertedDataUrl = await imageProcessor.convert(originalImage, selectedFormat);
    
    setProcessingStatus('Finalizing...');
    setProcessedImage(convertedDataUrl);
    setProcessedFormat(selectedFormat);
    
    // Record usage
    if (window.usageLimiter) {
      window.usageLimiter.recordUsage('format', { format: selectedFormat });
    }
    
    // Show success message
    setSuccessMessage(`✅ Successfully converted to ${selectedFormat.toUpperCase()}!`);
    setConversionSuccess(true);
    
    // Auto-hide success message after 3 seconds
    const timeout = setTimeout(() => {
      setConversionSuccess(false);
      setSuccessMessage('');
    }, 3000);
    setProcessingTimeout(timeout);
    
  } catch (error) {
    console.error('Format conversion failed:', error);
    setProcessingStatus('');
    
    // More specific error messages
    if (error.message.includes('canvas')) {
      alert('⚠️ Canvas error during conversion. Try with a smaller image or different format.');
    } else if (error.message.includes('memory')) {
      alert('⚠️ Not enough memory for conversion. Try with a smaller image.');
    } else {
      alert(`❌ Failed to convert to ${selectedFormat}. Please try again or choose a different format.`);
    }
  } finally {
    setIsProcessing(false);
    setProcessingStatus('');
  }
};

const handleFilter = async (filterType) => {
    if (!originalImage) return;
    
    // Check trial limits for filters
    if (window.usageLimiter) {
      const canUse = window.usageLimiter.canUseTool('filters');
      if (!canUse.allowed) {
        alert('Trial limit reached! You\'ve used your free filter. Upgrade to Pro for unlimited filters.');
        return;
      }
    }
    
    setIsProcessing(true);
    try {
      const filteredDataUrl = await imageProcessor.filter(originalImage, filterType);
      setProcessedImage(filteredDataUrl);
      setProcessedFormat('png');
      
      // Record usage
      if (window.usageLimiter) {
        window.usageLimiter.recordUsage('filters', { filterType });
      }
    } catch (error) {
      console.error('Filter failed:', error);
      alert('Failed to apply filter. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Specific handler for background removal
  const handleBackgroundRemoval = async () => {
    if (!originalImage) return;
    
    // Check trial limits specifically for background removal
    if (window.usageLimiter) {
      const canUse = window.usageLimiter.canUseTool('background-removal');
      if (!canUse.allowed) {
        alert('Trial limit reached! You\'ve used your free background removal. Upgrade to Pro for unlimited background removal.');
        return;
      }
    }
    
    setIsProcessing(true);
    try {
      const filteredDataUrl = await imageProcessor.filter(originalImage, 'remove-bg');
      setProcessedImage(filteredDataUrl);
      setProcessedFormat('png');
      
      // Record usage for background removal specifically
      if (window.usageLimiter) {
        window.usageLimiter.recordUsage('background-removal', { filterType: 'remove-bg' });
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
              {originalImage ? 'Media Loaded - Upload New' : 'Drop image/video here or click to browse'}
            </div>
            <div className="upload-hint">
              <strong>Images:</strong> JPG, PNG, WebP up to 10MB<br/>
              <strong>Videos:</strong> MP4/MOV - will show preview frame for GIF creation!
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
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>

        </section>

        {originalImage && (
          <div className="tools-container">
            <div className={`tool-card ${lockedTools.resize?.locked ? 'locked' : ''}`}>
              <div 
                className="tool-header clickable"
                onClick={() => lockedTools.resize?.locked ? null : toggleCard('resize')}
              >
                <div className="tool-icon">📷</div>
                <div className="tool-info">
                  <h3>Social Media Resize {lockedTools.resize?.locked && '🔒'}</h3>
                  <p>{lockedTools.resize?.locked ? 'Trial exhausted - Upgrade for unlimited resizing' : 'Perfect sizes for Instagram, Facebook, Twitter and Discord'}</p>
                </div>
                {!lockedTools.resize?.locked && (
                  <div className={`expand-arrow ${expandedCards.resize ? 'expanded' : ''}`}>
                    ▼
                  </div>
                )}
              </div>
              
              {expandedCards.resize && !lockedTools.resize?.locked && (
                <div className="tool-content">
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
                      
                      <div className="final-dimensions">
                        <span className="dimensions-label">Final Size:</span>
                        <span className="dimensions-value">
                          {customWidth || originalImage?.width || 0} × {customHeight || originalImage?.height || 0}px
                        </span>
                      </div>
                      
                      <button 
                        className="custom-resize-btn"
                        onClick={handleCustomResize}
                        disabled={!customWidth || !customHeight}
                      >
                        ✅ Apply Custom Size
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {lockedTools.resize?.locked && (
                <div className="upgrade-prompt">
                  <h4>🔒 Resize Tool Locked</h4>
                  <p>You've used your free resize. Upgrade to Pro for unlimited resizing!</p>
                  <button className="upgrade-btn">Unlock Unlimited Resizing</button>
                </div>
              )}
            </div>

            <div className={`tool-card ${lockedTools.format?.locked ? 'locked' : ''}`}>
              <div 
                className="tool-header clickable"
                onClick={() => lockedTools.format?.locked ? null : toggleCard('format')}
              >
                <div className="tool-icon">🔄</div>
                <div className="tool-info">
                  <h3>Format Converter {lockedTools.format?.locked && '🔒'}</h3>
                  <p>{lockedTools.format?.locked ? 'Trial exhausted - Upgrade for unlimited conversions' : 'Convert between PNG, JPG, WebP, BMP, and TIFF formats'}</p>
                </div>
                {!lockedTools.format?.locked && (
                  <div className={`expand-arrow ${expandedCards.format ? 'expanded' : ''}`}>
                    ▼
                  </div>
                )}
              </div>
              
              {expandedCards.format && !lockedTools.format?.locked && (
                <div className="tool-content">
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
                      className={`format-btn ${selectedFormat === 'jpeg' ? 'selected' : ''}`}
                      onClick={() => handleFormatSelect('jpeg')}
                    >
                      JPEG
                    </button>
                    <button 
                      className={`format-btn ${selectedFormat === 'webp' ? 'selected' : ''}`}
                      onClick={() => handleFormatSelect('webp')}
                    >
                      WebP
                    </button>
                    <button 
                      className={`format-btn ${selectedFormat === 'bmp' ? 'selected' : ''}`}
                      onClick={() => handleFormatSelect('bmp')}
                    >
                      BMP
                    </button>
                    <button 
                      className={`format-btn ${selectedFormat === 'tiff' ? 'selected' : ''}`}
                      onClick={() => handleFormatSelect('tiff')}
                    >
                      TIFF
                    </button>
                  </div>
                  
                  <button 
                    className={`tool-button ${isProcessing ? 'processing' : ''} ${selectedFormat && !isProcessing ? 'ready' : ''}`}
                    onClick={handleFormatConvert}
                    disabled={!selectedFormat || !originalImage || isProcessing}
                  >
                    {isProcessing ? (
                      <>🔄 {processingStatus || 'Converting...'}</>
                    ) : (
                      <>🔄 Convert to {selectedFormat ? selectedFormat.toUpperCase() : 'Format'}</>
                    )}
                  </button>
                  
                  {processingStatus && isProcessing && (
                    <div className="processing-status">
                      <div className="status-message">{processingStatus}</div>
                      <div className="status-hint">💡 Check browser console (F12) for detailed progress</div>
                    </div>
                  )}
                  
                  {conversionSuccess && (
                    <div className="success-notification">
                      <div className="success-icon">✅</div>
                      <div className="success-message">{successMessage}</div>
                    </div>
                  )}
                </div>
              )}
              
              {lockedTools.format?.locked && (
                <div className="upgrade-prompt">
                  <h4>🔒 Format Converter Locked</h4>
                  <p>You've used your free conversion. Upgrade to Pro for unlimited conversions!</p>
                  <button className="upgrade-btn">Unlock Unlimited Conversions</button>
                </div>
              )}
            </div>

            {/* Color & Filter Tools */}
            <div className={`tool-card ${lockedTools.filters?.locked ? 'locked' : ''}`}>
              <div 
                className="tool-header clickable"
                onClick={() => lockedTools.filters?.locked ? null : toggleCard('colorTools')}
              >
                <div className="tool-icon">🎨</div>
                <div className="tool-info">
                  <h3>Color & Filter Tools {lockedTools.filters?.locked && '🔒'}</h3>
                  <p>{lockedTools.filters?.locked ? 'Trial exhausted - Upgrade for unlimited filters' : 'Professional filters, adjustments, and effects'}</p>
                </div>
                {!lockedTools.filters?.locked && (
                  <div className={`expand-arrow ${expandedCards.colorTools ? 'expanded' : ''}`}>
                    ▼
                  </div>
                )}
              </div>
              
              {expandedCards.colorTools && !lockedTools.filters?.locked && (
                <div className="tool-content">
                  {/* Fine-Tuning Color Adjustments */}
                  <div className="adjustment-section">
                    <h4>🎛️ Fine-Tune Adjustments</h4>
                    <div className="slider-controls">
                      <div className="slider-group">
                        <label>
                          <span>☀️ Brightness</span>
                          <span className="slider-value">{adjustmentValues.brightness}</span>
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={adjustmentValues.brightness}
                          onChange={(e) => handleAdjustmentChange('brightness', e.target.value)}
                          className="adjustment-slider brightness-slider"
                        />
                      </div>
                      
                      <div className="slider-group">
                        <label>
                          <span>⚡ Contrast</span>
                          <span className="slider-value">{adjustmentValues.contrast}</span>
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={adjustmentValues.contrast}
                          onChange={(e) => handleAdjustmentChange('contrast', e.target.value)}
                          className="adjustment-slider contrast-slider"
                        />
                      </div>
                      
                      <div className="slider-group">
                        <label>
                          <span>🌈 Saturation</span>
                          <span className="slider-value">{adjustmentValues.saturation}</span>
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={adjustmentValues.saturation}
                          onChange={(e) => handleAdjustmentChange('saturation', e.target.value)}
                          className="adjustment-slider saturation-slider"
                        />
                      </div>
                      
                      <button 
                        className="reset-adjustments-btn"
                        onClick={() => {
                          setAdjustmentValues({ brightness: 0, contrast: 0, saturation: 0 });
                          setProcessedImage(originalImage);
                        }}
                      >
                        Reset All
                      </button>
                    </div>
                  </div>

                  {/* Premium Creative Filters */}
                  <div className="filter-section">
                    <h4>✨ Creative Filters</h4>
                    <div className="filter-grid">
                      <button 
                        className="filter-btn"
                        onClick={() => handleFilter('vintage')}
                        title="Classic vintage film look"
                      >
                        <div className="filter-preview">📸</div>
                        <span>Vintage</span>
                      </button>
                      
                      <button 
                        className="filter-btn"
                        onClick={() => handleFilter('vibrant')}
                        title="Boost colors and contrast"
                      >
                        <div className="filter-preview">🌈</div>
                        <span>Vibrant</span>
                      </button>
                      
                      <button 
                        className="filter-btn"
                        onClick={() => handleFilter('dramatic')}
                        title="High contrast dramatic effect"
                      >
                        <div className="filter-preview">⚡</div>
                        <span>Dramatic</span>
                      </button>
                      
                      <button 
                        className="filter-btn"
                        onClick={() => handleFilter('dreamy')}
                        title="Soft dreamy atmosphere"
                      >
                        <div className="filter-preview">✨</div>
                        <span>Dreamy</span>
                      </button>
                      
                      <button 
                        className="filter-btn"
                        onClick={() => handleFilter('blur')}
                        title="Add professional blur effect"
                      >
                        <div className="filter-preview">🌫️</div>
                        <span>Blur</span>
                      </button>
                      
                      <button 
                        className="filter-btn"
                        onClick={() => handleFilter('sharp')}
                        title="Enhance image sharpness"
                      >
                        <div className="filter-preview">🔍</div>
                        <span>Sharp</span>
                      </button>
                    </div>
                  </div>

                  {/* Black & White Effects */}
                  <div className="bw-section">
                    <h4>⚫⚪ Black & White</h4>
                    <div className="bw-grid">
                      <button 
                        className="bw-btn"
                        onClick={() => handleFilter('grayscale')}
                        title="Convert to grayscale"
                      >
                        <div className="bw-preview">⚫</div>
                        <span>Grayscale</span>
                      </button>
                      
                      <button 
                        className="bw-btn"
                        onClick={() => handleFilter('sepia')}
                        title="Classic sepia tone"
                      >
                        <div className="bw-preview">🟤</div>
                        <span>Sepia</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {lockedTools.filters?.locked && (
                <div className="upgrade-prompt">
                  <h4>🔒 Filters Locked</h4>
                  <p>You've used your free filter. Upgrade to Pro for unlimited filters!</p>
                  <button className="upgrade-btn">Unlock All Premium Filters</button>
                </div>
              )}
            </div>

            {/* AI Background Removal with Trial Limits */}
            <div className={`tool-card ${lockedTools.backgroundRemoval?.locked ? 'locked' : ''}`}>
              <div 
                className="tool-header clickable"
                onClick={() => toggleCard('backgroundRemoval')}
              >
                <div className="tool-icon">
                  {lockedTools.backgroundRemoval?.locked ? '🔒' : '🚀'}
                </div>
                <div className="tool-info">
                  <h3>
                    AI Background Removal
                    {lockedTools.backgroundRemoval?.locked && <span className="lock-badge">TRIAL LIMIT REACHED</span>}
                  </h3>
                  <p>
                    {lockedTools.backgroundRemoval?.locked 
                      ? lockedTools.backgroundRemoval.upgradePrompt?.message || "Upgrade to remove unlimited backgrounds"
                      : "Professional U-2-Net AI • Remove.bg quality • Industry-grade"
                    }
                  </p>
                </div>
                <div className={`expand-arrow ${expandedCards.backgroundRemoval ? 'expanded' : ''} ${lockedTools.backgroundRemoval?.locked ? 'locked' : ''}`}>
                  {lockedTools.backgroundRemoval?.locked ? '🔒' : '▼'}
                </div>
              </div>
              
              {lockedTools.backgroundRemoval?.locked ? (
                <div className="premium-upgrade-panel">
                  <div className="upgrade-content">
                    <div className="upgrade-icon">🚀</div>
                    <h4>{lockedTools.backgroundRemoval.upgradePrompt?.title}</h4>
                    <p>{lockedTools.backgroundRemoval.upgradePrompt?.message}</p>
                    <button className="premium-upgrade-button">
                      {lockedTools.backgroundRemoval.upgradePrompt?.cta || 'Unlock Pro Background Removal'}
                    </button>
                  </div>
                </div>
              ) : expandedCards.backgroundRemoval && (
                <div className="tool-content">
                  <div className="u2net-features">
                    <h4 style={{ color: '#40e0ff', fontSize: '14px', marginBottom: '10px' }}>
                      🚀 SMART AUTO-DETECTION + Polish Layer
                    </h4>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4' }}>
                      <div style={{ marginBottom: '8px' }}>✅ AI automatically detects image content</div>
                      <div style={{ marginBottom: '8px' }}>✅ Chooses optimal model (Human/Animal/Object)</div>
                      <div style={{ marginBottom: '8px' }}>✅ Auto contrast & edge enhancement</div>
                      <div style={{ marginBottom: '8px' }}>✅ Post-processing cleanup & recovery</div>
                      <div style={{ marginBottom: '8px' }}>✅ Zero manual selection required</div>
                    </div>
                  </div>
                  
                  <button 
                    className={`tool-button ${isProcessing ? 'processing' : 'ready'}`}
                    onClick={handleBackgroundRemoval}
                    disabled={!originalImage || isProcessing}
                  >
                    {isProcessing ? '🧠 SMART AI Processing...' : '🚀 SMART Background Removal'}
                  </button>
                </div>
              )}
            </div>

            {/* GIF Creator Tool */}
            <div className={`tool-card ${lockedTools.gifCreator?.locked ? 'locked' : ''}`}>
              <div 
                className="tool-header clickable"
                onClick={() => lockedTools.gifCreator?.locked ? null : toggleCard('gifCreator')}
              >
                <div className="tool-icon">
                  {lockedTools.gifCreator?.locked ? '🔒' : '🎬'}
                </div>
                <div className="tool-info">
                  <h3>
                    GIF Creator
                    {lockedTools.gifCreator?.locked && <span className="lock-badge">TRIAL LIMIT REACHED</span>}
                  </h3>
                  <p>
                    {lockedTools.gifCreator?.locked 
                      ? lockedTools.gifCreator.upgradePrompt?.message || "Upgrade for unlimited GIF creation"
                      : "Create animated GIFs from videos and image sequences"
                    }
                  </p>
                </div>
                <div className={`expand-arrow ${expandedCards.gifCreator ? 'expanded' : ''} ${lockedTools.gifCreator?.locked ? 'locked' : ''}`}>
                  {lockedTools.gifCreator?.locked ? '🔒' : '▼'}
                </div>
              </div>
              
              {lockedTools.gifCreator?.locked ? (
                <div className="premium-upgrade-panel">
                  <div className="upgrade-content">
                    <div className="upgrade-icon">🎬</div>
                    <h4>{lockedTools.gifCreator.upgradePrompt?.title}</h4>
                    <p>{lockedTools.gifCreator.upgradePrompt?.message}</p>
                    <button className="premium-upgrade-button">
                      {lockedTools.gifCreator.upgradePrompt?.cta || 'Unlock Unlimited GIF Creation'}
                    </button>
                  </div>
                </div>
              ) : expandedCards.gifCreator && (
                <div className="tool-content">
                  <div className="gif-creator-section">
                    <h4 style={{ color: '#40e0ff', fontSize: '14px', marginBottom: '10px' }}>
                      🎬 GIF Creator - Upload Video
                    </h4>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', marginBottom: '15px' }}>
                      <div style={{ marginBottom: '8px' }}>✅ Convert videos to optimized GIFs</div>
                      <div style={{ marginBottom: '8px' }}>✅ Adjustable frame rate and quality</div>
                      <div style={{ marginBottom: '8px' }}>✅ Custom duration and size settings</div>
                      <div style={{ marginBottom: '8px' }}>✅ Smart compression algorithms</div>
                    </div>
                    
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Check trial limits before proceeding
                          if (window.usageLimiter) {
                            const canUse = window.usageLimiter.canUseTool('gif-creator');
                            if (!canUse.allowed) {
                              alert('Trial limit reached! You\'ve used your free GIF creation. Upgrade to Pro for unlimited GIF creation.');
                              e.target.value = ''; // Clear the input
                              return;
                            }
                          }
                          setVideoFile(file);
                        }
                      }}
                      style={{ marginBottom: '15px', width: '100%' }}
                    />
                    
                    {videoFile && (
                      <GifCreatorInterface 
                        videoFile={videoFile}
                        onGifCreated={(gifDataUrl) => {
                          setProcessedImage(gifDataUrl);
                          setProcessedFormat('gif');
                          
                          // Record usage for GIF creator
                          if (window.usageLimiter) {
                            window.usageLimiter.recordUsage('gif-creator', { source: 'video' });
                          }
                        }}
                        onProgressUpdate={onGifProgressUpdate}
                        onError={(error) => {
                          console.error('GIF creation error:', error);
                          alert('Failed to create GIF: ' + error);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
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
