import { useState } from 'react';
import './Homepage.css';

function Homepage() {
  const [url, setUrl] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConvert = async () => {
    if (!url) return;
    
    setIsLoading(true);
    try {
      // For now, we just mock the conversion
      // Later, this will connect to a backend that uses puppeteer
      setConvertedText(`Converted content from ${url} will appear here.`);
    } catch (error) {
      console.error('Error converting docs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!convertedText) return;
    navigator.clipboard.writeText(convertedText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="homepage">
      <h1>Convert Docs to Text<br/> to Feed LLMs</h1>
      <p className="description">
        The fastest way to feed documentation to your AI assistants. Instant docs to plain text conversion.
      </p>
      
      <div className="input-container">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter any docs URL"
          className="url-input"
        />
        <button 
          onClick={handleConvert} 
          disabled={isLoading || !url}
          className="convert-btn"
        >
          {isLoading ? 'Converting...' : 'Convert'}
        </button>
      </div>

      {convertedText && (
        <div className="result-container">
          <div className="result-header">
            <h2>Converted Text</h2>
            <button onClick={handleCopy} className="copy-btn">Copy</button>
          </div>
          <div className="text-content">
            <pre>{convertedText}</pre>
          </div>
        </div>
      )}

      <div className="drag-drop-info">
        <p>You can copy this text and drag it directly to your favorite LLM</p>
      </div>
    </div>
  );
}

export default Homepage;
