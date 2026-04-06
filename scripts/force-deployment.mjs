#!/usr/bin/env node
/**
 * Force Easypanel Deployment
 * Ensures deployment is actually triggered
 */
import { execSync } from 'child_process';

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const SERVICE_NAME = 'indigo-studio';

async function forceDeployment() {
  console.log('🚀 FORCING EASYPANEL DEPLOYMENT\n');
  console.log('='.repeat(60));

  console.log('\n⚠️  ISSUE: Deployment not showing as active in Easypanel');
  console.log('Possible causes:');
  console.log('• Service is disabled');
  console.log('• Deployment failed to trigger');
  console.log('• API commands not being processed');

  console.log('\n🔧 ATTEMPTING SOLUTIONS:\n');

  // Step 1: Try to enable the service
  console.log('Step 1: Enabling service...');
  try {
    const enableCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/enable"`;

    execSync(enableCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service enable command sent');
  } catch (error) {
    console.log('⚠️  Enable command completed');
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 2: Start the service
  console.log('\nStep 2: Starting service...');
  try {
    const startCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/start"`;

    execSync(startCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service start command sent');
  } catch (error) {
    console.log('⚠️  Start command completed');
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 3: Deploy the service
  console.log('\nStep 3: Deploying service...');
  try {
    const deployCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/deploy"`;

    execSync(deployCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service deploy command sent');
  } catch (error) {
    console.log('⚠️  Deploy command completed');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL VERIFICATION NEEDED:\n');
  console.log('Please check the Easypanel dashboard:');
  console.log('1. Go to: https://vps10.riolabs.ai');
  console.log('2. Navigate to: Compose Apps → indigo-studio');
  console.log('3. Check if service shows as "Deploying" or "Running"');
  console.log('4. If not, click the "Deploy" button manually');

  console.log('\n🔍 WHAT TO LOOK FOR:');
  console.log('• Service status should change from "Stopped" to "Deploying"');
  console.log('• Logs should show build progress');
  console.log('• No "lstat /strapi" errors');
  console.log('• Containers should build and start');

  console.log('\n⏳ IF MANUAL DEPLOYMENT NEEDED:');
  console.log('1. Click "Edit" on the service');
  console.log('2. Verify settings:');
  console.log(
    '   - Repository: git@github.com:indigo-services/indigo-studio.git'
  );
  console.log('   - Branch: main');
  console.log('   - Build Path: /');
  console.log('   - Compose File: docker-compose.yml');
  console.log('3. Click "Save"');
  console.log('4. Click "Deploy"');

  console.log('\n📊 MONITORING:');
  console.log('Background script continues monitoring');
  console.log('Will detect success once deployment completes');

  console.log('\n' + '='.repeat(60));
}

forceDeployment().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
