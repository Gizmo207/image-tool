import React, { useState, useEffect } from 'react';
import { licenseManager } from '../services/firebase-license.js';
import { usageLimiter } from '../services/usageLimiter.js';
import './FirstRunExperience.css';

const FirstRunExperience = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSkipTrial = () => {
    // Start trial mode
    onComplete({ mode: 'trial', licensed: false });
  };

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter your license key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await licenseManager.validateLicense(licenseKey.trim());
      
      if (result.success) {
        // Activate license in usage limiter
        usageLimiter.activateLicense(result.user);
        
        onComplete({ 
          mode: 'licensed', 
          licensed: true, 
          user: result.user 
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Activation failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'welcome') {
    return (
      <div className="first-run-overlay">
        <div className="first-run-modal">
          <div className="welcome-header">
            <img src="/logo.png" alt="SnapForge" className="welcome-logo" />
            <h1>Welcome to SnapForge</h1>
            <p>Professional AI image editing tools for creators</p>
          </div>

          <div className="welcome-features">
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <div>
                <h3>AI Background Removal</h3>
                <p>Smart detection with professional results</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">📐</span>
              <div>
                <h3>Batch Image Resizing</h3>
                <p>Process hundreds of images instantly</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🎬</span>
              <div>
                <h3>GIF Creator</h3>
                <p>Turn images and videos into perfect GIFs</p>
              </div>
            </div>
          </div>

          <div className="welcome-actions">
            <button 
              className="primary-button"
              onClick={() => setCurrentStep('license')}
            >
              🔐 I Have a License Key
            </button>
            <button 
              className="secondary-button"
              onClick={handleSkipTrial}
            >
              🚀 Try SnapForge (Limited)
            </button>
          </div>

          <div className="purchase-link">
            <p>Don't have a license? <a href="https://snapforge.gumroad.com/l/snapforge" target="_blank">Get SnapForge Pro for $39.99</a></p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'license') {
    return (
      <div className="first-run-overlay">
        <div className="first-run-modal">
          <div className="license-header">
            <button 
              className="back-button"
              onClick={() => setCurrentStep('welcome')}
            >
              ← Back
            </button>
            <h2>🔐 Activate Your License</h2>
            <p>Enter your license key from Gumroad to unlock all features</p>
          </div>

          <div className="license-form">
            <div className="input-group">
              <label htmlFor="licenseKey">License Key</label>
              <input
                id="licenseKey"
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="SNAP-FORGE-XXXX-XXXX-XXXX"
                className="license-input"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="license-actions">
              <button 
                className="activate-button"
                onClick={handleActivateLicense}
                disabled={loading || !licenseKey.trim()}
              >
                {loading ? '🔄 Validating...' : '✅ Activate License'}
              </button>
              <button 
                className="skip-button"
                onClick={handleSkipTrial}
                disabled={loading}
              >
                Skip - Try Limited Version
              </button>
            </div>
          </div>

          <div className="license-help">
            <h4>Where to find your license key:</h4>
            <ul>
              <li>Check your Gumroad purchase confirmation email</li>
              <li>Login to your Gumroad library at gumroad.com/library</li>
              <li>Look for "SnapForge" purchase and click "Get"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FirstRunExperience;
