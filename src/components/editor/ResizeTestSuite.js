// ResizeTestSuite.js - Comprehensive testing for image resizer
import React, { useState, useRef } from 'react';
import './ResizeTestSuite.css';

const ResizeTestSuite = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef(null);

  // Test image creation helper
  const createTestImage = (width, height, color = 'red') => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
      
      // Add some text to verify the image
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`${width}x${height}`, 10, 30);
      
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = canvas.toDataURL();
    });
  };

  // Test the resize function
  const testResize = async (originalWidth, originalHeight, targetWidth, targetHeight, testName) => {
    try {
      console.log(`🧪 Running test: ${testName}`);
      
      // Create test image
      const testImage = await createTestImage(originalWidth, originalHeight);
      
      // Perform resize
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const startTime = performance.now();
      ctx.drawImage(testImage, 0, 0, targetWidth, targetHeight);
      const endTime = performance.now();
      
      // Verify result
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasPixels = imageData.data.some(pixel => pixel > 0);
      
      const result = {
        testName,
        originalSize: `${originalWidth}x${originalHeight}`,
        targetSize: `${targetWidth}x${targetHeight}`,
        actualSize: `${canvas.width}x${canvas.height}`,
        processingTime: `${(endTime - startTime).toFixed(2)}ms`,
        success: canvas.width === targetWidth && canvas.height === targetHeight && hasPixels,
        hasPixels,
        timestamp: new Date().toLocaleTimeString()
      };
      
      console.log(`✅ Test completed:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Test failed: ${testName}`, error);
      return {
        testName,
        originalSize: `${originalWidth}x${originalHeight}`,
        targetSize: `${targetWidth}x${targetHeight}`,
        error: error.message,
        success: false,
        timestamp: new Date().toLocaleTimeString()
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      // Basic functionality tests
      { orig: [800, 600], target: [400, 300], name: "Basic Downscale 50%" },
      { orig: [400, 300], target: [800, 600], name: "Basic Upscale 200%" },
      
      // Preset tests (Instagram Square)
      { orig: [1920, 1080], target: [1080, 1080], name: "Instagram Square from HD" },
      { orig: [800, 600], target: [1080, 1080], name: "Instagram Square from 4:3" },
      
      // Preset tests (Discord Avatar)
      { orig: [1024, 1024], target: [512, 512], name: "Discord Avatar from 1024px" },
      { orig: [256, 256], target: [512, 512], name: "Discord Avatar from 256px" },
      
      // Edge cases
      { orig: [1, 1], target: [100, 100], name: "Tiny to Normal" },
      { orig: [4000, 3000], target: [400, 300], name: "Huge to Small" },
      { orig: [100, 200], target: [200, 100], name: "Aspect Ratio Change" },
      
      // Same size (should work but no change)
      { orig: [800, 600], target: [800, 600], name: "No Change Test" },
      
      // Extreme ratios
      { orig: [1920, 100], target: [1080, 1080], name: "Wide to Square" },
      { orig: [100, 1920], target: [1080, 1080], name: "Tall to Square" }
    ];

    const results = [];
    
    for (const test of tests) {
      const result = await testResize(
        test.orig[0], test.orig[1],
        test.target[0], test.target[1],
        test.name
      );
      results.push(result);
      setTestResults([...results]); // Update UI after each test
      
      // Small delay to not overwhelm the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
    
    // Summary
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;
    
    console.log(`🎯 Test Summary: ${passed} passed, ${failed} failed out of ${results.length} total`);
  };

  // Clear results
  const clearResults = () => {
    setTestResults([]);
  };

  // Test individual preset
  const testPreset = async (presetName, width, height) => {
    const result = await testResize(800, 600, width, height, `Preset: ${presetName}`);
    setTestResults(prev => [...prev, result]);
  };

  return (
    <div className="test-suite">
      <div className="test-header">
        <h2>🧪 Image Resizer Test Suite</h2>
        <p>This will help identify and isolate resizer issues</p>
      </div>

      <div className="test-controls">
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="test-btn primary"
        >
          {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
        </button>
        
        <button onClick={clearResults} className="test-btn secondary">
          🗑️ Clear Results
        </button>
      </div>

      {/* Quick Preset Tests */}
      <div className="preset-tests">
        <h3>🎯 Quick Preset Tests</h3>
        <button 
          onClick={() => testPreset('Instagram Square', 1080, 1080)}
          className="preset-test-btn"
        >
          📷 Test Instagram Square
        </button>
        <button 
          onClick={() => testPreset('Discord Avatar', 512, 512)}
          className="preset-test-btn"
        >
          🎮 Test Discord Avatar
        </button>
      </div>

      {/* Test Results */}
      <div className="test-results">
        <h3>📊 Test Results ({testResults.length})</h3>
        
        {testResults.length === 0 ? (
          <p className="no-results">No tests run yet. Click "Run All Tests" to begin.</p>
        ) : (
          <div className="results-grid">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`test-result ${result.success ? 'success' : 'failure'}`}
              >
                <div className="result-header">
                  <span className={`status-icon ${result.success ? 'success' : 'failure'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <strong>{result.testName}</strong>
                  <small>{result.timestamp}</small>
                </div>
                
                <div className="result-details">
                  <p><strong>Original:</strong> {result.originalSize}</p>
                  <p><strong>Target:</strong> {result.targetSize}</p>
                  {result.actualSize && <p><strong>Actual:</strong> {result.actualSize}</p>}
                  {result.processingTime && <p><strong>Time:</strong> {result.processingTime}</p>}
                  {result.error && <p className="error"><strong>Error:</strong> {result.error}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Canvas */}
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
};

export default ResizeTestSuite;
