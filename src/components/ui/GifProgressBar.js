import React from 'react';
import './GifProgressBar.css';

const GifProgressBar = ({ progress = 0, message = 'Creating GIF...', isActive = false }) => {
  if (!isActive) return null;

  return (
    <div className="gif-progress-container">
      <div className="gif-progress-header">
        <div className="gif-progress-icon">🎬</div>
        <div className="gif-progress-text">{message}</div>
      </div>
      
      <div className="gif-progress-bar-container">
        <div className="gif-progress-bar">
          <div 
            className="gif-progress-fill"
            style={{ width: `${Math.max(5, progress)}%` }}
          >
            <div className="gif-progress-shimmer"></div>
          </div>
        </div>
        <div className="gif-progress-percentage">{Math.round(progress)}%</div>
      </div>
      
      {/* Animated sparkles */}
      <div className="gif-progress-sparkles">
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">⭐</div>
        <div className="sparkle sparkle-3">💫</div>
        <div className="sparkle sparkle-4">🌟</div>
      </div>
      
      {/* RGB LED strip effect */}
      <div className="gif-progress-leds">
        {Array.from({ length: 20 }, (_, i) => (
          <div 
            key={i} 
            className={`led ${progress > (i * 5) ? 'led-active' : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default GifProgressBar;
