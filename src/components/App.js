import React, { useState } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import PremiumSidebar from './layout/PremiumSidebar';
import ImageCanvas from './editor/ImageCanvas';
import { LicenseManager } from '../utils/licenseManager';
import '../styles/components.css';

function App() {
  console.log('🚀 FULL APP COMPONENT LOADED!');
  
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProLicense] = useState(LicenseManager.checkLicense());

  // Debug wrapper for setProcessedImage
  const handleSetProcessedImage = (image) => {
    console.log('🎯 App.js: Setting processed image:', image ? 'Data URL received' : 'NULL/UNDEFINED');
    setProcessedImage(image);
  };

  const handleImageUpload = (imageFile) => {
    console.log('� Image upload handler called:', imageFile.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        console.log('🖼️ Image loaded in App:', img.width, 'x', img.height);
        setOriginalImage(img);
        setProcessedImage(null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="app">
      <Header hasProLicense={hasProLicense} />
      
      <main className="main-content">
        <PremiumSidebar 
          onImageUpload={handleImageUpload}
          originalImage={originalImage}
          setProcessedImage={handleSetProcessedImage}
          setIsProcessing={setIsProcessing}
          hasProLicense={hasProLicense}
        />
        
        <div className="editor-area">
          <ImageCanvas 
            originalImage={originalImage}
            processedImage={processedImage}
            isProcessing={isProcessing}
            hasProLicense={hasProLicense}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
