#!/usr/bin/env node
/**
 * Direct Easypanel Configuration
 * Uses the existing easypanel-ops library to configure the service
 */
import { runEasypanelOps } from './easypanel-ops.mjs';

async function configureEasypanel() {
  console.log('🔧 Configuring Easypanel Service...\n');

  try {
    // Use the easypanel ops library to configure the service
    await runEasypanelOps(['configure-service']);

    console.log('✅ Configuration successful!');
    console.log('\n📋 What was configured:');
    console.log('• SSH Key: Updated to complete key');
    console.log(
      '• Repository URL: git@github.com:indigo-services/indigo-studio.git'
    );
    console.log('• Service: Enabled');
    console.log('• Domain: riostack-indigo-studio.ck87nu.easypanel.host');

    console.log('\n🚀 Triggering deployment...');
    await runEasypanelOps(['deploy']);

    console.log('\n✅ Deployment triggered!');
    console.log(
      'Service should be available at: https://riostack-indigo-studio.ck87nu.easypanel.host/'
    );
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    process.exit(1);
  }
}

configureEasypanel();
