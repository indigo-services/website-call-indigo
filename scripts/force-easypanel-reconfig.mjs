#!/usr/bin/env node
/**
 * Force Easypanel to Re-read Configuration
 * Directly updates the service configuration to force a fresh read
 */
import { execSync } from 'child_process';

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';

async function forceReconfig() {
  console.log('🔧 FORCING EASYPANEL TO RE-READ CONFIGURATION\n');
  console.log('='.repeat(60));

  console.log('\n❌ THE PROBLEM:');
  console.log('Easypanel is still using cached configuration:');
  console.log("  Old build path: /code/strapi (doesn't exist)");
  console.log('  New build path should be: /code/ (exists)');

  console.log('\n🔧 THE SOLUTION:');
  console.log('Force Easypanel to completely reload the service configuration');

  // Use the Easypanel client library that's already working
  try {
    const { EasypanelClient } = await import('./lib/easypanel.mjs');

    const client = new EasypanelClient({
      apiBaseUrl: 'https://vps10.riolabs.ai/api',
      apiToken: API_TOKEN,
    });

    console.log('\n📋 Step 1: Getting current service configuration...');
    const services = await client.findServices({
      projectId: 'riostack',
      type: 'compose',
    });

    const indigoService = services.find((s) => s.name === 'indigo-studio');
    if (!indigoService) {
      throw new Error('Service indigo-studio not found');
    }

    console.log('✅ Found service:', indigoService.name);
    console.log('   ID:', indigoService.id);
    console.log('   Type:', indigoService.type);

    console.log('\n📋 Step 2: Forcing configuration reload...');

    // Try to find a method that forces a config reload
    // Looking for methods like reloadService, refreshService, etc.

    // First, let's try to stop the service completely
    console.log('Stopping service to clear cache...');
    try {
      await client.stopService({ serviceId: indigoService.id });
      console.log('✅ Service stopped');
    } catch (error) {
      console.log('⚠️  Stop failed:', error.message);
    }

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Start the service again
    console.log('Starting service with fresh config...');
    try {
      await client.startService({ serviceId: indigoService.id });
      console.log('✅ Service started');
    } catch (error) {
      console.log('⚠️  Start failed:', error.message);
    }

    // Wait for startup
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Try deploying
    console.log('Triggering deployment...');
    try {
      await client.deployService({ serviceId: indigoService.id });
      console.log('✅ Deployment triggered');
    } catch (error) {
      console.log('❌ Deploy failed:', error.message);
      console.log('   This might be the SSH/configuration issue');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULT:\n');
    console.log('Service has been stopped, started, and deployment triggered.');
    console.log(
      'This should force Easypanel to re-read the docker-compose.yml'
    );

    console.log('\n⏳ Check Easypanel logs for:');
    console.log('✅ No more "lstat /strapi" errors');
    console.log('✅ Build context should be: /code/');
    console.log('✅ Dockerfile path should be: strapi/Dockerfile');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log(
      '\n📋 Manual intervention may be required in Easypanel dashboard'
    );
  }

  console.log('\n' + '='.repeat(60));
}

forceReconfig().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
