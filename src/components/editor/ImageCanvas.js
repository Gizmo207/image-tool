import React from 'react';
import Loading from '../ui/Loading';
import Button from '../ui/Button';
import { downloadManager } from '../../utils/downloadManager';

function ImageCanvas({ originalImage, processedImage, isProcessing, hasProLicense }) {
  const handleDownload = () => {
    if (processedImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;
      
      ctx.drawImage(processedImage, 0, 0);
      
      // Add watermark for free users
      if (!hasProLicense) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('Image Editor Pro', 10, canvas.height - 10);
      }
      
      downloadManager.downloadCanvas(canvas, 'edited-image.png');
    }
  };

  return (
    <div className="image-canvas">
      <div className="canvas-grid">
        <div className="canvas-panel">
          <h3>📷 Original</h3>
          <div className="image-preview">
            {originalImage ? (
              <img src={originalImage.src} alt="Original" />
            ) : (
              <div className="empty-state">
                <p>Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>

        <div className="canvas-panel">
          <h3>✨ Processed</h3>
          <div className="image-preview">
            {isProcessing ? (
              <Loading text="Processing your image..." />
            ) : processedImage ? (
              <img src={processedImage.src} alt="Processed" />
            ) : (
              <div className="empty-state">
                <p>Processed image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download controls moved outside and below the grid */}
      {processedImage && !isProcessing && (
        <div className="download-section">
          <Button onClick={handleDownload} variant="success">
            💾 Download Image
          </Button>
          {!hasProLicense && (
            <p className="watermark-notice">
              Free version includes watermark
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageCanvas;
