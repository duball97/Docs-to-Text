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
    const convertedText = await convertDocsToText(url);
    res.json({ convertedText });
  } catch (error) {
    console.error('Error during conversion:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Function to launch Puppeteer, navigate through pages, extract text,
// and click the next page button until finished.
async function convertDocsToText(startUrl) {
  // Launch Puppeteer with headless: false and slowMo for debugging.
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50 // Slow down actions for visual inspection.
  });
  const page = await browser.newPage();
  let fullText = '';

  // Go to the starting URL.
  await page.goto(startUrl, { waitUntil: 'networkidle2' });

  while (true) {
    // Wait for the content area selector to appear.
    await page.waitForSelector('#content-area', { timeout: 5000 }).catch(() => {
      console.warn("The #content-area selector was not found on this page.");
    });

    // Extract text from the page.
    const pageText = await page.evaluate(() => {
      const contentEl = document.getElementById('content-area');
      return contentEl ? contentEl.innerText : '';
    });

    // Log the extracted content for debugging.
    console.log("Extracted content from current page:\n", pageText);

    if (pageText) {
      fullText += pageText + "\n\n";
    } else {
      console.warn("No content extracted on this page.");
    }

    // Attempt to find the next page button.
    const nextPageButtonExists = await page.$('div#pagination a.ml-auto');

    if (!nextPageButtonExists) {
      console.log("No next page button found. Finished extraction.");
      break;
    }

    console.log("Clicking next page...");

    // Click the next page button using page.evaluate to avoid detached handle issues.
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.evaluate(() => {
        const nextBtn = document.querySelector('div#pagination a.ml-auto');
        if (nextBtn) nextBtn.click();
      })
    ]);
  }

  // Close the browser when done.
  await browser.close();
  return fullText;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
