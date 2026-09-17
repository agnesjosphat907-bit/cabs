import React from 'react';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <a href="#privacy">Privacy policy</a>
        <span>•</span>
        <a href="#terms">Terms and Conditions</a>
        <span>•</span>
        <a href="#contact">Contact us</a>
      </div>
      <p>© {new Date().getFullYear()} CABS Bank Zimbabwe. All Rights Reserved. Bank-level Encryption & Security.</p>
    </footer>
  );
};
