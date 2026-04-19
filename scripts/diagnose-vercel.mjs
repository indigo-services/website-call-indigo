#!/usr/bin/env node
/**
 * Vercel Project Manager Diagnostic Script
 * Run this to diagnose Vercel extension issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vercel Project Manager Diagnostic\n');

// Check Vercel CLI authentication
try {
  console.log('1. Checking Vercel CLI authentication...');
  const whoami = execSync('vercel whoami', { encoding: 'utf8' }).trim();
  console.log('   ✅ Authenticated as:', whoami);
} catch (error) {
  console.log('   ❌ Vercel CLI not authenticated');
  console.log('   Run: vercel login');
  process.exit(1);
}

// Check environment variables
console.log('\n2. Checking environment variables...');
const envFiles = ['.env', '.env.local'];
let vercelTokenFound = false;

for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('VERCEL_TOKEN=')) {
      console.log(`   ✅ VERCEL_TOKEN found in ${envFile}`);
      vercelTokenFound = true;
    }
  }
}

if (!vercelTokenFound) {
  console.log('   ⚠️  VERCEL_TOKEN not found in environment files');
}

// Check VSCode settings
console.log('\n3. Checking VSCode settings...');
const settingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  if (settings['vercel-project-manager']) {
    console.log('   ✅ Vercel Project Manager settings found');
    console.log('   Configuration:', JSON.stringify(settings['vercel-project-manager'], null, 2));
  } else {
    console.log('   ❌ Vercel Project Manager settings not found in .vscode/settings.json');
  }
} else {
  console.log('   ❌ .vscode/settings.json not found');
}

// Check project linkage
console.log('\n4. Checking Vercel project linkage...');
try {
  const linkInfo = execSync('vercel link inspect', { encoding: 'utf8' }).trim();
  console.log('   ✅ Project linked:', linkInfo);
} catch (error) {
  console.log('   ⚠️  Project not linked to Vercel');
  console.log('   Run: vercel link');
}

console.log('\n🔧 Quick Fixes:');
console.log('1. Reload VSCode window (Ctrl+Shift+P > "Reload Window")');
console.log('2. Click "Login to Vercel" in the extension panel');
console.log('3. Check browser console for authentication errors');
console.log('4. Ensure VERCEL_TOKEN is set in your environment');

process.exit(0);