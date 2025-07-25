import React from 'react';
import Loading from '../ui/Loading';
import Button from '../ui/Button';
import { downloadManager } from '../../utils/downloadManager';

const ImageCanvas = ({ originalImage, processedImage, isProcessing, processedFormat = 'png', hasProLicense }) => {
  console.log('🖼️ ImageCanvas render:', { 
    hasOriginal: !!originalImage, 
    hasProcessed: !!processedImage, 
    isProcessing,
    processedType: typeof processedImage 
  });
  
  const handleDownload = () => {
    if (processedImage) {
      const tempImg = new Image();
      tempImg.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;

        ctx.drawImage(tempImg, 0, 0);

        // Add watermark for free users
        if (!hasProLicense) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '16px Arial';
          ctx.fillText('Image Editor Pro', 10, canvas.height - 10);
        }

        // Generate filename with correct extension
        const filename = `edited-image.${processedFormat}`;
        downloadManager.downloadCanvas(canvas, filename);
      };
      tempImg.src = processedImage;
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
              <img src={processedImage} alt="Processed" />
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
};

export default ImageCanvas;
