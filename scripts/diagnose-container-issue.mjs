#!/usr/bin/env node

/**
 * Diagnose Container Issues
 * Check what's happening with the Easypanel deployment
 */

import { execSync } from 'child_process';

const BASE_URL = 'https://riostack-indigo-studio.ck87nu.easypanel.host';

async function diagnoseDeployment() {
  console.log('🔍 Diagnosing Easypanel Deployment Issues\n');
  console.log('='.repeat(60));

  // Test 1: Main endpoint
  console.log('\n📡 Test 1: Main Endpoint');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  // Test 2: Admin panel
  console.log('\n📡 Test 2: Admin Panel');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/manage/admin`, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  // Test 3: API endpoint
  console.log('\n📡 Test 3: API Endpoint');
  console.log('-'.repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/articles`, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Diagnosis:\n');

  console.log('The 503 Service Unavailable error indicates:');
  console.log('1. Containers are not running OR');
  console.log('2. Containers are failing to build OR');
  console.log('3. Containers are crashing after starting');

  console.log('\n📋 Most Likely Causes:');
  console.log('❌ SSH connection failure (repository not accessible)');
  console.log('❌ Docker build errors (missing dependencies)');
  console.log('❌ Container crash loops (application errors)');
  console.log('❌ Port conflicts or network issues');

  console.log('\n🔧 Required Actions:');
  console.log('1. Fix SSH configuration in Easypanel dashboard:');
  console.log('   - Repository URL: git@github.com:indigo-services/indigo-studio.git');
  console.log('   - SSH Key: Complete (not truncated)');
  console.log('   - Branch: main');

  console.log('\n2. Check Easypanel logs:');
  console.log('   - Go to: https://vps10.riolabs.ai');
  console.log('   - Navigate to: Compose Apps → indigo-studio');
  console.log('   - Click "Logs" to see container build/run logs');

  console.log('\n3. Trigger fresh deployment:');
  console.log('   - Click "Deploy" button');
  console.log('   - Wait 2-3 minutes for containers to build');

  console.log('\n📊 Monitoring:');
  console.log('The background monitoring script will continue checking');
  console.log('and will alert when endpoints become available.');

  console.log('\n' + '='.repeat(60));
}

diagnoseDeployment();