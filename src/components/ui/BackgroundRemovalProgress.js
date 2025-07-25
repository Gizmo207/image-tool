import React, { useState, useEffect } from 'react';
import './BackgroundRemovalProgress.css';

const BackgroundRemovalProgress = ({ isVisible, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [stages] = useState([
    { key: 'load', label: 'Loading Google AI Model', icon: '🧠' },
    { key: 'segment', label: 'AI Semantic Analysis', icon: '🔍' },
    { key: 'mask', label: 'Professional Segmentation', icon: '🎭' },
    { key: 'refine', label: 'Edge Enhancement', icon: '✨' },
    { key: 'export', label: 'Finalizing PNG', icon: '💾' }
  ]);

  useEffect(() => {
    const handleProgress = (event) => {
      const { key, current, total, percent } = event.detail;
      setProgress(percent);
      
      // Update current stage based on progress key
      const stage = stages.find(s => key.includes(s.key)) || stages[0];
      setCurrentStage(stage.label);
      
      // Complete when done
      if (percent >= 100) {
        setTimeout(() => {
          onComplete && onComplete();
        }, 1000);
      }
    };

    if (isVisible) {
      window.addEventListener('backgroundRemovalProgress', handleProgress);
      setProgress(0);
      setCurrentStage('Initializing AI...');
    }

    return () => {
      window.removeEventListener('backgroundRemovalProgress', handleProgress);
    };
  }, [isVisible, stages, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="bg-removal-progress-overlay">
      <div className="bg-removal-progress-container">
        <div className="bg-removal-header">
          <div className="bg-removal-icon">🚀</div>
          <h3>U-2-Net Professional AI</h3>
          <p>Remove.bg quality • Industry-grade • Offline & free</p>
        </div>

        <div className="bg-removal-stages">
          {stages.map((stage, index) => (
            <div 
              key={stage.key}
              className={`stage-item ${currentStage === stage.label ? 'active' : ''} ${progress > (index * 20) ? 'completed' : ''}`}
            >
              <div className="stage-icon">{stage.icon}</div>
              <span className="stage-label">{stage.label}</span>
              {currentStage === stage.label && (
                <div className="stage-spinner"></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-removal-progress-bar">
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>

        <div className="bg-removal-footer">
          <div className="processing-indicator">
            <div className="pulse-dot"></div>
            <span>{currentStage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalProgress;
