import React, { useState, useEffect } from 'react';
import { licenseManager } from '../services/firebase-license.js';
import { usageLimiter } from '../services/usageLimiter.js';

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

        <style jsx>{`
          .first-run-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
          }

          .first-run-modal {
            background: #2a2a2a;
            border-radius: 20px;
            padding: 3rem;
            max-width: 600px;
            width: 90%;
            border: 1px solid #333;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }

          .welcome-header {
            text-align: center;
            margin-bottom: 2.5rem;
          }

          .welcome-logo {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
            border-radius: 16px;
          }

          .welcome-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .welcome-header p {
            margin: 0;
            color: #888;
            font-size: 1.1rem;
          }

          .welcome-features {
            margin-bottom: 2.5rem;
          }

          .feature {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #333;
            border-radius: 12px;
          }

          .feature-icon {
            font-size: 2rem;
            margin-right: 1rem;
          }

          .feature h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1.1rem;
          }

          .feature p {
            margin: 0;
            color: #888;
            font-size: 0.9rem;
          }

          .welcome-actions {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .primary-button {
            flex: 1;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .primary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(79, 172, 254, 0.3);
          }

          .secondary-button {
            flex: 1;
            background: transparent;
            color: white;
            border: 2px solid #555;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .secondary-button:hover {
            border-color: #777;
            background: #333;
          }

          .purchase-link {
            text-align: center;
            padding-top: 1rem;
            border-top: 1px solid #333;
          }

          .purchase-link p {
            margin: 0;
            color: #888;
          }

          .purchase-link a {
            color: #4facfe;
            text-decoration: none;
            font-weight: 500;
          }

          .purchase-link a:hover {
            text-decoration: underline;
          }
        `}</style>
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

          <style jsx>{`
            .first-run-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              color: white;
            }

            .first-run-modal {
              background: #2a2a2a;
              border-radius: 20px;
              padding: 3rem;
              max-width: 500px;
              width: 90%;
              border: 1px solid #333;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .license-header {
              text-align: center;
              margin-bottom: 2rem;
              position: relative;
            }

            .back-button {
              position: absolute;
              left: 0;
              top: 0;
              background: transparent;
              border: none;
              color: #888;
              cursor: pointer;
              font-size: 1rem;
              padding: 0.5rem;
            }

            .back-button:hover {
              color: white;
            }

            .license-header h2 {
              margin: 0 0 0.5rem 0;
              font-size: 1.8rem;
            }

            .license-header p {
              margin: 0;
              color: #888;
            }

            .license-form {
              margin-bottom: 2rem;
            }

            .input-group {
              margin-bottom: 1rem;
            }

            .input-group label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 500;
            }

            .license-input {
              width: 100%;
              padding: 1rem;
              border: 1px solid #444;
              border-radius: 8px;
              background: #333;
              color: white;
              font-size: 1rem;
              font-family: monospace;
              box-sizing: border-box;
            }

            .license-input:focus {
              outline: none;
              border-color: #4facfe;
            }

            .license-input:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .error-message {
              background: #ff4444;
              color: white;
              padding: 0.75rem;
              border-radius: 6px;
              margin-bottom: 1rem;
            }

            .license-actions {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
            }

            .activate-button {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              border: none;
              padding: 1rem;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }

            .activate-button:hover:not(:disabled) {
              transform: translateY(-1px);
              box-shadow: 0 5px 20px rgba(79, 172, 254, 0.3);
            }

            .activate-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
            }

            .skip-button {
              background: transparent;
              color: #888;
              border: 1px solid #444;
              padding: 0.75rem;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            }

            .skip-button:hover:not(:disabled) {
              color: white;
              border-color: #666;
            }

            .license-help {
              border-top: 1px solid #333;
              padding-top: 1.5rem;
            }

            .license-help h4 {
              margin: 0 0 1rem 0;
              color: #ccc;
            }

            .license-help ul {
              margin: 0;
              padding-left: 1.5rem;
            }

            .license-help li {
              margin-bottom: 0.5rem;
              color: #888;
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
};

export default FirstRunExperience;
