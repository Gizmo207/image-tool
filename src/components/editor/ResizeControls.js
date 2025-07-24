import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { imageProcessor } from '../../utils/imageProcessor';
import { FREE_LIMITS } from '../../utils/constants';

function ResizeControls({ originalImage, setProcessedImage, hasProLicense }) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);

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

  const handleResize = () => {
    if (!originalImage) return;

    // Check free user limits
    if (!hasProLicense) {
      const maxDimension = Math.max(width, height);
      if (maxDimension > FREE_LIMITS.maxResolutions) {
        alert(`Free users can resize up to ${FREE_LIMITS.maxResolutions}px. Upgrade to Pro for unlimited resolution!`);
        return;
      }
    }

    const resizedImage = imageProcessor.resize(originalImage, width, height);
    setProcessedImage(resizedImage);
  };

  return (
    <div className="resize-controls">
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

      <Button onClick={handleResize} variant="primary">
        🔄 Resize Image
      </Button>

      {!hasProLicense && (
        <p className="limitation-notice">
          Free: Max {FREE_LIMITS.maxResolutions}px
        </p>
      )}
    </div>
  );
}

export default ResizeControls;
