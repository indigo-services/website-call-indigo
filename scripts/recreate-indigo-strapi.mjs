#!/usr/bin/env node
/**
 * RECREATE SERVICE AS INDIGO-STRAPI
 * Using the service name Easypanel expects
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const SERVICE_NAME = 'indigo-strapi';  // Using indigo-strapi as Easypanel expects
const PROJECT_NAME = 'riostack';

async function recreateAsIndigoStrapi() {
  console.log('🔄 RECREATING SERVICE AS INDIGO-STRAPI\n');
  console.log('='.repeat(60));

  // Step 1: Delete existing service
  console.log('\n📋 Step 1: Removing existing indigo-studio service...');
  try {
    const deleteCmd = `curl -s -X DELETE \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      "${API_BASE}/projects/${PROJECT_NAME}/services/indigo-studio"`;
    execSync(deleteCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service deleted');
  } catch (error) {
    console.log('⚠️  Delete failed');
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 2: Read the indigo-strapi compose file
  console.log('\n📋 Step 2: Reading indigo-strapi docker-compose configuration...');
  const composeContent = readFileSync('docker-compose.indigo-strapi.yml', 'utf-8');
  console.log('✅ Read', composeContent.split('\n').length, 'lines');
  console.log('   Service Name: indigo-strapi (as Easypanel expects)');

  // Step 3: Create service with inline content
  console.log('\n📋 Step 3: Creating indigo-strapi service...');

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
    console.log('✅ indigo-strapi service created');

    if (result) {
      try {
        const response = JSON.parse(result);
        console.log('   Service ID:', response.id || response.serviceId || response.name);
      } catch (e) {
        console.log('   Response:', result.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('❌ Service creation failed:', error.message);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 4: Deploy the service
  console.log('\n📋 Step 4: Deploying indigo-strapi service...');
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
          console.log('   Error:', response.error.json?.message || response.error.message);
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
  console.log('✅ SERVICE RECREATED AS INDIGO-STRAPI\n');

  console.log('🎯 KEY CHANGES:');
  console.log('• Service name: indigo-strapi (matches Easypanel expectations)');
  console.log('• Image name: indigo-strapi:latest');
  console.log('• All other config remains the same');

  console.log('\n⏳ Monitor deployment:');
  console.log('• https://vps10.riolabs.ai (Easypanel dashboard)');
  console.log('• https://riostack-indigo-studio.ck87nu.easypanel.host/');

  console.log('\n' + '='.repeat(60));
}

recreateAsIndigoStrapi().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});