import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-sections">
          <div className="footer-section">
            <h3 className="footer-title">DocsToLLM</h3>
            <p className="footer-description">
              Seamlessly transform documentation into clean text for your AI assistants
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Links</h4>
            <ul className="footer-links">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="#about" className="footer-link">About</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li><a href="mailto:contact@example.com" className="footer-link">Email</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">Twitter</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} DocsToLLM. All rights reserved.
          </div>
          <div className="footer-social">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
