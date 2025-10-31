/**
 * Take a screenshot with console logging
 */

import { chromium } from 'playwright';
import path from 'path';

async function debugScreenshot(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', (msg) => {
    console.log(`BROWSER LOG [${msg.type()}]:`, msg.text());
  });

  // Capture errors
  page.on('pageerror', (error) => {
    console.error('BROWSER ERROR:', error.message);
  });

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Get HTML content
    const html = await page.content();
    console.log('\n=== PAGE HTML (first 500 chars) ===');
    console.log(html.substring(0, 500));

    // Wait a bit
    await page.waitForTimeout(2000);

    // Check if loading element exists
    const loadingExists = await page.locator('#loading').count();
    console.log(`\n#loading element count: ${loadingExists}`);

    if (loadingExists > 0) {
      const loadingVisible = await page.locator('#loading').isVisible();
      console.log(`#loading is visible: ${loadingVisible}`);

      const loadingText = await page.locator('#loading').textContent();
      console.log(`#loading text: ${loadingText}`);
    }

    console.log('\nTaking screenshot...');
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: false });

    console.log(`✓ Screenshot saved to: ${path.resolve('debug-screenshot.png')}`);
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

debugScreenshot().catch((error) => {
  console.error(error);
  process.exit(1);
});
