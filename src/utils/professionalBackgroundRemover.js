// Google MediaPipe Background Remover - The ONLY one we need!
import { bestBackgroundRemover } from './bestBackgroundRemover';

export const professionalBackgroundRemover = {
  // Use ONLY Google MediaPipe - the best free background removal
  async removeBackground(imageSource, options = {}) {
    console.log('🏆 Google MediaPipe - The BEST and ONLY background remover we need');
    
    // Only MediaPipe - no fallbacks needed, it's that good!
    const result = await bestBackgroundRemover.removeBackground(imageSource);
    console.log('✅ Google MediaPipe background removal complete');
    return result;
  }
};
