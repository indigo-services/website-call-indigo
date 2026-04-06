#!/usr/bin/env node
/**
 * Complete Service Recreation
 * Uses Easypanel's production methods to fully clear cache and recreate
 */
import { execSync } from 'child_process';

async function recreateService() {
  console.log('🔄 COMPLETE SERVICE RECREATION\n');
  console.log('='.repeat(60));

  console.log('\n📋 PRODUCTION APPROACH:');
  console.log('1. Check if service exists');
  console.log('2. Delete existing service completely');
  console.log('3. Wait for deletion to process');
  console.log('4. Create fresh service with inline content');
  console.log('5. Deploy fresh service');

  console.log('\n📋 Step 1: Checking current service status...');
  try {
    execSync('yarn easypanel:status', { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service exists, will proceed with deletion');
  } catch (error) {
    console.log('⚠️  Status check failed, continuing anyway');
  }

  console.log('\n📋 Step 2: Deleting existing service...');
  // Use the Easypanel API directly to delete
  const API_TOKEN =
    'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
  const API_BASE = 'https://vps10.riolabs.ai/api';

  try {
    const deleteCmd = `curl -s -X DELETE \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      "${API_BASE}/projects/riostack/services/indigo-studio"`;

    execSync(deleteCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service deletion command sent');
  } catch (error) {
    console.log('⚠️  Delete command may have failed');
  }

  console.log('\n📋 Step 3: Waiting for deletion to process...');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('✅ Wait complete');

  console.log('\n📋 Step 4: Creating fresh service with inline content...');
  try {
    execSync('yarn easypanel:bootstrap', {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
    console.log('✅ Fresh service created with inline content');
  } catch (error) {
    console.log('❌ Bootstrap failed:', error.message);
    return;
  }

  console.log('\n📋 Step 5: Deploying fresh service...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    execSync('yarn easypanel:deploy', { encoding: 'utf-8', stdio: 'inherit' });
    console.log('✅ Deployment triggered');
  } catch (error) {
    console.log('❌ Deploy failed:', error.message);
    console.log('\n⚠️  This might be the docker compose issue');
    console.log('   Check Easypanel logs for specific error');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RECREATION COMPLETE\n');

  console.log('🔍 Check deployment status:');
  console.log('• Go to: https://vps10.riolabs.ai');
  console.log('• Check if indigo-studio service is running');
  console.log('• View logs for any docker compose errors');

  console.log('\n⏳ Expected timeline:');
  console.log('• 2-3 minutes: Containers build');
  console.log('• 1-2 minutes: Containers start');
  console.log('• Total: 3-5 minutes to live service');

  console.log('\n📊 Monitoring:');
  console.log('Background script will detect success automatically');

  console.log('\n' + '='.repeat(60));
}

recreateService().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
