// ResizeDebugger.js - Debug helper for resize issues
import React, { useState } from 'react';
import './ResizeDebugger.css';

const ResizeDebugger = ({ originalImage, targetWidth, targetHeight, onDebugComplete }) => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [step, setStep] = useState(0);
  const [canvasData, setCanvasData] = useState(null);

  const debugSteps = [
    "🔍 Analyzing original image",
    "📐 Calculating dimensions", 
    "🎨 Creating canvas",
    "✏️ Drawing resized image",
    "✅ Verifying result"
  ];

  const runDebugResize = async () => {
    if (!originalImage) return;

    const debug = {
      originalImage: {
        width: originalImage.width,
        height: originalImage.height,
        src: originalImage.src?.substring(0, 50) + '...' || 'Generated',
        naturalWidth: originalImage.naturalWidth || 'N/A',
        naturalHeight: originalImage.naturalHeight || 'N/A'
      },
      targetDimensions: {
        width: parseInt(targetWidth),
        height: parseInt(targetHeight)
      },
      steps: [],
      errors: [],
      warnings: []
    };

    try {
      // Step 1: Analyze original image
      setStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!originalImage.complete) {
        debug.errors.push("❌ Original image not fully loaded");
      }
      
      if (originalImage.width === 0 || originalImage.height === 0) {
        debug.errors.push("❌ Original image has zero dimensions");
      }
      
      debug.steps.push("✅ Original image analyzed");

      // Step 2: Validate target dimensions
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const targetW = parseInt(targetWidth);
      const targetH = parseInt(targetHeight);
      
      if (isNaN(targetW) || isNaN(targetH)) {
        debug.errors.push("❌ Invalid target dimensions (not numbers)");
      }
      
      if (targetW <= 0 || targetH <= 0) {
        debug.errors.push("❌ Target dimensions must be positive");
      }
      
      if (targetW > 4000 || targetH > 4000) {
        debug.warnings.push("⚠️ Large dimensions may cause performance issues");
      }
      
      if (targetW === originalImage.width && targetH === originalImage.height) {
        debug.warnings.push("⚠️ Target dimensions same as original - no change");
      }
      
      debug.steps.push("✅ Target dimensions validated");

      // Step 3: Create canvas
      setStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        debug.errors.push("❌ Could not create canvas context");
        return;
      }
      
      canvas.width = targetW;
      canvas.height = targetH;
      
      debug.canvasInfo = {
        width: canvas.width,
        height: canvas.height,
        contextType: ctx.constructor.name
      };
      
      debug.steps.push("✅ Canvas created successfully");

      // Step 4: Draw image
      setStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const startTime = performance.now();
      
      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the resized image
      ctx.drawImage(originalImage, 0, 0, targetW, targetH);
      
      const endTime = performance.now();
      
      debug.performance = {
        drawTime: `${(endTime - startTime).toFixed(2)}ms`,
        pixelCount: targetW * targetH,
        scaleFactor: ((targetW * targetH) / (originalImage.width * originalImage.height)).toFixed(2)
      };
      
      debug.steps.push("✅ Image drawn to canvas");

      // Step 5: Verify result
      setStep(5);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      let nonTransparentPixels = 0;
      let totalAlpha = 0;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        totalAlpha += alpha;
        if (alpha > 0) nonTransparentPixels++;
      }
      
      const avgAlpha = totalAlpha / (pixels.length / 4);
      
      debug.verification = {
        totalPixels: pixels.length / 4,
        nonTransparentPixels,
        transparentPixels: (pixels.length / 4) - nonTransparentPixels,
        averageAlpha: avgAlpha.toFixed(2),
        hasContent: nonTransparentPixels > 0
      };
      
      if (nonTransparentPixels === 0) {
        debug.errors.push("❌ Result image appears to be completely transparent");
      }
      
      if (avgAlpha < 50) {
        debug.warnings.push("⚠️ Result image has low opacity");
      }
      
      debug.steps.push("✅ Result verified");
      
      // Store canvas data URL for preview
      setCanvasData(canvas.toDataURL());
      
      debug.success = debug.errors.length === 0;
      
    } catch (error) {
      debug.errors.push(`❌ Unexpected error: ${error.message}`);
      debug.success = false;
    }
    
    setDebugInfo(debug);
    setStep(0);
    
    if (onDebugComplete) {
      onDebugComplete(debug);
    }
  };

  return (
    <div className="resize-debugger">
      <div className="debugger-header">
        <h3>🔧 Resize Debugger</h3>
        <p>Detailed analysis of resize operations</p>
      </div>

      <div className="debug-controls">
        <button 
          onClick={runDebugResize}
          disabled={!originalImage || step > 0}
          className="debug-btn"
        >
          {step > 0 ? `🔄 ${debugSteps[step - 1]}` : '🚀 Start Debug Analysis'}
        </button>
      </div>

      {step > 0 && (
        <div className="debug-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(step / debugSteps.length) * 100}%`}}
            />
          </div>
          <p>Step {step}/{debugSteps.length}: {debugSteps[step - 1]}</p>
        </div>
      )}

      {debugInfo && (
        <div className="debug-results">
          <div className={`debug-summary ${debugInfo.success ? 'success' : 'failure'}`}>
            <h4>{debugInfo.success ? '✅ Debug Complete - No Issues Found' : '❌ Issues Detected'}</h4>
          </div>

          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div className="debug-section errors">
              <h4>🚨 Errors ({debugInfo.errors.length})</h4>
              {debugInfo.errors.map((error, i) => (
                <p key={i} className="error-item">{error}</p>
              ))}
            </div>
          )}

          {/* Warnings */}
          {debugInfo.warnings.length > 0 && (
            <div className="debug-section warnings">
              <h4>⚠️ Warnings ({debugInfo.warnings.length})</h4>
              {debugInfo.warnings.map((warning, i) => (
                <p key={i} className="warning-item">{warning}</p>
              ))}
            </div>
          )}

          {/* Original Image Info */}
          <div className="debug-section">
            <h4>📷 Original Image</h4>
            <div className="info-grid">
              <p><strong>Dimensions:</strong> {debugInfo.originalImage.width} × {debugInfo.originalImage.height}px</p>
              <p><strong>Natural Size:</strong> {debugInfo.originalImage.naturalWidth} × {debugInfo.originalImage.naturalHeight}px</p>
              <p><strong>Source:</strong> {debugInfo.originalImage.src}</p>
            </div>
          </div>

          {/* Target Dimensions */}
          <div className="debug-section">
            <h4>🎯 Target Dimensions</h4>
            <div className="info-grid">
              <p><strong>Width:</strong> {debugInfo.targetDimensions.width}px</p>
              <p><strong>Height:</strong> {debugInfo.targetDimensions.height}px</p>
            </div>
          </div>

          {/* Canvas Info */}
          {debugInfo.canvasInfo && (
            <div className="debug-section">
              <h4>🎨 Canvas Information</h4>
              <div className="info-grid">
                <p><strong>Canvas Size:</strong> {debugInfo.canvasInfo.width} × {debugInfo.canvasInfo.height}px</p>
                <p><strong>Context Type:</strong> {debugInfo.canvasInfo.contextType}</p>
              </div>
            </div>
          )}

          {/* Performance */}
          {debugInfo.performance && (
            <div className="debug-section">
              <h4>⚡ Performance</h4>
              <div className="info-grid">
                <p><strong>Draw Time:</strong> {debugInfo.performance.drawTime}</p>
                <p><strong>Pixel Count:</strong> {debugInfo.performance.pixelCount.toLocaleString()}</p>
                <p><strong>Scale Factor:</strong> {debugInfo.performance.scaleFactor}x</p>
              </div>
            </div>
          )}

          {/* Verification */}
          {debugInfo.verification && (
            <div className="debug-section">
              <h4>✅ Verification</h4>
              <div className="info-grid">
                <p><strong>Has Content:</strong> {debugInfo.verification.hasContent ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Non-transparent Pixels:</strong> {debugInfo.verification.nonTransparentPixels.toLocaleString()}</p>
                <p><strong>Average Opacity:</strong> {debugInfo.verification.averageAlpha}%</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {canvasData && (
            <div className="debug-section">
              <h4>🖼️ Result Preview</h4>
              <img 
                src={canvasData} 
                alt="Debug result" 
                style={{maxWidth: '200px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
          )}

          {/* Steps */}
          <div className="debug-section">
            <h4>📋 Execution Steps</h4>
            {debugInfo.steps.map((step, i) => (
              <p key={i} className="step-item">{step}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResizeDebugger;
