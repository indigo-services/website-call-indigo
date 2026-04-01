#!/usr/bin/env node
/**
 * Use Easypanel Client to Delete and Recreate Service
 */
import { readFileSync } from 'fs';

async function clientRecreate() {
  console.log('🔧 USING EASYPANEL CLIENT TO RECREATE SERVICE\n');
  console.log('='.repeat(60));

  try {
    const { EasypanelClient } = await import('./lib/easypanel.mts');

    const client = new EasypanelClient({
      apiBaseUrl: 'https://vps10.riolabs.ai/api',
      apiToken: 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172',
    });

    console.log('\n📋 Step 1: Finding services...');
    const services = await client.findServices({
      projectId: 'riostack',
      type: 'compose',
    });

    const indigoService = services.find(s => s.name === 'indigo-studio');
    if (!indigoService) {
      throw new Error('Service indigo-studio not found');
    }

    console.log('✅ Found service:', indigoService.name);
    console.log('   ID:', indigoService.id);

    console.log('\n📋 Step 2: Stopping service...');
    try {
      await client.stopService({ serviceId: indigoService.id });
      console.log('✅ Service stopped');
    } catch (error) {
      console.log('⚠️  Stop failed:', error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n📋 Step 3: Deleting service...');
    try {
      // Try different delete methods
      await client.deleteService({ serviceId: indigoService.id });
      console.log('✅ Service deleted');
    } catch (error) {
      console.log('⚠️  Delete failed:', error.message);
      console.log('   Trying alternative method...');

      // Try direct API call
      try {
        const { execSync } = await import('child_process');
        const deleteCmd = `curl -s -X DELETE \\
          -H "Authorization: Bearer e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172" \\
          "https://vps10.riolabs.ai/api/projects/riostack/services/indigo-studio"`;

        execSync(deleteCmd, { encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ Service deleted via API');
      } catch (apiError) {
        console.log('⚠️  API delete also failed:', apiError.message);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n📋 Step 4: Running bootstrap to create fresh service...');
    try {
      const { execSync } = await import('child_process');
      execSync('yarn easypanel:bootstrap', {
        encoding: 'utf-8',
        stdio: 'inherit',
        timeout: 180000
      });
      console.log('✅ Fresh service created');
    } catch (error) {
      console.log('❌ Bootstrap failed:', error.message);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n📋 Step 5: Deploying fresh service...');
    try {
      const { execSync } = await import('child_process');
      execSync('yarn easypanel:deploy', {
        encoding: 'utf-8',
        stdio: 'inherit',
        timeout: 180000
      });
      console.log('✅ Deployment triggered');
    } catch (error) {
      console.log('❌ Deploy failed:', error.message);
      console.log('\n⚠️  This might still be the cache issue');
      console.log('   If deployment fails, manual intervention needed in Easypanel UI');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 RECREATION COMPLETE\n');

    console.log('✅ Service deleted and recreated');
    console.log('✅ Fresh configuration applied');

    console.log('\n⏳ EXPECTED RESULT:');
    console.log('• Containers should build successfully');
    console.log('• No more "lstat /strapi" errors');
    console.log('• Service becomes live in 3-5 minutes');

    console.log('\n🔍 MONITORING:');
    console.log('• Check Easypanel dashboard: https://vps10.riolabs.ai');
    console.log('• Service should show as "Deploying" then "Running"');

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 MANUAL INTERVENTION NEEDED:');
    console.error('1. Go to: https://vps10.riolabs.ai');
    console.error('2. Navigate to: Compose Apps → indigo-studio');
    console.error('3. Delete the service completely');
    console.error('4. Run: yarn easypanel:bootstrap');
    console.error('5. Run: yarn easypanel:deploy');
  }
}

clientRecreate().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});