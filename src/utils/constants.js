// Free vs Pro feature limits
export const FREE_LIMITS = {
  maxResolutions: 1920,     // Max width/height for free users
  dailyEdits: 5,           // 5 free edits per day
  maxFileSize: 5,          // 5MB max file size
  watermark: true,         // Add watermark to exports
};

export const PRO_FEATURES = {
  unlimitedResolution: true,
  unlimitedEdits: true,
  maxFileSize: 100,        // 100MB max file size
  batchProcessing: true,
  advancedFilters: true,
  noWatermark: true,
  prioritySupport: true,
};

// Image formats supported
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp'
];

// Export quality settings
export const EXPORT_QUALITY = {
  LOW: 0.6,
  MEDIUM: 0.8,
  HIGH: 0.95,
};
