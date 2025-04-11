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
// and click the appropriate next page button until finished.
async function convertDocsToText(startUrl) {
  // Launch Puppeteer in headless mode (set to false for debugging).
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0
  });
  const page = await browser.newPage();
  let fullText = '';

  // Go to the starting URL.
  await page.goto(startUrl, { waitUntil: 'networkidle2' });

  while (true) {
    // Wait a moment for the content to settle.
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract text from the page.
    const pageText = await page.evaluate(() => {
      // Try #content-area first; fallback to <main> if not found.
      let contentEl = document.getElementById('content-area');
      if (!contentEl) {
        contentEl = document.querySelector('main');
      }
      return contentEl ? contentEl.innerText : '';
    });

    // Log the extracted content (first 200 characters for brevity).
    console.log("Extracted content from current page:\n", pageText ? pageText.substring(0, 200) + "..." : "(empty)");

    if (pageText && pageText.trim().length > 0) {
      fullText += pageText + "\n\n";
    } else {
      console.warn("No content extracted on this page.");
    }

    // --- Next Page Navigation ---
    // First, try the primary next page button (docs site with pagination)
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
      // Look for an anchor with class "group" that contains a span with class "text-xs" whose text is "Next".
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

  // Close the browser when done.
  await browser.close();
  return fullText;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
