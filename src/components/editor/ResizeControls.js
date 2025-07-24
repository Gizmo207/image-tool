import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { imageProcessor } from '../../utils/imageProcessor';
import { FREE_LIMITS } from '../../utils/constants';

function ResizeControls({ originalImage, setProcessedImage, hasProLicense }) {
  console.log('🔧 ResizeControls component rendered!', { originalImage: !!originalImage, hasProLicense });
  
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (originalImage) {
      console.log('📐 Setting dimensions from original image:', originalImage.width, 'x', originalImage.height);
      setWidth(originalImage.width);
      setHeight(originalImage.height);
    }
  }, [originalImage]);

  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);
    if (maintainAspect && originalImage) {
      const ratio = originalImage.height / originalImage.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    if (maintainAspect && originalImage) {
      const ratio = originalImage.width / originalImage.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleResize = async () => {
    console.log('🔥 RESIZE BUTTON CLICKED!');
    
    if (!originalImage) {
      console.log('No original image to resize');
      return;
    }

    // Check free user limits
    if (!hasProLicense) {
      const maxDimension = Math.max(width, height);
      if (maxDimension > FREE_LIMITS.maxResolutions) {
        alert(`Free users can resize up to ${FREE_LIMITS.maxResolutions}px. Upgrade to Pro for unlimited resolution!`);
        return;
      }
    }

    console.log('Starting resize:', { width, height, originalDimensions: `${originalImage.width}x${originalImage.height}` });
    setIsResizing(true);
    
    try {
      console.log('🔄 Calling imageProcessor.resize with:', { width, height });
      const resizedDataUrl = await imageProcessor.resize(originalImage, width, height);
      console.log('✅ Resize result received, data URL starts with:', resizedDataUrl ? resizedDataUrl.substring(0, 50) + '...' : 'NULL');
      
      if (resizedDataUrl) {
        console.log('📤 Calling setProcessedImage with resized data');
        setProcessedImage(resizedDataUrl);
        
        // Let's also create a temporary image to verify dimensions
        const testImg = new Image();
        testImg.onload = () => {
          console.log('🎯 Resized image actual dimensions:', testImg.width, 'x', testImg.height);
          console.log('🎯 Expected dimensions:', width, 'x', height);
        };
        testImg.src = resizedDataUrl;
      } else {
        console.error('❌ Resize returned null/undefined');
      }
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Error resizing image: ' + error.message);
    } finally {
      setIsResizing(false);
    }
  };

  return (
    <div className="resize-controls">
      <div className="current-dimensions">
        {originalImage && (
          <div>
            <p className="dimension-info">
              📏 Original: {originalImage.width} × {originalImage.height}px
            </p>
            <p className="dimension-info" style={{ 
              color: width !== originalImage.width || height !== originalImage.height ? '#28a745' : '#6c757d',
              fontWeight: width !== originalImage.width || height !== originalImage.height ? 'bold' : 'normal'
            }}>
              🎯 New Size: {width} × {height}px
              {width === originalImage.width && height === originalImage.height ? 
                ' (⚠️ Same as original - change dimensions to resize)' : 
                ' ✅ Ready to resize'}
            </p>
          </div>
        )}
      </div>

      <div className="input-group">
        <label>Width (px):</label>
        <input
          type="number"
          value={width}
          onChange={(e) => handleWidthChange(Number(e.target.value))}
          min="1"
          max={hasProLicense ? 10000 : FREE_LIMITS.maxResolutions}
        />
      </div>

      <div className="input-group">
        <label>Height (px):</label>
        <input
          type="number"
          value={height}
          onChange={(e) => handleHeightChange(Number(e.target.value))}
          min="1"
          max={hasProLicense ? 10000 : FREE_LIMITS.maxResolutions}
        />
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="maintainAspect"
          checked={maintainAspect}
          onChange={(e) => setMaintainAspect(e.target.checked)}
        />
        <label htmlFor="maintainAspect">Maintain aspect ratio</label>
      </div>

      <div className="resize-buttons">
        <Button 
          onClick={handleResize} 
          variant="primary"
          disabled={isResizing || !originalImage || (width === originalImage?.width && height === originalImage?.height)}
          style={{
            opacity: (width === originalImage?.width && height === originalImage?.height) ? 0.6 : 1,
          }}
        >
          {isResizing ? '🔄 Resizing...' : 
           (width === originalImage?.width && height === originalImage?.height) ? 
           '🔄 Change dimensions to resize' : 
           '🔄 Resize Image'}
        </Button>

        {originalImage && (
          <Button 
            onClick={() => {
              setWidth(originalImage.width);
              setHeight(originalImage.height);
            }}
            variant="secondary"
            disabled={isResizing}
          >
            ↩️ Reset to Original
          </Button>
        )}

        {/* Quick preset buttons */}
        {originalImage && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
              📐 Quick Presets:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Button 
                onClick={() => {
                  const newWidth = Math.round(originalImage.width * 0.5);
                  const newHeight = Math.round(originalImage.height * 0.5);
                  setWidth(newWidth);
                  setHeight(newHeight);
                }}
                variant="secondary"
                disabled={isResizing}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                50%
              </Button>
              
              <Button 
                onClick={() => {
                  setWidth(1920);
                  setHeight(1080);
                }}
                variant="secondary"
                disabled={isResizing}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                1920×1080
              </Button>
              
              <Button 
                onClick={() => {
                  setWidth(1280);
                  setHeight(720);
                }}
                variant="secondary"
                disabled={isResizing}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                1280×720
              </Button>
              
              <Button 
                onClick={() => {
                  setWidth(800);
                  setHeight(600);
                }}
                variant="secondary"
                disabled={isResizing}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                800×600
              </Button>
              
              <Button 
                onClick={() => {
                  setWidth(500);
                  setHeight(500);
                }}
                variant="secondary"
                disabled={isResizing}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                500×500
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="dimension-preview">
        <p className="preview-info">
          New size: {width} × {height}px
        </p>
      </div>

      {!hasProLicense && (
        <p className="limitation-notice">
          Free: Max {FREE_LIMITS.maxResolutions}px
        </p>
      )}
    </div>
  );
}

export default ResizeControls;
