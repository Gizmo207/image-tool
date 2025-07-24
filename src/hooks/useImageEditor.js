import { useState, useCallback } from 'react';
import { imageProcessor } from '../utils/imageProcessor';
import { LicenseManager } from '../utils/licenseManager';
import { FREE_LIMITS } from '../utils/constants';

export function useImageEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [currentEditIndex, setCurrentEditIndex] = useState(-1);
  const [hasProLicense] = useState(LicenseManager.checkLicense());

  const addToHistory = useCallback((image, operation) => {
    const newHistory = editHistory.slice(0, currentEditIndex + 1);
    newHistory.push({ image, operation, timestamp: Date.now() });
    setEditHistory(newHistory);
    setCurrentEditIndex(newHistory.length - 1);
  }, [editHistory, currentEditIndex]);

  const undo = useCallback(() => {
    if (currentEditIndex > 0) {
      const previousIndex = currentEditIndex - 1;
      const previousEdit = editHistory[previousIndex];
      setProcessedImage(previousEdit.image);
      setCurrentEditIndex(previousIndex);
    }
  }, [currentEditIndex, editHistory]);

  const redo = useCallback(() => {
    if (currentEditIndex < editHistory.length - 1) {
      const nextIndex = currentEditIndex + 1;
      const nextEdit = editHistory[nextIndex];
      setProcessedImage(nextEdit.image);
      setCurrentEditIndex(nextIndex);
    }
  }, [currentEditIndex, editHistory]);

  const canUndo = currentEditIndex > 0;
  const canRedo = currentEditIndex < editHistory.length - 1;

  const loadImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      // Check file size limits
      if (!hasProLicense && file.size > FREE_LIMITS.maxFileSize * 1024 * 1024) {
        reject(new Error(`Free users can upload files up to ${FREE_LIMITS.maxFileSize}MB`));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setProcessedImage(null);
          setEditHistory([]);
          setCurrentEditIndex(-1);
          resolve(img);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [hasProLicense]);

  const resizeImage = useCallback(async (width, height) => {
    if (!originalImage) return null;

    // Check limits for free users
    if (!hasProLicense) {
      const maxDimension = Math.max(width, height);
      if (maxDimension > FREE_LIMITS.maxResolutions) {
        throw new Error(`Free users can resize up to ${FREE_LIMITS.maxResolutions}px`);
      }
    }

    setIsProcessing(true);
    
    try {
      const resized = imageProcessor.resize(originalImage, width, height);
      setProcessedImage(resized);
      addToHistory(resized, `resize_${width}x${height}`);
      return resized;
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, hasProLicense, addToHistory]);

  const removeBackground = useCallback(async () => {
    if (!originalImage) return null;

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processed = imageProcessor.removeBackground(originalImage);
      setProcessedImage(processed);
      addToHistory(processed, 'remove_background');
      return processed;
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, addToHistory]);

  const applyFilters = useCallback(async (filters) => {
    if (!originalImage) return null;

    setIsProcessing(true);
    
    try {
      const filtered = imageProcessor.applyFilters(originalImage, filters);
      setProcessedImage(filtered);
      addToHistory(filtered, `filters_${Object.keys(filters).join('_')}`);
      return filtered;
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, addToHistory]);

  const reset = useCallback(() => {
    setProcessedImage(null);
    setEditHistory([]);
    setCurrentEditIndex(-1);
  }, []);

  return {
    originalImage,
    processedImage,
    isProcessing,
    hasProLicense,
    editHistory,
    canUndo,
    canRedo,
    loadImage,
    resizeImage,
    removeBackground,
    applyFilters,
    undo,
    redo,
    reset,
  };
}
