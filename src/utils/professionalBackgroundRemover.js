// BEST Free Background Remover - Google MediaPipe + Local Fallback
import { bestBackgroundRemover } from './bestBackgroundRemover';

export const professionalBackgroundRemover = {
  // Use the BEST free background removal available
  async removeBackground(imageSource, options = {}) {
    console.log('🏆 Starting BEST free background removal...');
    
    try {
      // Use Google MediaPipe - the absolute best free option
      const result = await bestBackgroundRemover.removeBackground(imageSource);
      console.log('✅ BEST background removal successful');
      return result;
    } catch (error) {
      console.error('❌ BEST background removal failed:', error);
      throw new Error(`Background removal failed: ${error.message}`);
    }
  },

  // Convert blob to data URL (utility)
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
};
