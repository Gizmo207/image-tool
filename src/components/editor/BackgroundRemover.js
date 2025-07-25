import React from 'react';
import Button from '../ui/Button';
import { imageProcessor } from '../../utils/imageProcessor';

function BackgroundRemover({ originalImage, setProcessedImage, setIsProcessing, hasProLicense }) {
  const handleRemoveBackground = async () => {
    if (!originalImage) {
      alert('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🎭 Starting background removal...');
      
      // Call the background removal function and await the result
      const processedImage = await imageProcessor.removeBackground(originalImage);
      
      console.log('✅ Background removal completed');
      setProcessedImage(processedImage.src);
      
    } catch (error) {
      console.error('❌ Background removal failed:', error);
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
