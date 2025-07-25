import React from 'react';
import Loading from '../ui/Loading';
import Button from '../ui/Button';
import { downloadManager } from '../../utils/downloadManager';
import { formatSupport } from '../../utils/formatSupport';

const ImageCanvas = ({ originalImage, processedImage, isProcessing, processedFormat = 'png', hasProLicense }) => {
  console.log('🖼️ ImageCanvas render:', { 
    hasOriginal: !!originalImage, 
    hasProcessed: !!processedImage, 
    isProcessing,
    processedType: typeof processedImage 
  });
  
  const handleDownload = () => {
    if (processedImage) {
      // For GIFs, download directly without canvas conversion to preserve animation
      if (processedFormat.toLowerCase() === 'gif') {
        console.log('🎬 Downloading animated GIF directly');
        const link = document.createElement('a');
        link.download = `animated-gif.gif`;
        link.href = processedImage; // processedImage is already a data URL for GIFs
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // For other formats, use canvas conversion
      const tempImg = new Image();
      tempImg.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;

        // For JPG format, fill with white background to avoid transparency issues
        if (processedFormat === 'jpg' || processedFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(tempImg, 0, 0);

        // Add watermark for free users
        if (!hasProLicense) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = 'bold 16px Arial';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 1;
          const text = 'Image Editor Pro';
          ctx.strokeText(text, 10, canvas.height - 10);
          ctx.fillText(text, 10, canvas.height - 10);
        }

        // Generate filename with correct extension
        const filename = `edited-image.${processedFormat}`;
        
        // Get proper MIME type and quality settings
        let mimeType, quality;
        switch (processedFormat.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            quality = 0.92; // High quality for JPEG
            break;
          case 'webp':
            mimeType = 'image/webp';
            quality = 0.90; // High quality for WebP
            break;
          case 'png':
          default:
            mimeType = 'image/png';
            quality = 1.0; // PNG is lossless
            break;
        }

        // Create download link with proper format
        const link = document.createElement('a');
        link.download = filename;
        const dataURL = canvas.toDataURL(mimeType, quality);
        
        // Validate format support and data URL
        if (!formatSupport.supportsFormat(processedFormat)) {
          console.error('Format not supported by browser:', processedFormat);
          alert(`${processedFormat.toUpperCase()} format is not supported by your browser. Downloading as PNG instead.`);
          // Fallback to PNG
          link.download = `edited-image.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
        } else {
          // Validate the data URL before download
          const validation = formatSupport.validateDataURL(dataURL, processedFormat);
          if (!validation.valid) {
            console.error('Invalid data URL generated:', validation.error);
            alert(`Failed to generate ${processedFormat.toUpperCase()} file: ${validation.error}. Try PNG format instead.`);
            return;
          }
          
          console.log('Download initiated:', { 
            filename, 
            mimeType, 
            quality, 
            dataURLLength: dataURL.length,
            dataURLPrefix: dataURL.substring(0, 50) + '...'
          });
          
          link.href = dataURL;
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      tempImg.onerror = () => {
        console.error('Failed to load processed image for download');
        alert('Failed to download image. Please try again.');
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
          <h3>✨ {processedFormat.toLowerCase() === 'gif' ? 'Animated GIF' : 'Processed'}</h3>
          <div className="image-preview">
            {isProcessing ? (
              <Loading text="Processing your image..." />
            ) : processedImage ? (
              <img 
                src={processedImage} 
                alt={processedFormat.toLowerCase() === 'gif' ? 'Animated GIF' : 'Processed'} 
                style={{
                  imageRendering: processedFormat.toLowerCase() === 'gif' ? 'auto' : 'auto'
                }}
              />
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
            💾 Download {processedFormat.toLowerCase() === 'gif' ? 'GIF' : 'Image'}
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
