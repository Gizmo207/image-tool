// Google MediaPipe Background Remover - SIMPLE & RELIABLE
import { bestBackgroundRemover } from './bestBackgroundRemover';

export const professionalBackgroundRemover = {
  // Simple MediaPipe background removal that WORKS
  async removeBackground(imageSource, options = {}) {
    console.log('🏆 Google MediaPipe - Simple & Reliable (free forever!)');
    
    try {
      const result = await bestBackgroundRemover.removeBackground(imageSource);
      console.log('✅ Background removal complete!');
      return result;
    } catch (error) {
      console.error('❌ Background removal failed:', error);
      throw new Error('Failed to remove background. Please try again.');
    }
  }
};
