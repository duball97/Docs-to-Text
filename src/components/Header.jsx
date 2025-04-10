import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <span className="logo">DocsToLLM</span>
        </div>
        <nav className="nav-links">
          <a href="/" className="nav-link active">Home</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          <a href="#about" className="nav-link">About</a>
        </nav>
        <div className="header-actions">
          <button className="action-button">
            <span className="button-icon">★</span>
            Star
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
