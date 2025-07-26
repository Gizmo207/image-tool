// Generate test images for SnapForge testing
const fs = require('fs');
const path = require('path');

// Create test assets programmatically
const createTestAssets = () => {
  const assetsDir = path.join(__dirname, 'test-assets');
  
  // Create small JPG (simple 100x100 red square)
  const smallCanvas = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="red"/>
    <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white">Small</text>
  </svg>`;
  
  // Create large PNG (500x500 blue square)
  const largeCanvas = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="500" fill="blue"/>
    <text x="250" y="250" text-anchor="middle" dy=".3em" fill="white" font-size="24">Large PNG</text>
  </svg>`;
  
  // Create transparency PNG 
  const transparencyCanvas = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="green" fill-opacity="0.7"/>
    <text x="100" y="100" text-anchor="middle" dy=".3em" fill="white">Transparent</text>
  </svg>`;
  
  // Write SVG files (we'll convert these to actual images later)
  fs.writeFileSync(path.join(assetsDir, 'small.svg'), smallCanvas);
  fs.writeFileSync(path.join(assetsDir, 'large.svg'), largeCanvas);
  fs.writeFileSync(path.join(assetsDir, 'transparency.svg'), transparencyCanvas);
  
  // Create a text file that's not an image
  fs.writeFileSync(path.join(assetsDir, 'not-an-image.txt'), 'This is not an image file');
  
  // Create a "corrupt" image file (just binary data)
  const corruptData = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48]);
  fs.writeFileSync(path.join(assetsDir, 'corrupt.jpg'), corruptData);
  
  console.log('✅ Test assets created in test-assets/ directory');
  console.log('📝 Note: SVG files can be used directly or converted to JPG/PNG as needed');
};

createTestAssets();
