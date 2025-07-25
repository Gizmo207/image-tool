import React from 'react';
import logo from '../../assets/logo.png';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={logo} alt="Image Editor Pro" className="footer-logo" />
          <p>&copy; 2025 Image Editor Pro - Own it forever, no subscriptions!</p>
        </div>
        <div className="footer-links">
          <a href="#help">Help</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
