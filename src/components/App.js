import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import Header from './layout/Header';
import Footer from './layout/Footer';
import PremiumSidebar from './layout/PremiumSidebar';
import ImageCanvas from './editor/ImageCanvas';
import FirstRunExperience from './FirstRunExperience';
import { LicenseManager } from '../utils/licenseManager';
import { usageLimiter } from '../services/usageLimiter.js';
import '../styles/components.css';

function App() {
  console.log('🚀 FULL APP COMPONENT LOADED!');
  
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFormat, setProcessedFormat] = useState('png'); // Track the format of processed image
  const [hasProLicense, setHasProLicense] = useState(false);
  const [gifProgress, setGifProgress] = useState({ isCreating: false, progress: 0, message: '' });
  const [showFirstRun, setShowFirstRun] = useState(false);

  // Initialize usage limiter and check for first run
  useEffect(() => {
    // Make usage limiter globally available
    window.usageLimiter = usageLimiter;
    
    // Check if this is first run
    const hasSeenFirstRun = localStorage.getItem('snapforge_first_run_complete');
    if (!hasSeenFirstRun) {
      setShowFirstRun(true);
    }
    
    // Check trial status
    const trialStatus = usageLimiter.getTrialStatus();
    console.log('🎯 Trial Status:', trialStatus);
    
    // Check for existing license
    setHasProLicense(trialStatus.isLicensed);
  }, []);

  // Handle first run completion
  const handleFirstRunComplete = (result) => {
    localStorage.setItem('snapforge_first_run_complete', 'true');
    setShowFirstRun(false);
    setHasProLicense(result.licensed);
    console.log('🎉 First run completed:', result);
  };

  // Debug wrapper for setProcessedImage
  const handleSetProcessedImage = (image) => {
    console.log('🎯 App.js: Setting processed image:', image ? 'Data URL received' : 'NULL/UNDEFINED');
    setProcessedImage(image);
  };

  const handleImageUpload = (imageFile) => {
    console.log('📁 File upload handler called:', imageFile.name, 'Type:', imageFile.type);
    
    // Handle video files differently for GIF creation
    if (imageFile.type.startsWith('video/')) {
      console.log('🎥 Video file detected - creating video preview for GIF conversion');
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      
      video.onloadedmetadata = () => {
        console.log('🎬 Video loaded:', video.videoWidth, 'x', video.videoHeight, 'Duration:', video.duration + 's');
        
        // Create a canvas to capture first frame for preview
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 0; // Go to first frame
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0);
          const previewDataURL = canvas.toDataURL('image/png');
          
          // Create an image object for preview display
          const previewImg = new Image();
          previewImg.onload = () => {
            console.log('🖼️ Video preview frame created:', previewImg.width, 'x', previewImg.height);
            previewImg.isVideoPreview = true; // Mark this as a video preview
            previewImg.originalVideoFile = imageFile; // Store the original video file
            setOriginalImage(previewImg);
            setProcessedImage(null);
          };
          previewImg.src = previewDataURL;
        };
      };
      
      video.onerror = (error) => {
        console.error('❌ Video loading error:', error);
        alert('Failed to load video file. Please check the format and try again.');
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        video.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
      
    } else {
      // Handle regular image files
      console.log('🖼️ Image file detected');
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          console.log('🖼️ Image loaded in App:', img.width, 'x', img.height);
          setOriginalImage(img);
          setProcessedImage(null);
        };
        img.onerror = () => {
          console.error('❌ Image loading error');
          alert('Failed to load image file. Please check the format and try again.');
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        console.error('❌ File reading error');
        alert('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(imageFile);
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
      {showFirstRun && (
        <FirstRunExperience onComplete={handleFirstRunComplete} />
      )}
      
      <Header hasProLicense={hasProLicense} />
      
      <main className="main-content">
        <PremiumSidebar 
          onImageUpload={handleImageUpload}
          originalImage={originalImage}
          setProcessedImage={handleSetProcessedImage}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
          setProcessedFormat={setProcessedFormat}
          hasProLicense={hasProLicense}
          onGifProgressUpdate={setGifProgress}
        />
        
        <div className="editor-area">
          <ImageCanvas 
            originalImage={originalImage}
            processedImage={processedImage}
            isProcessing={isProcessing}
            processedFormat={processedFormat}
            hasProLicense={hasProLicense}
            gifProgress={gifProgress}
          />
        </div>
      </main>
      
      <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
