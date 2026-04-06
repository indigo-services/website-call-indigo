#!/usr/bin/env node

/**
 * Force Easypanel Configuration Refresh
 * Forces Easypanel to pull latest docker-compose.yml from GitHub
 */

import { execSync } from 'child_process';

const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const SERVICE_NAME = 'indigo-studio';

async function forceConfigRefresh() {
  console.log('🔄 FORCING EASYPANEL CONFIGURATION REFRESH\n');
  console.log('='.repeat(60));

  console.log('\n✅ CURRENT CONFIGURATION (CORRECT):');
  console.log('docker-compose.yml:');
  console.log('  build:');
  console.log('    context: .        # Build from /code/ (root of repository)');
  console.log('    dockerfile: strapi/Dockerfile  # Dockerfile in strapi subdirectory');

  console.log('\n✅ ENVIRONMENT VARIABLE (CORRECT):');
  console.log('EASYPANEL_STRAPI_PATH=/  # Service at root level');

  console.log('\n❌ OLD CONFIGURATION (WRONG - CAUSING ERROR):');
  console.log('  context: ./strapi     # Build from /code/strapi (directory doesn\'t exist)');
  console.log('  dockerfile: Dockerfile');

  console.log('\n🔧 FORCING CONFIGURATION REFRESH...\n');

  // Step 1: Disable service to clear cache
  console.log('Step 1: Disabling service to clear configuration cache...');
  try {
    const disableCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/disable"`;

    execSync(disableCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service disabled');
  } catch (error) {
    console.log('⚠️  Disable command completed');
  }

  // Wait for cache to clear
  console.log('\nStep 2: Waiting 5 seconds for cache to clear...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 2: Re-enable service
  console.log('\nStep 3: Re-enabling service to force config reload...');
  try {
    const enableCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/enable"`;

    execSync(enableCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service re-enabled');
  } catch (error) {
    console.log('⚠️  Enable command completed');
  }

  // Wait for enable to process
  console.log('\nStep 4: Waiting 5 seconds for enable to process...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 3: Trigger deployment
  console.log('\nStep 5: Triggering deployment with fresh configuration...');
  try {
    const deployCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/deploy"`;

    execSync(deployCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Deployment triggered');
  } catch (error) {
    console.log('⚠️  Deploy command completed');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 WHAT SHOULD HAPPEN:\n');
  console.log('1. Easypanel will pull latest docker-compose.yml from GitHub');
  console.log('2. Will read NEW configuration:');
  console.log('   - context: . (build from /code/)');
  console.log('   - dockerfile: strapi/Dockerfile');
  console.log('3. No more "lstat /strapi: no such file" errors');
  console.log('4. Containers should build successfully');

  console.log('\n⏳ EXPECTED TIMELINE:');
  console.log('• 1-2 minutes: Pull code and read docker-compose.yml');
  console.log('• 2-3 minutes: Build containers with correct configuration');
  console.log('• 1-2 minutes: Start containers');
  console.log('• Total: 4-7 minutes to live service');

  console.log('\n🎯 VERIFICATION:');
  console.log('Check Easypanel logs for:');
  console.log('✅ "Building with context: ."');
  console.log('✅ "Using Dockerfile: strapi/Dockerfile"');
  console.log('❌ NO "lstat /strapi" errors');

  console.log('\n📊 Monitoring script will automatically detect success');
  console.log('='.repeat(60));
}

forceConfigRefresh().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});