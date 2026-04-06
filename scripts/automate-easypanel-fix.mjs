#!/usr/bin/env node

/**
 * Automate Easypanel UI Fix using Playwright
 * Clears cached configuration and triggers fresh deployment
 */

import { chromium } from 'playwright';

const EASYPANEL_URL = 'https://vps10.riolabs.ai';
const USERNAME = 'admin'; // Default Easypanel username
const PASSWORD = process.env.EASYPANEL_PASSWORD || 'changeme'; // Default password
const PROJECT_NAME = 'riostack';
const SERVICE_NAME = 'indigo-studio';

const SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`;

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Easypanel UI Automation - Cache Fix                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('Starting browser...');

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 500, // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to Easypanel
    console.log('\n=== Step 1: Navigating to Easypanel ===');
    await page.goto(EASYPANEL_URL, { waitUntil: 'networkidle' });
    console.log('✓ Loaded Easypanel homepage');

    // Check if we're already logged in (redirected to dashboard)
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('\n=== Step 2: Logging in ===');
      // Fill in login form
      await page.fill('input[name="email"], input[type="email"]', 'admin@riolabs.ai');
      await page.fill('input[name="password"], input[type="password"]', PASSWORD);

      // Click login button
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      console.log('✓ Logged in');
    } else {
      console.log('✓ Already logged in (or no auth required)');
    }

    // Step 2: Navigate to project
    console.log('\n=== Step 3: Navigating to Project ===');
    await page.goto(`${EASYPANEL_URL}/project/${PROJECT_NAME}`, { waitUntil: 'networkidle' });
    console.log('✓ Loaded project page');

    // Step 3: Find and click on the service
    console.log('\n=== Step 4: Finding Service ===');

    // Look for the service in the list
    const serviceSelector = `text="${SERVICE_NAME}"`;
    const serviceExists = await page.locator(serviceSelector).count() > 0;

    if (!serviceExists) {
      console.log(`⚠ Service "${SERVICE_NAME}" not found in the list`);
      console.log('Available services:');
      const services = await page.locator('[class*="service"], [class*="compose"]').allTextContents();
      services.forEach(s => console.log('  -', s.trim()));
    } else {
      console.log(`✓ Found service "${SERVICE_NAME}"`);

      // Click on the service
      await page.click(serviceSelector);
      await page.waitForLoadState('networkidle');
      console.log('✓ Opened service details');
    }

    // Step 4: Look for Edit button
    console.log('\n=== Step 5: Looking for Edit Button ===');

    const editSelectors = [
      'button:has-text("Edit")',
      'a:has-text("Edit")',
      '[aria-label="Edit"]',
      'button[class*="edit"]',
    ];

    let editClicked = false;
    for (const selector of editSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✓ Found Edit button with selector: ${selector}`);
          await page.click(selector);
          editClicked = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!editClicked) {
      console.log('⚠ Could not find Edit button');
      console.log('Available buttons:');
      const buttons = await page.locator('button').allTextContents();
      buttons.forEach(b => console.log('  -', b.trim()));
    } else {
      await page.waitForTimeout(2000);
      console.log('✓ Clicked Edit button');

      // Step 5: Clear source configuration
      console.log('\n=== Step 6: Clearing Source Configuration ===');

      // Look for GitHub/Inline source toggle
      const sourceTypeSelectors = [
        'button:has-text("GitHub")',
        'button:has-text("Inline")',
        'label:has-text("GitHub")',
        'label:has-text("Inline")',
        '[role="tab"]:has-text("Source")',
      ];

      // Take a screenshot for debugging
      await page.screenshot({ path: 'easypanel-edit-page.png', fullPage: true });
      console.log('📸 Saved screenshot: easypanel-edit-page.png');

      // Try to find source configuration section
      const pageContent = await page.content();
      if (pageContent.includes('GitHub') || pageContent.includes('github')) {
        console.log('✓ Found GitHub configuration on page');
      }

      if (pageContent.includes('Inline') || pageContent.includes('inline')) {
        console.log('✓ Found Inline configuration on page');
      }

      // Step 6: Look for docker-compose.yml configuration
      if (pageContent.includes('docker-compose') || pageContent.includes('compose')) {
        console.log('✓ Found compose configuration on page');
      }

      // Step 7: Look for SSH key input
      if (pageContent.includes('SSH') || pageContent.includes('ssh')) {
        console.log('✓ Found SSH key configuration');
      }

      // Step 8: Try to configure GitHub source
      console.log('\n=== Step 7: Configuring GitHub Source ===');

      // Try to find and click GitHub tab/button
      const githubTab = await page.locator('button:has-text("GitHub"), label:has-text("GitHub"), [role="tab"]:has-text("GitHub")').first();
      const githubTabCount = await githubTab.count();

      if (githubTabCount > 0) {
        await githubTab.click();
        console.log('✓ Clicked GitHub tab');

        // Fill in GitHub configuration
        await page.waitForTimeout(1000);

        // Repository input
        const repoInput = await page.locator('input[name*="repo"], input[placeholder*="repo"], input[placeholder*="repository"]').first();
        if (await repoInput.count() > 0) {
          await repoInput.fill('indigo-services/indigo-studio');
          console.log('✓ Set repository');
        }

        // Branch input
        const branchInput = await page.locator('input[name*="branch"], input[placeholder*="branch"]').first();
        if (await branchInput.count() > 0) {
          await branchInput.fill('main');
          console.log('✓ Set branch');
        }

        // Path input
        const pathInput = await page.locator('input[name*="path"], input[placeholder*="path"]').first();
        if (await pathInput.count() > 0) {
          await pathInput.fill('/');
          console.log('✓ Set path');
        }

        // SSH key textarea
        const sshTextarea = await page.locator('textarea[name*="ssh"], textarea[placeholder*="SSH"], textarea[placeholder*="key"]').first();
        if (await sshTextarea.count() > 0) {
          await sshTextarea.fill(SSH_KEY);
          console.log('✓ Set SSH key');
        }

        // Click Save
        const saveButton = await page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          console.log('✓ Clicked Save');
          await page.waitForTimeout(3000);
        }
      } else {
        console.log('⚠ Could not find GitHub tab');
      }

      // Step 9: Trigger deployment
      console.log('\n=== Step 8: Triggering Deployment ===');

      // Go back to service details
      await page.goto(`${EASYPANEL_URL}/project/${PROJECT_NAME}`, { waitUntil: 'networkidle' });

      // Click on service
      await page.click(serviceSelector);
      await page.waitForLoadState('networkidle');

      // Look for Deploy button
      const deployButton = await page.locator('button:has-text("Deploy"), button:has-text("Redeploy")').first();
      if (await deployButton.count() > 0) {
        await deployButton.click();
        console.log('✓ Clicked Deploy button');
      } else {
        console.log('⚠ Could not find Deploy button');
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'easypanel-final-state.png', fullPage: true });
    console.log('📸 Saved final screenshot: easypanel-final-state.png');

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Automation Complete!                                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    console.log('\nPlease check:');
    console.log('1. Screenshots saved to current directory');
    console.log('2. Easypanel UI for deployment status');
    console.log('3. Service logs for any errors');

    // Wait for user to see what happened
    console.log('\nPress Ctrl+C to exit (browser will stay open for 30 seconds)');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);

    // Take error screenshot
    try {
      await page.screenshot({ path: 'easypanel-error.png', fullPage: true });
      console.log('📸 Saved error screenshot: easypanel-error.png');
    } catch (e) {
      // Ignore screenshot errors
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
