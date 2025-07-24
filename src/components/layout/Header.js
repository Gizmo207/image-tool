import React from 'react';
import Button from '../ui/Button';

function Header({ hasProLicense }) {
  const handleUpgrade = () => {
    alert('Upgrade to Pro for $39 - Lifetime License!');
    // Here you'd integrate with your payment system
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🖼️ Image Editor Pro</h1>
        </div>
        
        <div className="header-actions">
          {!hasProLicense && (
            <Button 
              onClick={handleUpgrade}
              variant="primary"
              className="upgrade-btn"
            >
              Upgrade to Pro - $39
            </Button>
          )}
          
          {hasProLicense && (
            <span className="pro-badge">✨ PRO USER</span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
