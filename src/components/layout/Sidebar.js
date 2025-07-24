import React from 'react';
import FileUpload from '../ui/FileUpload';
import ResizeControls from '../editor/ResizeControls';
import ResizeTestSuite from '../editor/ResizeTestSuite';
import ResizeDebugger from '../editor/ResizeDebugger';
import BackgroundRemover from '../editor/BackgroundRemover';
import FilterControls from '../editor/FilterControls';
import { imageProcessor } from '../../utils/imageProcessor';

function Sidebar({ onImageUpload, originalImage, setProcessedImage, setIsProcessing, hasProLicense }) {
  
  const handleResize = async (width, height) => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const resizedDataUrl = await imageProcessor.resize(originalImage, width, height);
      if (resizedDataUrl) {
        setProcessedImage(resizedDataUrl);
      }
    } catch (error) {
      console.error('Error resizing image:', error);
      alert('Error resizing image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>📁 Upload Image</h3>
        <FileUpload onImageUpload={onImageUpload} />
      </div>

      {originalImage && (
        <>
          <div className="sidebar-section">
            <h3>🔧 Resize</h3>
            <ResizeControls 
              originalImage={originalImage}
              onResize={handleResize}
            />
          </div>

          <div className="sidebar-section">
            <h3>🧪 Testing Suite</h3>
            <ResizeTestSuite />
          </div>

          <div className="sidebar-section">
            <h3>🔍 Debug Tools</h3>
            <ResizeDebugger 
              originalImage={originalImage}
              targetWidth={800}
              targetHeight={600}
            />
          </div>

          <div className="sidebar-section">
            <h3>✂️ Background</h3>
            <BackgroundRemover 
              originalImage={originalImage}
              setProcessedImage={setProcessedImage}
              setIsProcessing={setIsProcessing}
              hasProLicense={hasProLicense}
            />
          </div>

          <div className="sidebar-section">
            <h3>🎨 Filters</h3>
            <FilterControls 
              originalImage={originalImage}
              setProcessedImage={setProcessedImage}
              hasProLicense={hasProLicense}
            />
          </div>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
