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
      const response = await fetch('http://localhost:5000/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (response.ok) {
        setConvertedText(data.convertedText);
      } else {
        console.error('Conversion error:', data.error);
        setConvertedText('Error converting docs.');
      }
    } catch (error) {
      console.error('Error connecting to conversion service:', error);
      setConvertedText('Error connecting to conversion service.');
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
      <h1>Easily Convert Docs to Text<br/> to Feed LLMs</h1>
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
