import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { imageProcessor } from '../../utils/imageProcessor';
import { FREE_LIMITS } from '../../utils/constants';

function ResizeControls({ originalImage, setProcessedImage, hasProLicense }) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (originalImage) {
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
      const resizedImage = await imageProcessor.resize(originalImage, width, height);
      console.log('Resize result:', resizedImage);
      
      if (resizedImage) {
        console.log('Setting processed image with dimensions:', `${resizedImage.width}x${resizedImage.height}`);
        setProcessedImage(resizedImage);
      } else {
        console.error('Resize returned null/undefined');
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
          <p className="dimension-info">
            Original: {originalImage.width} × {originalImage.height}px
          </p>
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
          disabled={isResizing || !originalImage}
        >
          {isResizing ? '🔄 Resizing...' : '🔄 Resize Image'}
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
