#!/usr/bin/env node

/**
 * Fix Easypanel Cache Issue
 * Clears stale docker-compose.yml cache and recreates service with correct configuration
 */

const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const PROJECT_NAME = 'riostack';
const SERVICE_NAME = 'indigo-studio';

const SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`;

// Read docker-compose.yml
import fs from 'fs';
import { execSync } from 'child_process';

const composeContent = fs.readFileSync('docker-compose.yml', 'utf-8');

// Build environment variables
const envVars = [
  'HOST=0.0.0.0',
  'PORT=1337',
  'NODE_ENV=production',
  'DATABASE_CLIENT=sqlite',
  'DATABASE_FILENAME=.tmp/data.db',
  'APP_KEYS=d3800189_ad55_41bf_a330_0e326d6873781,ae374b7b_2d06_4c99_9be0_08d6c0ed34622',
  'API_TOKEN_SALT=63a1c48c_c951_4bfe_831a_f34009a317c3',
  'ADMIN_JWT_SECRET=05130689_2be1_46cc_ad3b_ae1d02798660',
  'TRANSFER_TOKEN_SALT=bbd36f19_e683_47cb_a477_acce1c4531c8',
  'JWT_SECRET=00df0dde_c4b6_412a_a239_c65963c7e02a',
  'ADMIN_AUTH_SECRET=05130689_2be1_46cc_ad3b_ae1d02798660',
  'ADMIN_PATH=/admin',
  'CLIENT_URL=https://indigo-website-cms.vercel.app',
  'PREVIEW_SECRET=300f6f44_f604_4fa0_8e9c_4110412dd41e',
  'URL=https://riostack-indigo-studio.ck87nu.easypanel.host',
  'PUBLIC_URL=https://riostack-indigo-studio.ck87nu.easypanel.host',
].join('\n');

async function trpcGetRequest(operation, input = {}) {
  const baseUrl = API_BASE.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/trpc/${operation}`;

  let url = endpoint;
  if (Object.keys(input).length > 0) {
    const inputParam = encodeURIComponent(JSON.stringify({ json: input }));
    url = `${endpoint}?input=${inputParam}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON, received ${contentType}`);
  }

  const data = await response.json();
  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  return data.result.data.json;
}

async function trpcPostRequest(operation, input = {}) {
  const baseUrl = API_BASE.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/trpc/${operation}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ json: input }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON, received ${contentType}`);
  }

  const data = await response.json();
  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  return data.result.data.json;
}

async function step1_checkCurrentStatus() {
  console.log('\n=== Step 1: Checking Current Service Status ===');

  try {
    const services = await trpcGetRequest('projects.listProjectsAndServices');
    const targetService = services.services.find(
      s => s.projectName === PROJECT_NAME && s.name === SERVICE_NAME
    );

    if (targetService) {
      console.log(`✓ Service found: ${SERVICE_NAME} (${targetService.type})`);
      console.log(`  Enabled: ${targetService.enabled}`);
      console.log(`  Domains: ${targetService.domains?.map(d => d.host).join(', ') || 'none'}`);

      if (targetService.source) {
        console.log(`  Source type: ${targetService.source.type}`);
        if (targetService.source.type === 'github') {
          console.log(`    Repository: ${targetService.source.owner || 'N/A'}/${targetService.source.repo || 'N/A'}`);
          console.log(`    Branch: ${targetService.source.ref || 'N/A'}`);
          console.log(`    Path: ${targetService.source.path || 'N/A'}`);
        }
      }
      return true;
    } else {
      console.log(`✗ Service not found: ${SERVICE_NAME}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error checking status:`, error.message);
    return false;
  }
}

async function step2_deleteExistingService() {
  console.log('\n=== Step 2: Deleting Existing Service to Clear Cache ===');

  try {
    // First try to get compose service details
    try {
      const details = await trpcGetRequest('services.compose.inspectService', {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
      });
      console.log(`✓ Found compose service, will delete`);
    } catch (error) {
      console.log(`⚠ Service inspection failed: ${error.message}`);
      console.log(`  Continuing with deletion attempt...`);
    }

    // Delete using the service deletion endpoint
    // This is a direct API call to delete the service
    const deleteUrl = `${API_BASE.replace('/api', '')}/api/projects/${PROJECT_NAME}/services/${SERVICE_NAME}`;

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
        },
      });

      if (response.ok) {
        console.log(`✓ Service deletion command sent`);
      } else {
        const text = await response.text();
        console.log(`⚠ Deletion response: ${response.status} - ${text}`);
      }
    } catch (error) {
      console.log(`⚠ Deletion failed: ${error.message}`);
    }

    // Wait for deletion to process
    console.log(`⏳ Waiting 5 seconds for deletion to process...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    return true;
  } catch (error) {
    console.error(`✗ Error during deletion:`, error.message);
    return false;
  }
}

async function step3_createFreshService() {
  console.log('\n=== Step 3: Creating Fresh Service with Correct Configuration ===');

  try {
    const payload = {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
      source: {
        type: 'github',
        owner: 'indigo-services',
        repo: 'indigo-studio',
        ref: 'main',
        path: '/',
        composeFile: 'docker-compose.yml',
        sshKey: SSH_KEY,
      },
      env: envVars,
      createDotEnv: false,
      domains: [{
        host: 'riostack-indigo-studio.ck87nu.easypanel.host',
        https: true,
        path: '/',
        port: 1337,
        internalProtocol: 'http',
        service: 'indigo-strapi',
      }],
    };

    console.log(`Creating service with GitHub source:`);
    console.log(`  Repository: ${payload.source.owner}/${payload.source.repo}`);
    console.log(`  Branch: ${payload.source.ref}`);
    console.log(`  Path: ${payload.source.path}`);
    console.log(`  Compose File: ${payload.source.composeFile}`);

    const result = await trpcRequest('services.compose.createService', payload);

    console.log(`✓ Service created successfully`);
    console.log(`  Name: ${result.name}`);
    console.log(`  Type: ${result.type}`);

    return true;
  } catch (error) {
    console.error(`✗ Error creating service:`, error.message);
    console.log(`\nTrying fallback method with inline content...`);

    // Fallback: Try with inline content
    try {
      const inlinePayload = {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
        source: {
          type: 'inline',
          content: composeContent,
        },
        env: envVars,
        createDotEnv: false,
        domains: [{
          host: 'riostack-indigo-studio.ck87nu.easypanel.host',
          https: true,
          path: '/',
          port: 1337,
          internalProtocol: 'http',
          service: 'indigo-strapi',
        }],
      };

      const result = await trpcRequest('services.compose.createService', inlinePayload);
      console.log(`✓ Service created with inline content`);
      console.log(`  Name: ${result.name}`);
      console.log(`  Type: ${result.type}`);

      return true;
    } catch (fallbackError) {
      console.error(`✗ Fallback also failed:`, fallbackError.message);
      return false;
    }
  }
}

async function step4_deployService() {
  console.log('\n=== Step 4: Deploying Service ===');

  try {
    await trpcRequest('services.compose.deployService', {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
      forceRebuild: true,
    });

    console.log(`✓ Deployment triggered successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error triggering deployment:`, error.message);
    return false;
  }
}

async function step5_monitorDeployment() {
  console.log('\n=== Step 5: Monitoring Deployment ===');
  console.log(`⏳ Waiting 30 seconds before checking deployment status...`);

  await new Promise(resolve => setTimeout(resolve, 30000));

  // Check service status
  try {
    const service = await trpcRequest('services.compose.inspectService', {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
    });

    console.log(`✓ Service status retrieved:`);
    console.log(`  Name: ${service.name}`);
    console.log(`  Type: ${service.type}`);
    console.log(`  Enabled: ${service.enabled}`);
    console.log(`  Deployment URL: ${service.deploymentUrl || 'N/A'}`);

    return true;
  } catch (error) {
    console.error(`✗ Error checking deployment:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Easypanel Cache Fix & Service Recreation            ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log(`\nTarget: ${PROJECT_NAME}/${SERVICE_NAME}`);
  console.log(`API: ${API_BASE}`);

  // Step 1: Check current status
  const serviceExists = await step1_checkCurrentStatus();

  if (!serviceExists) {
    console.log('\n⚠ Service does not exist yet, will create fresh service');
  } else {
    // Step 2: Delete existing service
    await step2_deleteExistingService();
  }

  // Step 3: Create fresh service
  const created = await step3_createFreshService();

  if (!created) {
    console.error('\n❌ Failed to create service. Please check the error messages above.');
    process.exit(1);
  }

  // Step 4: Deploy service
  const deployed = await step4_deployService();

  if (!deployed) {
    console.error('\n❌ Failed to deploy service. Please check the error messages above.');
    process.exit(1);
  }

  // Step 5: Monitor deployment
  await step5_monitorDeployment();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Fix Complete!                                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log('\nNext steps:');
  console.log('1. Check the Easypanel UI: https://vps10.riolabs.ai');
  console.log('2. Navigate to: Compose Apps → indigo-studio');
  console.log('3. Monitor the deployment logs');
  console.log('4. Once deployed, test the endpoints:');
  console.log(`   - https://riostack-indigo-studio.ck87nu.easypanel.host/`);
  console.log(`   - https://riostack-indigo-studio.ck87nu.easypanel.host/admin`);
  console.log(`   - https://riostack-indigo-studio.ck87nu.easypanel.host/api/articles`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
