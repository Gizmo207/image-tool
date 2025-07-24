import React, { useRef } from 'react';
import Button from './Button';

function FileUpload({ onImageUpload }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button onClick={handleButtonClick} variant="primary">
        📁 Choose Image File
      </Button>
    </div>
  );
}

export default FileUpload;
