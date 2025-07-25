import React, { useState, useEffect } from 'react';
import { licenseManager } from '../services/firebase-license.js';

const LicenseActivation = ({ onActivated }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleActivation = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('Please enter your license key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await licenseManager.validateLicense(licenseKey.trim());
      
      if (result.success) {
        setSuccess(result.message);
        // Call parent callback to update app state
        onActivated(result.user);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="license-activation">
      <div className="license-modal">
        <div className="license-header">
          <h2>🔐 Activate SnapForge</h2>
          <p>Enter your license key from Gumroad to unlock all features</p>
        </div>

        <form onSubmit={handleActivation} className="license-form">
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

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          <button 
            type="submit" 
            className="activate-button"
            disabled={loading || !licenseKey.trim()}
          >
            {loading ? '🔄 Activating...' : '🚀 Activate License'}
          </button>
        </form>

        <div className="license-help">
          <h4>Where to find your license key:</h4>
          <ul>
            <li>Check your Gumroad purchase email</li>
            <li>Login to your Gumroad library</li>
            <li>Look for "SNAP-FORGE-" followed by your unique code</li>
          </ul>
          
          <div className="support-link">
            <a href="mailto:support@snapforge.ai">Need help? Contact support</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .license-activation {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .license-modal {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          color: white;
          border: 1px solid #333;
        }

        .license-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .license-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
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
          padding: 0.75rem;
          border: 1px solid #444;
          border-radius: 6px;
          background: #2a2a2a;
          color: white;
          font-size: 1rem;
          font-family: monospace;
        }

        .license-input:focus {
          outline: none;
          border-color: #0066cc;
        }

        .license-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .activate-button {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .activate-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #0077dd, #0055aa);
          transform: translateY(-1px);
        }

        .activate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #ff4444;
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .success-message {
          background: #00aa44;
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
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
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
        }

        .license-help li {
          margin-bottom: 0.5rem;
          color: #888;
        }

        .support-link {
          text-align: center;
        }

        .support-link a {
          color: #0066cc;
          text-decoration: none;
        }

        .support-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LicenseActivation;
