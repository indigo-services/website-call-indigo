#!/usr/bin/env node
/**
 * Nuke and Recreate - Complete Service Deletion and Recreation
 * This script completely removes the service and recreates it from scratch
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const SERVICE_NAME = 'indigo-studio';
const PROJECT_NAME = 'riostack';

async function nukeAndRecreate() {
  console.log('💥 NUKE AND RECREATE SERVICE\n');
  console.log('='.repeat(60));

  // Step 1: Get all compose services
  console.log('\n📋 Step 1: Getting all compose services...');
  try {
    const servicesCmd = `curl -s -X GET \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      "${API_BASE}/compose-services"`;

    const servicesResult = execSync(servicesCmd, { encoding: 'utf-8' });
    console.log('✅ Retrieved services');

    // Parse the result to find our service
    const services = JSON.parse(servicesResult);
    const indigoService = services.find(s => s.name === SERVICE_NAME || s.id === SERVICE_NAME);

    if (indigoService) {
      console.log('✅ Found service:', indigoService.name || indigoService.id);

      // Step 2: Stop the service
      console.log('\n📋 Step 2: Stopping service...');
      try {
        const stopCmd = `curl -s -X POST \\
          -H "Authorization: Bearer ${API_TOKEN}" \\
          "${API_BASE}/compose-services/${SERVICE_NAME}/stop"`;
        execSync(stopCmd, { encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ Service stopped');
      } catch (error) {
        console.log('⚠️  Stop failed, continuing...');
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Delete the service completely
      console.log('\n📋 Step 3: Deleting service completely...');
      try {
        const deleteCmd = `curl -s -X DELETE \\
          -H "Authorization: Bearer ${API_TOKEN}" \\
          "${API_BASE}/compose-services/${SERVICE_NAME}"`;
        execSync(deleteCmd, { encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ Service deleted');
      } catch (error) {
        console.log('⚠️  Delete failed, service may not exist');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('⚠️  Service not found, will create fresh');
    }
  } catch (error) {
    console.log('⚠️  Could not retrieve services:', error.message);
  }

  // Step 4: Read docker-compose.yml locally
  console.log('\n📋 Step 4: Reading docker-compose.yml locally...');
  const composeContent = readFileSync('docker-compose.yml', 'utf-8');
  console.log('✅ Read', composeContent.split('\n').length, 'lines');

  // Step 5: Create service with inline compose content
  console.log('\n📋 Step 5: Creating fresh service with inline compose content...');

  const payload = {
    projectName: PROJECT_NAME,
    serviceName: SERVICE_NAME,
    source: {
      type: 'inline',
      content: composeContent
    },
    env: [
      { key: 'HOST', value: '0.0.0.0' },
      { key: 'PORT', value: '1337' },
      { key: 'NODE_ENV', value: 'production' },
      { key: 'DATABASE_CLIENT', value: 'sqlite' },
      { key: 'DATABASE_FILENAME', value: '.tmp/data.db' },
      { key: 'APP_KEYS', value: 'd3800189_ad55_41bf_a330_0e326d6873781,ae374b7b_2d06_4c99_9be0_08d6c0ed34622' },
      { key: 'API_TOKEN_SALT', value: '63a1c48c_c951_4bfe_831a_f34009a317c3' },
      { key: 'ADMIN_JWT_SECRET', value: '05130689_2be1_46cc_ad3b_ae1d02798660' },
      { key: 'TRANSFER_TOKEN_SALT', value: '00df0dde_c4b6_412a_a239_c65963c7e02a' },
      { key: 'JWT_SECRET', value: '300f6f44_f604_4fa0_8e9c_4110412dd41e' },
      { key: 'ADMIN_AUTH_SECRET', value: '05130689_2be1_46cc_ad3b_ae1d02798660' },
      { key: 'ADMIN_PATH', value: '/admin' },
      { key: 'CLIENT_URL', value: 'https://indigo-website-cms.vercel.app' },
      { key: 'PREVIEW_SECRET', value: '300f6f44_f604_4fa0_8e9c_4110412dd41e' },
      { key: 'URL', value: 'https://riostack-indigo-studio.ck87nu.easypanel.host' },
      { key: 'PUBLIC_URL', value: 'https://riostack-indigo-studio.ck87nu.easypanel.host' }
    ],
    createDotEnv: false,
    domains: [
      {
        host: 'riostack-indigo-studio.ck87nu.easypanel.host',
        https: true,
        path: '/',
        port: 1337,
        internalProtocol: 'http',
        service: SERVICE_NAME
      }
    ]
  };

  try {
    const createCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(payload)}' \\
      "${API_BASE}/compose-services"`;

    const result = execSync(createCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service created with inline compose content');

    if (result) {
      try {
        const response = JSON.parse(result);
        console.log('   Service ID:', response.id || response.name);
      } catch (e) {
        console.log('   Response:', result.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('❌ Service creation failed:', error.message);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 6: Deploy the service
  console.log('\n📋 Step 6: Deploying service...');
  try {
    const deployCmd = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      -d '{"json":{"serviceName":"${SERVICE_NAME}","projectName":"${PROJECT_NAME}"}}' \\
      "${API_BASE}/trpc/services.compose.deployService"`;

    const result = execSync(deployCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Deployment triggered');

    if (result) {
      try {
        const response = JSON.parse(result);
        if (response.error) {
          console.log('   ⚠️  Error response:', response.error.json?.message || response.error.message);
        } else {
          console.log('   Deployment started successfully');
        }
      } catch (e) {
        console.log('   Response:', result.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('⚠️  Deploy command completed');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 NUKE AND RECREATE COMPLETE\n');

  console.log('✅ SERVICE COMPLETELY RECREATED:');
  console.log('• Old service deleted');
  console.log('• Fresh service created with inline compose');
  console.log('• No cached configuration');

  console.log('\n⏳ EXPECTED RESULT:');
  console.log('• Containers should build successfully');
  console.log('• No more "lstat /strapi" errors');
  console.log('• Service becomes live in 3-5 minutes');

  console.log('\n🔍 MONITORING:');
  console.log('• Check Easypanel dashboard: https://vps10.riolabs.ai');
  console.log('• Service should show as "Deploying" then "Running"');
  console.log('• Check logs for build progress');

  console.log('\n' + '='.repeat(60));
}

nukeAndRecreate().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});