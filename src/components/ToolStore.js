import React, { useState, useEffect } from 'react';
import { licenseManager } from '../services/firebase-license.js';

const ToolStore = ({ userStatus, onToolPurchased }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const availableTools = await licenseManager.getAvailableTools();
      setTools(availableTools);
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (toolId) => {
    setPurchasing(toolId);
    
    try {
      // In real implementation, integrate with Stripe
      const result = await licenseManager.purchaseAdditionalTool(toolId, {
        // payment data would go here
      });
      
      if (result.success) {
        onToolPurchased(toolId);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const getToolStatus = (tool) => {
    if (userStatus.unlockedTools.includes(tool.id)) {
      return 'unlocked';
    } else if (tool.comingSoon) {
      return 'coming-soon';
    } else {
      return 'locked';
    }
  };

  if (loading) {
    return (
      <div className="tool-store loading">
        <div className="loading-spinner">🔄 Loading tools...</div>
      </div>
    );
  }

  return (
    <div className="tool-store">
      <div className="store-header">
        <h2>🛠️ SnapForge Tool Store</h2>
        <p>Expand your AI toolkit with professional features</p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => {
          const status = getToolStatus(tool);
          
          return (
            <div key={tool.id} className={`tool-card ${status}`}>
              <div className="tool-icon">{tool.icon}</div>
              
              <div className="tool-info">
                <h3>{tool.name}</h3>
                <p className="tool-description">{tool.description}</p>
                
                <div className="tool-features">
                  {tool.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="feature">✓ {feature}</div>
                  ))}
                </div>
              </div>

              <div className="tool-action">
                {status === 'unlocked' && (
                  <div className="unlocked-badge">
                    ✅ Unlocked
                  </div>
                )}
                
                {status === 'coming-soon' && (
                  <div className="coming-soon-badge">
                    🚀 Coming Soon
                  </div>
                )}
                
                {status === 'locked' && (
                  <div className="purchase-section">
                    <div className="price">${tool.price}</div>
                    <button
                      className="purchase-button"
                      onClick={() => handlePurchase(tool.id)}
                      disabled={purchasing === tool.id}
                    >
                      {purchasing === tool.id ? '🔄 Purchasing...' : '💳 Buy Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="upsell-banner">
        <h3>🔥 Pro Bundle - Save 60%</h3>
        <p>Get all tools for $99.99 instead of $249.92</p>
        <button className="bundle-button">
          🚀 Upgrade to Pro Bundle
        </button>
      </div>

      <style jsx>{`
        .tool-store {
          padding: 2rem;
          background: #1a1a1a;
          color: white;
          min-height: 100vh;
        }

        .store-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .store-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .store-header p {
          margin: 0;
          color: #888;
          font-size: 1.1rem;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .tool-card {
          background: #2a2a2a;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #333;
          transition: all 0.2s;
        }

        .tool-card:hover {
          border-color: #0066cc;
          transform: translateY(-2px);
        }

        .tool-card.unlocked {
          border-color: #00aa44;
        }

        .tool-card.coming-soon {
          opacity: 0.7;
        }

        .tool-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .tool-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }

        .tool-description {
          color: #ccc;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .tool-features {
          margin-bottom: 1.5rem;
        }

        .feature {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .tool-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .unlocked-badge {
          background: #00aa44;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
        }

        .coming-soon-badge {
          background: #666;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
        }

        .purchase-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          justify-content: space-between;
        }

        .price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #0066cc;
        }

        .purchase-button {
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .purchase-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #0077dd, #0055aa);
          transform: translateY(-1px);
        }

        .purchase-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .upsell-banner {
          background: linear-gradient(135deg, #ff6600, #cc5500);
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .upsell-banner h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .upsell-banner p {
          margin: 0 0 1.5rem 0;
          opacity: 0.9;
        }

        .bundle-button {
          background: white;
          color: #ff6600;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bundle-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 102, 0, 0.3);
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }

        .loading-spinner {
          font-size: 1.5rem;
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default ToolStore;
