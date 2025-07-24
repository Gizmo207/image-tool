import { useState, useCallback } from 'react';
import { SUPPORTED_FORMATS, FREE_LIMITS } from '../utils/constants';
import { LicenseManager } from '../utils/licenseManager';

export function useFileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const hasProLicense = LicenseManager.checkLicense();

  const validateFile = useCallback((file) => {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error('Unsupported file format. Please use JPG, PNG, GIF, or WebP.');
    }

    // Check file size
    const maxSize = hasProLicense ? 100 * 1024 * 1024 : FREE_LIMITS.maxFileSize * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = hasProLicense ? 100 : FREE_LIMITS.maxFileSize;
      throw new Error(`File too large. Maximum size is ${maxSizeMB}MB.`);
    }

    return true;
  }, [hasProLicense]);

  const handleFile = useCallback((file, onSuccess, onError) => {
    setError(null);
    setUploadProgress(0);

    try {
      validateFile(file);
      
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setUploadProgress(100);
          onSuccess?.(file, img);
          setTimeout(() => setUploadProgress(0), 1000);
        };
        img.onerror = () => {
          const error = new Error('Failed to load image');
          setError(error.message);
          onError?.(error);
        };
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        const error = new Error('Failed to read file');
        setError(error.message);
        onError?.(error);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      onError?.(err);
    }
  }, [validateFile]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e, onSuccess, onError) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFile(imageFile, onSuccess, onError);
    } else {
      const error = new Error('Please drop an image file');
      setError(error.message);
      onError?.(error);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e, onSuccess, onError) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file, onSuccess, onError);
    }
  }, [handleFile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDragging,
    uploadProgress,
    error,
    hasProLicense,
    handleFile,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    clearError,
    validateFile,
  };
}
