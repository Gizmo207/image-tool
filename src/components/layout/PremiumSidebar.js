// PremiumSidebar.js - Stunning premium UI sidebar
import React, { useState, useRef, useEffect } from 'react';
import { imageProcessor } from '../../utils/imageProcessor';
import GifCreatorInterface from '../gif/GifCreatorInterface';
import BackgroundRemovalProgress from '../ui/BackgroundRemovalProgress';
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
  const fileInputRef = useRef(null);
  
  // Collapsible tool card states
  const [expandedCards, setExpandedCards] = useState({
    resize: false,
    colorTools: false,
    format: false,
    gifCreator: false
  });
  
  // Fine-tuning adjustment values
  const [adjustmentValues, setAdjustmentValues] = useState({
    brightness: 0, // -100 to +100
    contrast: 0,   // -100 to +100
    saturation: 0  // -100 to +100
  });

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
    
    setIsProcessing(true);
    
    try {
      const filteredImage = await imageProcessor.filter(originalImage, filterType, value);
      setProcessedImage(filteredImage);
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
    
    console.log('🚀 Starting format conversion:', {
      format: selectedFormat,
      hasOriginalFile: !!originalFile,
      originalFileType: originalFile?.type,
      imageSize: originalImage ? `${originalImage.width}x${originalImage.height}` : 'unknown'
    });
    
    setIsProcessing(true);
    setConversionSuccess(false);
    setProcessingStatus('Initializing conversion...');
    
    // Set up timeout monitoring
    const timeout = setTimeout(() => {
      console.warn('⚠️ Processing taking longer than expected...');
      setProcessingStatus('Processing is taking longer than expected. Please check console for details.');
    }, 10000);
    
    setProcessingTimeout(timeout);
    
    try {
      let convertedDataUrl;
      
      // Handle GIF conversion - only for video files
      if (selectedFormat.toLowerCase() === 'gif') {
        // Check if we have a video file available
        const videoFile = originalImage?.originalVideoFile || originalFile;
        
        if (!videoFile || !videoFile.type.startsWith('video/')) {
          throw new Error('GIF conversion is only available for video files. Please upload a video file first.');
        }
        
        console.log('🎬 Converting video to image using original video file:', {
          fileName: videoFile.name,
          fileSize: Math.round(videoFile.size / 1024) + 'KB',
          fileType: videoFile.type
        });
        
        setProcessingStatus('📹 Loading video...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI update
        
        setProcessingStatus('🎬 Extracting frame from video...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProcessingStatus('⚙️ Processing video frame...');
        
        try {
          console.log('🔧 Calling imageProcessor.convertToGif (now creates static image)...');
          convertedDataUrl = await imageProcessor.convertToGif(videoFile);
          console.log('✅ Video frame extraction completed successfully:', {
            dataUrlSize: convertedDataUrl?.length || 0,
            dataUrlPrefix: convertedDataUrl?.substring(0, 50) || 'EMPTY'
          });
          
          if (!convertedDataUrl) {
            throw new Error('Video frame extraction returned empty result');
          }
          
        } catch (videoError) {
          console.error('❌ Detailed video processing error:', {
            error: videoError,
            message: videoError.message,
            stack: videoError.stack,
            videoFile: {
              name: videoFile.name,
              size: videoFile.size,
              type: videoFile.type
            }
          });
          throw gifError;
        }
        
      } else {
        console.log('🖼️ Converting to standard format...');
        setProcessingStatus(`Converting to ${selectedFormat.toUpperCase()}...`);
        
        convertedDataUrl = await imageProcessor.convert(originalImage, selectedFormat);
        console.log('✅ Standard format conversion completed');
      }
      
      clearTimeout(timeout);
      setProcessingStatus('Finalizing...');
      
      setProcessedImage(convertedDataUrl);
      setProcessedFormat(selectedFormat); // Update the format state
      
      // Show success feedback
      setConversionSuccess(true);
      
      if (selectedFormat.toLowerCase() === 'gif') {
        setSuccessMessage(`✨ Successfully extracted frame from video! Your image is ready to download. 📥`);
        console.log('🎉 Video frame extraction successful!');
      } else {
        setSuccessMessage(`✨ Successfully converted to ${selectedFormat.toUpperCase()}! Your image is ready to download. 📥`);
        console.log('🎉 Format conversion successful!');
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setConversionSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      clearTimeout(timeout);
      console.error('❌ Format conversion failed:', error);
      
      let errorMessage = 'Failed to convert format. ';
      
      if (error.message.includes('timeout')) {
        errorMessage += 'The process timed out - try a smaller file or shorter video.';
      } else if (error.message.includes('corrupted')) {
        errorMessage += 'The file appears to be corrupted or in an unsupported format.';
      } else if (error.message.includes('memory')) {
        errorMessage += 'Not enough memory - try a smaller file.';
      } else {
        errorMessage += 'Please check the console for details and try again.';
      }
      
      alert(errorMessage);
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
    }
  };

  const handleFilter = async (filterType) => {
    console.log('🚨 BUTTON CLICKED! Filter type:', filterType);
    console.log('🚨 Original image:', originalImage ? 'EXISTS' : 'NO_IMAGE');
    
    if (!originalImage) {
      console.log('❌ No original image - returning early');
      return;
    }
    
    // Special handling for AI background removal - TEMPORARILY DISABLED PROGRESS
    if (filterType === 'remove-bg') {
      console.log('🎯 BACKGROUND REMOVAL DETECTED - progress DISABLED for testing');
      // setShowBgRemovalProgress(true); // DISABLED FOR TESTING
    }
    
    console.log('🔄 Setting isProcessing to true');
    setIsProcessing(true);
    
    try {
      console.log('🚀 CALLING imageProcessor.filter with:', { filterType, originalImage });
      const filteredDataUrl = await imageProcessor.filter(originalImage, filterType);
      console.log('✅ Filter completed, result:', filteredDataUrl ? 'HAS_RESULT' : 'NO_RESULT');
      
      setProcessedImage(filteredDataUrl);
      setProcessedFormat('png'); // Reset to PNG after filter
      
      // Hide progress indicator after completion
      if (filterType === 'remove-bg') {
        setTimeout(() => {
          console.log('🔄 Hiding background removal progress');
          setShowBgRemovalProgress(false);
        }, 1500);
      }
    } catch (error) {
      console.error('❌ FILTER FAILED:', error);
      alert(`Failed to apply ${filterType === 'remove-bg' ? 'AI background removal' : 'filter'}. Please try again.`);
      
      if (filterType === 'remove-bg') {
        setShowBgRemovalProgress(false);
      }
    } finally {
      console.log('🔄 Setting isProcessing to false');
      setIsProcessing(false);
    }
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
            <div className="tool-card">
              <div 
                className="tool-header clickable"
                onClick={() => toggleCard('resize')}
              >
                <div className="tool-icon">📷</div>
                <div className="tool-info">
                  <h3>Social Media Resize</h3>
                  <p>Perfect sizes for Instagram, Facebook, Twitter and Discord</p>
                </div>
                <div className={`expand-arrow ${expandedCards.resize ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
              
              {expandedCards.resize && (
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
              )}
            </div>

            <div className="tool-card">
              <div 
                className="tool-header clickable"
                onClick={() => toggleCard('format')}
              >
                <div className="tool-icon">🔄</div>
                <div className="tool-info">
                  <h3>Format Converter</h3>
                  <p>Convert between PNG, JPG, WebP, BMP, and TIFF formats</p>
                </div>
                <div className={`expand-arrow ${expandedCards.format ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
              
              {expandedCards.format && (
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
            </div>

            {/* GIF Creator - Standalone Tool with Advanced Interface */}
            <div className={`tool-card ${isGifCreating ? 'gif-creating' : ''}`}>
              <div 
                className="tool-header clickable"
                onClick={() => toggleCard('gifCreator')}
              >
                <div className="tool-icon">🎬</div>
                <div className="tool-info">
                  <h3>GIF Creator</h3>
                  <p>Create animated GIFs from your videos with full control</p>
                </div>
                <div className={`expand-arrow ${expandedCards.gifCreator ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
              
              {expandedCards.gifCreator && (
                <div className="tool-content">
                  <GifCreatorInterface
                    videoFile={originalImage?.originalVideoFile || originalFile}
                    onGifCreated={(gifDataUrl) => {
                      console.log('✅ GIF created successfully');
                      setProcessedImage(gifDataUrl);
                      setProcessedFormat('gif');
                      setIsGifCreating(false);
                    }}
                    onError={(errorMessage) => {
                      console.error('❌ GIF creation error:', errorMessage);
                      alert('GIF creation failed: ' + errorMessage);
                      setIsGifCreating(false);
                    }}
                    onProgressUpdate={(progressData) => {
                      setIsGifCreating(progressData.isCreating);
                      onGifProgressUpdate?.(progressData);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Unified Color Tools Card */}
            <div className="tool-card">
              <div 
                className="tool-header clickable"
                onClick={() => toggleCard('colorTools')}
              >
                <div className="tool-icon">🎨</div>
                <div className="tool-info">
                  <h3>Color & Filter Tools</h3>
                  <p>Professional filters, adjustments, and effects</p>
                </div>
                <div className={`expand-arrow ${expandedCards.colorTools ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
              
              {expandedCards.colorTools && (
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
            </div>

            {/* AI Background Removal - Standalone Tool */}
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🏆</div>
                <div className="tool-info">
                  <h3>Google MediaPipe AI</h3>
                  <p>The ONLY background remover • Professional • Free forever</p>
                </div>
              </div>
              
              <button 
                className="tool-button"
                onClick={async () => {
                  console.log('🚨 BACKGROUND REMOVAL BUTTON CLICKED!');
                  
                  if (!originalImage) {
                    alert('Please upload an image first!');
                    return;
                  }
                  
                  try {
                    setIsProcessing(true);
                    console.log('✅ Processing started');
                    
                    console.log('🔄 Calling imageProcessor.filter...');
                    const result = await imageProcessor.filter(originalImage, 'remove-bg');
                    
                    console.log('✅ Background removal completed!', result ? 'HAS_RESULT' : 'NO_RESULT');
                    
                    if (result) {
                      setProcessedImage(result);
                      setProcessedFormat('png');
                      alert('Background removed successfully!');
                    } else {
                      alert('Background removal returned empty result');
                    }
                    
                  } catch (error) {
                    console.error('❌ Background removal failed:', error);
                    alert('Background removal failed: ' + error.message);
                  } finally {
                    setIsProcessing(false);
                    console.log('✅ Processing finished');
                  }
                }}
                disabled={!originalImage || isProcessing}
              >
                {isProcessing ? '🏆 Google AI Processing...' : '🏆 Remove Background (MediaPipe)'}
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

      {/* Professional Background Removal Progress */}
      <BackgroundRemovalProgress 
        isVisible={showBgRemovalProgress}
        onComplete={() => setShowBgRemovalProgress(false)}
      />
    </div>
  );
};

export default PremiumSidebar;
