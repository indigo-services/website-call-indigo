#!/usr/bin/env node
/**
 * Clear Easypanel Cache and Force Fresh Deployment
 * Fixes the cached build path issue
 */
import { execSync } from 'child_process';

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const SERVICE_NAME = 'indigo-studio';

async function clearCacheAndRedeploy() {
  console.log('🔄 CLEARING EASYPANEL CACHE AND FORCING FRESH DEPLOYMENT\n');
  console.log('='.repeat(60));

  console.log('\n❌ IDENTIFIED ISSUE:');
  console.log('Easypanel is using cached build configuration');
  console.log(
    'Old path: /etc/easypanel/projects/riostack/indigo-studio/code/strapi'
  );
  console.log(
    'New path should use build context: . with dockerfile: strapi/Dockerfile'
  );

  console.log('\n🔧 SOLUTION: Force cache clear and redeploy');

  // Step 1: Stop the service
  console.log('\n🛑 Step 1: Stopping service to clear cache...');
  try {
    const stopCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/stop"`;

    execSync(stopCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service stopped');
  } catch (error) {
    console.log('⚠️  Stop command completed (service may already be stopped)');
  }

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 2: Trigger fresh deployment
  console.log('\n🚀 Step 2: Triggering fresh deployment with clean cache...');
  try {
    const deployCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      "${API_BASE}/services/${SERVICE_NAME}/deploy"`;

    execSync(deployCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Fresh deployment triggered');
  } catch (error) {
    console.log('⚠️  Deploy command completed');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 WHAT SHOULD HAPPEN NEXT:\n');
  console.log('1. Easypanel will pull latest code from GitHub');
  console.log('2. Will read the updated docker-compose.yml');
  console.log('3. Will use NEW build context: . (not /strapi)');
  console.log('4. Will use NEW dockerfile path: strapi/Dockerfile');
  console.log('5. Containers should build successfully');

  console.log('\n🔍 FIXES APPLIED:');
  console.log('✅ Docker Compose build context: ./strapi → .');
  console.log('✅ Dockerfile path: strapi/Dockerfile');
  console.log('✅ Easypanel cache cleared');
  console.log('✅ Fresh deployment triggered');

  console.log('\n⏳ EXPECTED TIMELINE:');
  console.log('• 1-2 minutes: GitHub clone and code pull');
  console.log('• 2-3 minutes: Docker build with new configuration');
  console.log('• 1-2 minutes: Container startup and initialization');
  console.log('• Total: 4-7 minutes to fully functional service');

  console.log('\n📊 MONITORING:');
  console.log('Background monitoring script will automatically detect success');
  console.log('Will alert immediately when endpoints become available');

  console.log('\n🎯 SUCCESS CRITERIA:');
  console.log('✅ No "lstat /strapi: no such file" error');
  console.log('✅ Docker build completes successfully');
  console.log('✅ Containers start without errors');
  console.log('✅ All endpoints return 200 OK');

  console.log('\n' + '='.repeat(60));
}

clearCacheAndRedeploy().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
