// Download manager for handling file exports
export const downloadManager = {
  // Download canvas as file
  downloadCanvas(canvas, filename = 'image.png', quality = 0.95) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', quality);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Download image element as file
  downloadImage(image, filename = 'image.png') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    
    this.downloadCanvas(canvas, filename);
  },

  // Download blob as file
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);
  },

  // Get suggested filename based on operations
  getSuggestedFilename(originalName, operations = []) {
    const baseName = originalName ? originalName.split('.')[0] : 'image';
    const extension = 'png'; // Always use PNG for edited images
    
    let suffix = '';
    if (operations.length > 0) {
      suffix = '_' + operations.join('_');
    }
    
    return `${baseName}${suffix}.${extension}`;
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  // Estimate output file size
  estimateFileSize(canvas, format = 'png', quality = 0.95) {
    // Rough estimation based on canvas dimensions and format
    const pixels = canvas.width * canvas.height;
    
    switch (format.toLowerCase()) {
      case 'png':
        return pixels * 4; // RGBA
      case 'jpg':
      case 'jpeg':
        return pixels * quality; // Compressed
      case 'webp':
        return pixels * quality * 0.8; // More efficient
      default:
        return pixels * 4;
    }
  }
};
