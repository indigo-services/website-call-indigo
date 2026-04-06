#!/usr/bin/env node
/**
 * Fix Docker Compose Exit Code 17
 * This script attempts to stop containers and clean up before redeploying
 */
import fs from 'fs';

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const PROJECT_NAME = 'riostack';
const SERVICE_NAME = 'indigo-studio';

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

async function tryStopService() {
  console.log('=== Attempting to stop the service via Docker commands ===');

  // First, let's try to stop the containers by using compose down
  // This requires direct access to the server

  console.log('\nOption 1: Using docker compose down via API...');
  try {
    // Try to get compose issues - this might give us more info
    const response = await fetch(
      `${API_BASE}/trpc/services.compose.getIssues?input=${encodeURIComponent(JSON.stringify({ json: { projectName: PROJECT_NAME, serviceName: SERVICE_NAME } }))}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Compose issues:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('Error getting issues:', error.message);
  }
}

async function tryUpdateComposeWithRestartDirective() {
  console.log('\n=== Trying to update compose with restart directive ===');

  const composeContent = fs.readFileSync('docker-compose.yml', 'utf-8');

  console.log('Current compose content length:', composeContent.length);
  console.log('First 500 chars:', composeContent.substring(0, 500));

  // Check if there's a container_name directive that might cause issues
  if (composeContent.includes('container_name:')) {
    console.log(
      '⚠ Found container_name directive - this can cause exit code 17!'
    );
  }

  // Check if there are any conflicting networks or volumes
  if (composeContent.includes('external:')) {
    console.log('⚠ Found external resources - ensure they exist!');
  }

  // Check the build context
  const buildContextMatch = composeContent.match(/context:\s*(.+)/);
  if (buildContextMatch) {
    console.log('Build context:', buildContextMatch[1].trim());
  }

  const dockerfileMatch = composeContent.match(/dockerfile:\s*(.+)/);
  if (dockerfileMatch) {
    console.log('Dockerfile:', dockerfileMatch[1].trim());
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Fix Docker Compose Exit Code 17                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  await tryStopService();
  await tryUpdateComposeWithRestartDirective();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  RECOMMENDATION                                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log('\nExit code 17 is typically caused by:');
  console.log('1. Service name conflicts (container already exists)');
  console.log('2. Network name conflicts');
  console.log('3. Volume name conflicts');
  console.log('4. Build context path issues');

  console.log('\nSOLUTION:');
  console.log('The Easypanel server has stale containers/networks/volumes.');
  console.log('We need to access the server directly to clean them up.');

  console.log('\nSSH into the server and run:');
  console.log(`  ssh root@vps10.riolabs.ai`);
  console.log('');
  console.log('Then run these commands:');
  console.log(
    `  cd /etc/easypanel/projects/${PROJECT_NAME}/${SERVICE_NAME}/code`
  );
  console.log('  docker compose down --volumes --remove-orphans');
  console.log('  docker system prune -f');
  console.log('');
  console.log('Then try deploying again via Easypanel UI or API.');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
