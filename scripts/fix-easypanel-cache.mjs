#!/usr/bin/env node

/**
 * Fix Easypanel Cache Issue
 * Clears stale docker-compose.yml cache and recreates service with correct configuration
 */
// Read docker-compose.yml
import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Fix Easypanel Cache Issue
 * Clears stale docker-compose.yml cache and recreates service with correct configuration
 */

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
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
      Authorization: `Bearer ${API_TOKEN}`,
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
      Authorization: `Bearer ${API_TOKEN}`,
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
      (s) => s.projectName === PROJECT_NAME && s.name === SERVICE_NAME
    );

    if (targetService) {
      console.log(`✓ Service found: ${SERVICE_NAME} (${targetService.type})`);
      console.log(`  Enabled: ${targetService.enabled}`);
      console.log(
        `  Domains: ${targetService.domains?.map((d) => d.host).join(', ') || 'none'}`
      );

      if (targetService.source) {
        console.log(`  Source type: ${targetService.source.type}`);
        if (targetService.source.type === 'github') {
          console.log(
            `    Repository: ${targetService.source.owner || 'N/A'}/${targetService.source.repo || 'N/A'}`
          );
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
  console.log('\n=== Step 2: Checking If Service Needs Recreation ===');

  try {
    // First try to get compose service details
    try {
      const details = await trpcGetRequest('services.compose.inspectService', {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
      });
      console.log(`✓ Found compose service`);
      console.log(`  Enabled: ${details.enabled}`);
      console.log(`  Has deployment URL: ${!!details.deploymentUrl}`);

      // Instead of deleting, we'll update it
      console.log(`⚠ Service exists - will UPDATE instead of DELETE+CREATE`);
      return 'update';
    } catch (error) {
      console.log(`⚠ Service inspection failed: ${error.message}`);
      console.log(`  Will try to create fresh service...`);
      return 'create';
    }
  } catch (error) {
    console.error(`✗ Error during check:`, error.message);
    return 'create';
  }
}

async function step3_createFreshService(action = 'create') {
  console.log(
    '\n=== Step 3: Creating/Updating Service with Correct Configuration ==='
  );

  try {
    const basePayload = {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
      env: envVars,
      createDotEnv: false,
      domains: [
        {
          host: 'riostack-indigo-studio.ck87nu.easypanel.host',
          https: true,
          path: '/',
          port: 1337,
          internalProtocol: 'http',
          service: 'indigo-strapi',
        },
      ],
    };

    if (action === 'update') {
      console.log(`Updating existing service with inline docker-compose.yml:`);

      // Update source with inline content
      await trpcPostRequest('services.compose.updateSourceInline', {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
        content: composeContent,
      });
      console.log(`✓ Updated docker-compose.yml content`);

      // Update environment
      await trpcPostRequest('services.compose.updateEnv', {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
        env: envVars,
        createDotEnv: false,
      });
      console.log(`✓ Updated environment variables`);

      console.log(`✓ Service updated successfully`);
      return true;
    } else {
      console.log(`Creating new service with inline docker-compose.yml:`);
      console.log(`  Context: . (repository root)`);
      console.log(`  Dockerfile: strapi/Dockerfile`);
      console.log(`  Service: indigo-strapi`);

      const createPayload = {
        ...basePayload,
        source: {
          type: 'inline',
          content: composeContent,
        },
      };

      const result = await trpcPostRequest(
        'services.compose.createService',
        createPayload
      );

      console.log(`✓ Service created successfully`);
      console.log(`  Name: ${result.name}`);
      console.log(`  Type: ${result.type}`);
      console.log(`  Deployment URL: ${result.deploymentUrl || 'pending'}`);

      return true;
    }
  } catch (error) {
    console.error(
      `✗ Error ${action === 'update' ? 'updating' : 'creating'} service:`,
      error.message
    );
    return false;
  }
}

async function step4_deployService() {
  console.log('\n=== Step 4: Deploying Service ===');

  try {
    await trpcPostRequest('services.compose.deployService', {
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

  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Check service status
  try {
    const service = await trpcGetRequest('services.compose.inspectService', {
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

  let action = 'create';
  if (serviceExists) {
    // Step 2: Determine if we should update or create
    action = await step2_deleteExistingService();
  }

  // Step 3: Create or update service
  const created = await step3_createFreshService(action);

  if (!created) {
    console.error(
      '\n❌ Failed to create/update service. Please check the error messages above.'
    );
    process.exit(1);
  }

  // Step 4: Deploy service
  const deployed = await step4_deployService();

  if (!deployed) {
    console.error(
      '\n❌ Failed to deploy service. Please check the error messages above.'
    );
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
  console.log(
    `   - https://riostack-indigo-studio.ck87nu.easypanel.host/admin`
  );
  console.log(
    `   - https://riostack-indigo-studio.ck87nu.easypanel.host/api/articles`
  );
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
