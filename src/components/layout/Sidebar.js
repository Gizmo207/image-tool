import React from 'react';
import FileUpload from '../ui/FileUpload';
import ResizeControls from '../editor/ResizeControls';
import BackgroundRemover from '../editor/BackgroundRemover';
import FilterControls from '../editor/FilterControls';

function Sidebar({ onImageUpload, originalImage, setProcessedImage, setIsProcessing, hasProLicense }) {
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
              setProcessedImage={setProcessedImage}
              hasProLicense={hasProLicense}
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
