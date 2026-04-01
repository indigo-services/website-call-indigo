#!/usr/bin/env node
/**
 * SSH into Easypanel server and clear cache manually
 * This requires SSH access to the Easypanel server
 */
import { execSync } from 'child_process';

async function clearCacheSSH() {
  console.log('🔧 CLEARING EASYPANEL CACHE VIA SSH\n');
  console.log('='.repeat(60));

  const EASYPANEL_HOST = 'vps10.riolabs.ai';
  const CACHE_PATH = '/etc/easypanel/projects/riostack/indigo-studio/code';

  console.log('\n❌ THE PROBLEM:');
  console.log('Easypanel has cached the old docker-compose.yml at:');
  console.log(`  ${CACHE_PATH}/docker-compose.yml`);
  console.log('\nThis cached file has the old service name "indigo-strapi"');
  console.log('and incorrect build context "/strapi" instead of "."');

  console.log('\n🔧 THE SOLUTION:');
  console.log('Option 1: Manual deletion in Easypanel UI (Recommended)');
  console.log('Option 2: SSH into server and delete cache (Requires SSH access)');

  console.log('\n📋 OPTION 1: MANUAL UI STEPS:');
  console.log('1. Go to: https://vps10.riolabs.ai');
  console.log('2. Navigate to: Compose Apps → indigo-studio');
  console.log('3. Click "Delete" to remove the service completely');
  console.log('4. Wait 30 seconds for deletion to complete');
  console.log('5. Run: yarn easypanel:bootstrap');
  console.log('6. Run: yarn easypanel:deploy');

  console.log('\n📋 OPTION 2: SSH COMMANDS (if you have SSH access):');
  console.log('# SSH into the Easypanel server');
  console.log(`ssh root@${EASYPANEL_HOST}`);
  console.log('');
  console.log('# Stop the service');
  console.log('cd /etc/easypanel/projects/riostack/indigo-studio/code');
  console.log('docker compose down');
  console.log('');
  console.log('# Clear the cache');
  console.log(`rm -rf ${CACHE_PATH}`);
  console.log('');
  console.log('# Exit SSH');
  console.log('exit');
  console.log('');
  console.log('# Recreate service from local machine');
  console.log('yarn easypanel:bootstrap');
  console.log('yarn easypanel:deploy');

  console.log('\n📋 OPTION 3: WAIT FOR AUTOMATIC CACHE EXPIRY');
  console.log('Easypanel cache may expire naturally in a few hours.');
  console.log('You can retry deployment periodically.');

  console.log('\n' + '='.repeat(60));
  console.log('🎯 RECOMMENDED ACTION:\n');
  console.log('Use Option 1 (Manual UI deletion) as it is:');
  console.log('• Fastest (takes 2 minutes)');
  console.log('• Most reliable');
  console.log('• No SSH access required');
  console.log('• Guaranteed to clear the cache');

  console.log('\n' + '='.repeat(60));
}

clearCacheSSH().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});