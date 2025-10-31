/**
 * Take a screenshot of the running application
 * Usage: npx ts-node scripts/screenshot.ts [url] [output-path]
 */

import { chromium } from 'playwright';
import path from 'path';

async function takeScreenshot(
  url: string = 'http://localhost:5173',
  outputPath: string = 'screenshot.png'
): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait a bit for any animations
    await page.waitForTimeout(1000);

    console.log(`Taking screenshot...`);
    await page.screenshot({ path: outputPath, fullPage: false });

    console.log(`✓ Screenshot saved to: ${path.resolve(outputPath)}`);
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Parse command line arguments
const url = process.argv[2] || 'http://localhost:5173';
const outputPath = process.argv[3] || 'screenshot.png';

takeScreenshot(url, outputPath).catch((error) => {
  console.error(error);
  process.exit(1);
});
