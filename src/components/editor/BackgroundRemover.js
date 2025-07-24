import React from 'react';
import Button from '../ui/Button';
import { imageProcessor } from '../../utils/imageProcessor';

function BackgroundRemover({ originalImage, setProcessedImage, setIsProcessing, hasProLicense }) {
  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processedImage = imageProcessor.removeBackground(originalImage);
      setProcessedImage(processedImage);
    } catch (error) {
      alert('Error removing background: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="background-remover">
      <p className="feature-description">
        Remove image backgrounds using AI-powered processing
      </p>
      
      <Button onClick={handleRemoveBackground} variant="primary">
        🎭 Remove Background
      </Button>
      
      <div className="feature-note">
        <small>
          {hasProLicense 
            ? 'Pro: High-quality AI background removal' 
            : 'Free: Basic background removal'
          }
        </small>
      </div>
    </div>
  );
}

export default BackgroundRemover;
