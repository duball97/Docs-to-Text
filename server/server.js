const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// POST /convert endpoint to receive a URL and return converted text.
app.post('/convert', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL in request body' });
  }

  try {
    // Convert the docs using Puppeteer.
    const convertedText = await convertDocsToText(url);
    res.json({ convertedText });
  } catch (error) {
    console.error('Error during conversion:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Function to launch Puppeteer, navigate to the URL, and extract text.
async function convertDocsToText(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the provided URL. Adjust waitUntil if needed.
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Extract the main text from the page.
  // Adjust the selector if your target docs use a different structure.
  const text = await page.evaluate(() => {
    const element = document.querySelector('article');
    return element ? element.innerText : 'No content found with selector <article>';
  });

  await browser.close();
  return text;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
