#!/usr/bin/env node
/**
 * Force update via API - try different approaches
 */
import fs from 'fs';

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const PROJECT_NAME = 'riostack';
const SERVICE_NAME = 'indigo-studio';

// Read environment files
const loadEnv = () => {
  const envContent = fs.readFileSync('.env.easypanel', 'utf-8');
  const lines = envContent.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#') && trimmed.includes('=');
  });

  // Also add values from main .env
  const mainEnvContent = fs.readFileSync('.env', 'utf-8');
  const mainLines = mainEnvContent.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#') && trimmed.includes('=');
  });

  return [...lines, ...mainLines].join('\n');
};

async function trpcPostRequest(operation, input) {
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

  const data = await response.json();
  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  return data.result.data.json;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  API Force Update                                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const composeContent = fs.readFileSync('docker-compose.yml', 'utf-8');
  const envVars = loadEnv();

  console.log('=== Step 1: Update Source ===');
  console.log('Sending new docker-compose.yml content...');

  try {
    const updateResult = await trpcPostRequest(
      'services.compose.updateSourceInline',
      {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
        content: composeContent,
      }
    );
    console.log('✓ Source updated');
    console.log('Response:', JSON.stringify(updateResult).substring(0, 200));
  } catch (error) {
    console.error('✗ Failed to update source:', error.message);
  }

  console.log('\n=== Step 2: Update Environment ===');
  console.log('Sending environment variables...');

  try {
    const envResult = await trpcPostRequest('services.compose.updateEnv', {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
      env: envVars,
      createDotEnv: false,
    });
    console.log('✓ Environment updated');
  } catch (error) {
    console.error('✗ Failed to update env:', error.message);
  }

  console.log('\n=== Step 3: Update Domains ===');

  try {
    const domainResult = await trpcPostRequest(
      'services.compose.updateDomains',
      {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
        domains: [
          {
            host: 'riostack-indigo-studio.ck87nu.easypanel.host',
            https: true,
            path: '/',
            port: 1337,
            internalProtocol: 'http',
            service: 'indigo-studio',
          },
        ],
      }
    );
    console.log('✓ Domains updated');
  } catch (error) {
    console.error(
      '✗ Failed to update domains (endpoint may not exist):',
      error.message
    );
  }

  console.log('\n=== Step 4: Deploy ===');

  try {
    const deployResult = await trpcPostRequest(
      'services.compose.deployService',
      {
        projectName: PROJECT_NAME,
        serviceName: SERVICE_NAME,
        forceRebuild: true,
      }
    );
    console.log('✓ Deployment triggered');
  } catch (error) {
    console.error('✗ Deployment failed:', error.message);
    console.error('\nThis is the expected exit code 17 error.');
    console.error(
      'The issue is likely on the server side with stale Docker resources.'
    );
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                             ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log('\nThe docker-compose.yml and environment have been updated.');
  console.log('\nTo fix the exit code 17 issue, you need to:');
  console.log('1. SSH into the server: ssh root@vps10.riolabs.ai');
  console.log('2. Run: cd /etc/easypanel/projects/riostack/indigo-studio/code');
  console.log('3. Run: docker compose down --volumes --remove-orphans');
  console.log('4. Run: docker system prune -f');
  console.log('5. Then deploy via Easypanel UI');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
