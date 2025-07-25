// Test format support utility
export const formatSupport = {
  // Test if browser supports a format
  supportsFormat(format) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 1, 1);
      
      let mimeType;
      switch (format.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        case 'png':
        default:
          mimeType = 'image/png';
          break;
      }
      
      const dataURL = canvas.toDataURL(mimeType, 0.9);
      return dataURL.indexOf(mimeType.split('/')[1]) > -1;
    } catch (error) {
      console.error('Format support test failed:', error);
      return false;
    }
  },

  // Get supported formats
  getSupportedFormats() {
    const formats = ['png', 'jpg', 'webp']; // Removed GIF - not supported by canvas for creation
    return formats.filter(format => this.supportsFormat(format));
  },

  // Explain format usage
  getFormatInfo(format) {
    const info = {
      png: 'Best for: Images with transparency, logos, graphics',
      jpg: 'Best for: Photos, images without transparency',  
      webp: 'Best for: Modern web images, good compression',
      gif: 'Best for: Animated images only (not static conversion)'
    };
    return info[format.toLowerCase()] || 'Unknown format';
  },

  // Test data URL validity
  validateDataURL(dataURL, expectedFormat) {
    if (!dataURL || dataURL === 'data:,') {
      return { valid: false, error: 'Empty or invalid data URL' };
    }
    
    const expectedMime = expectedFormat === 'jpg' ? 'jpeg' : expectedFormat;
    if (!dataURL.includes(expectedMime)) {
      return { valid: false, error: `Data URL doesn't contain expected format: ${expectedMime}` };
    }
    
    // Check minimum length (a valid image should be at least a few KB)
    if (dataURL.length < 1000) {
      return { valid: false, error: 'Data URL too short, likely corrupted' };
    }
    
    return { valid: true };
  }
};
