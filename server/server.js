const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();

app.use(cors());

// GET /convert endpoint that streams conversion updates using SSE.
// Example: GET http://localhost:5000/convert?url=https://docs.example.com
app.get('/convert', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: 'Missing URL in query parameter' });
    return;
  }

  // Set headers for SSE.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await convertDocsToTextSSE(url, res);
  } catch (error) {
    console.error('Error during conversion:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Conversion failed' })}\n\n`);
    res.end();
  }
});

// Function to extract text from pages and stream updates via SSE.
async function convertDocsToTextSSE(startUrl, res) {
  // Launch Puppeteer.
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 0
  });
  const page = await browser.newPage();

  await page.goto(startUrl, { waitUntil: 'networkidle2' });

  while (true) {
    // Wait a moment for the page to settle.
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to extract text from the page, wrapping in try–catch to avoid errors
    // if the execution context was destroyed.
    let pageText = '';
    try {
      pageText = await page.evaluate(() => {
        // Try #content-area first; if not present, fallback to <main>.
        let contentEl = document.getElementById('content-area');
        if (!contentEl) {
          contentEl = document.querySelector('main');
        }
        return contentEl ? contentEl.innerText : '';
      });
    } catch (e) {
      console.warn("Extraction error (likely due to navigation):", e.message);
      // In case of error, set pageText to empty and continue.
      pageText = "";
    }

    // Log (for debugging) the first 200 characters.
    console.log("Extracted content (first 200 chars):", pageText ? pageText.substring(0, 200) + "..." : "(empty)");

    // Stream the extracted text to the client.
    res.write(`data: ${JSON.stringify({ text: pageText })}\n\n`);

    // --- Next Page Navigation ---
    // First, try the primary next page button.
    let nextBtnHandle = await page.$('div#pagination a.ml-auto');

    if (nextBtnHandle) {
      console.log("Clicking next page via primary button...");
      try {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }),
          page.evaluate(() => {
            const btn = document.querySelector('div#pagination a.ml-auto');
            if (btn) btn.click();
          })
        ]);
        continue;
      } catch (navError) {
        console.warn("Navigation after clicking primary button failed:", navError.message);
        break;
      }
    } else {
      // Otherwise, try to find an alternative next button.
      const altNextBtnFound = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a.group'));
        const nextLink = links.find(link => {
          const span = link.querySelector('span.text-xs');
          return span && span.textContent.trim().toLowerCase() === 'next';
        });
        if (nextLink) {
          nextLink.click();
          return true;
        }
        return false;
      });

      if (altNextBtnFound) {
        console.log("Clicked alternative next page button.");
        try {
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
          continue;
        } catch (navError) {
          console.warn("Navigation after clicking alternative button failed:", navError.message);
          break;
        }
      } else {
        console.log("No next page button found. Finished extraction.");
        break;
      }
    }
  }

  await browser.close();
  // Signal that the stream is done.
  res.write(`event: done\ndata: ${JSON.stringify({ message: 'Finished extraction' })}\n\n`);
  res.end();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
