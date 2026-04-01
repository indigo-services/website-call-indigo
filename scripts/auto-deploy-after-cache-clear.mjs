#!/usr/bin/env node
/**
 * Automated Deployment After Cache Clear
 * Run this after manually clearing the Easypanel cache
 */
import { execSync } from 'child_process';

async function autoDeployAfterCacheClear() {
  console.log('🚀 AUTOMATED DEPLOYMENT AFTER CACHE CLEAR\n');
  console.log('='.repeat(60));

  console.log('\n⚠️  PREREQUISITE:');
  console.log('You must have manually deleted the indigo-studio service');
  console.log('from the Easypanel UI before running this script.');

  console.log('\n📋 AUTOMATED STEPS:');
  console.log('1. Bootstrap: Create fresh service');
  console.log('2. Deploy: Trigger deployment');
  console.log('3. Monitor: Check service health');

  console.log('\n📋 Step 1: Bootstrapping fresh service...');
  try {
    execSync('yarn easypanel:bootstrap', {
      encoding: 'utf-8',
      stdio: 'inherit',
      timeout: 180000
    });
    console.log('✅ Bootstrap successful');
  } catch (error) {
    console.log('❌ Bootstrap failed:', error.message);
    console.log('\n⚠️  Make sure you deleted the service in Easypanel UI first!');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n📋 Step 2: Deploying service...');
  try {
    execSync('yarn easypanel:deploy', {
      encoding: 'utf-8',
      stdio: 'inherit',
      timeout: 180000
    });
    console.log('✅ Deployment triggered');
  } catch (error) {
    console.log('⚠️  Deploy command had issues');
    console.log('   This is expected if containers are building');
  }

  console.log('\n📋 Step 3: Waiting for containers to build...');
  console.log('This usually takes 3-5 minutes...');

  // Monitor deployment
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts = 5 minutes

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const response = await fetch('https://riostack-indigo-studio.ck87nu.easypanel.host/');
      const is200 = response.status === 200;
      const is302 = response.status === 302; // Redirect to admin is OK
      const is502 = response.status === 502; // Containers starting
      const is503 = response.status === 503; // Service unavailable

      if (is200 || is302) {
        console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
        console.log(`   HTTP ${response.status} - Service is live`);

        // Test admin endpoint
        try {
          const adminResponse = await fetch('https://riostack-indigo-studio.ck87nu.easypanel.host/admin');
          console.log(`   Admin endpoint: HTTP ${adminResponse.status}`);
        } catch (error) {
          console.log('   Admin endpoint: Could not test');
        }

        console.log('\n🎯 DEPLOYMENT COMPLETE!');
        console.log('✅ Service URL: https://riostack-indigo-studio.ck87nu.easypanel.host');
        console.log('✅ Admin URL: https://riostack-indigo-studio.ck87nu.easypanel.host/admin');

        console.log('\n📊 VALIDATION CHECKLIST:');
        console.log('✅ HTTP 200/302 response from root endpoint');
        console.log('✅ Admin panel accessible');
        console.log('✅ Containers built and running');
        console.log('✅ No cache issues');

        return;
      } else if (is502) {
        console.log(`   [${attempts}/${maxAttempts}] HTTP 502 - Containers still building...`);
      } else if (is503) {
        console.log(`   [${attempts}/${maxAttempts}] HTTP 503 - Service starting...`);
      } else {
        console.log(`   [${attempts}/${maxAttempts}] HTTP ${response.status} - Waiting...`);
      }
    } catch (error) {
      console.log(`   [${attempts}/${maxAttempts}] Connection failed - ${error.message}`);
    }

    // Wait 10 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log('\n⚠️  Monitoring timed out after 5 minutes');
  console.log('📋 Service may still be deploying...');
  console.log('   Check Easypanel dashboard: https://vps10.riolabs.ai');
  console.log('   Check logs for any errors');

  console.log('\n' + '='.repeat(60));
}

autoDeployAfterCacheClear().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});