import { useState, useEffect } from 'react';
import './Homepage.css';

function Homepage() {
  const [url, setUrl] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Start listening for events from the server.
  const startConversion = (conversionUrl) => {
    // Ensure previous EventSource is closed.
    if (eventSource) {
      eventSource.close();
    }

    // Create an EventSource with the URL as a query parameter.
    const es = new EventSource(`http://localhost:5000/convert?url=${encodeURIComponent(conversionUrl)}`);
    
    es.onmessage = (event) => {
      // event.data is a JSON string containing { text: ... }
      try {
        const { text } = JSON.parse(event.data);
        setConvertedText(prev => prev + text + "\n\n");
      } catch (error) {
        console.error("Error parsing event data:", error);
      }
    };

    es.addEventListener("done", (event) => {
      console.log("Conversion finished:", event.data);
      es.close();
      setIsLoading(false);
    });

    es.onerror = (err) => {
      console.error("EventSource failed:", err);
      es.close();
      setIsLoading(false);
    };

    setEventSource(es);
  };

  const handleConvert = () => {
    if (!url) return;
    setConvertedText('');
    setIsLoading(true);
    startConversion(url);
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
