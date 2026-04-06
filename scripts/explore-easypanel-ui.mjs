#!/usr/bin/env node

/**
 * Explore Easypanel UI structure
 */

import { chromium } from 'playwright';

const EASYPANEL_URL = 'https://vps10.riolabs.ai';

async function main() {
  console.log('=== Exploring Easypanel UI ===\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    console.log('Loading homepage...');
    await page.goto(EASYPANEL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✓ Loaded');

    // Take screenshot
    await page.screenshot({ path: 'easypanel-homepage.png', fullPage: true });
    console.log('📸 Saved: easypanel-homepage.png');

    // Get page structure
    const content = await page.content();

    // Look for links to projects/services
    console.log('\n=== Looking for navigation links ===');

    const links = await page.locator('a').all();
    console.log(`Found ${links.length} links`);

    const interestingLinks = [];
    for (const link of links) {
      try {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text && (text.includes('riostack') || text.includes('indigo') || text.includes('Compose') || text.includes('Project'))) {
          interestingLinks.push({ text: text.trim(), href });
        }
      } catch (e) {
        // Skip
      }
    }

    console.log('\nInteresting links:');
    interestingLinks.forEach(l => console.log(`  ${l.text} -> ${l.href}`));

    // Look for buttons
    console.log('\n=== Looking for buttons ===');

    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);

    for (const button of buttons.slice(0, 20)) {
      try {
        const text = await button.textContent();
        if (text && text.trim()) {
          console.log(`  - ${text.trim()}`);
        }
      } catch (e) {
        // Skip
      }
    }

    // Wait for user interaction
    console.log('\nPress Ctrl+C to close browser...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
