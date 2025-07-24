import React, { useState } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Sidebar from './layout/Sidebar';
import ImageCanvas from './editor/ImageCanvas';
import { LicenseManager } from '../utils/licenseManager';
import '../styles/components.css';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProLicense] = useState(LicenseManager.checkLicense());

  const handleImageUpload = (imageFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
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
        <Sidebar 
          onImageUpload={handleImageUpload}
          originalImage={originalImage}
          setProcessedImage={setProcessedImage}
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
