#!/usr/bin/env node

/**
 * Check Docker containers for the service
 */

const API_TOKEN =
  'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';
const PROJECT_NAME = 'riostack';
const SERVICE_NAME = 'indigo-studio';

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

async function main() {
  console.log('=== Checking Docker Containers ===');

  try {
    const containers = await trpcGetRequest('projects.getDockerContainers', {
      service: SERVICE_NAME,
    });

    console.log('Containers for service:', SERVICE_NAME);
    console.log(JSON.stringify(containers, null, 2));

    // Check for any running or stopped containers
    if (Array.isArray(containers)) {
      console.log(`\nFound ${containers.length} containers`);

      containers.forEach((container, i) => {
        console.log(`\nContainer ${i + 1}:`);
        console.log('  Name:', container.name);
        console.log('  State:', container.state);
        console.log('  Status:', container.status);
      });
    }
  } catch (error) {
    console.error('Error getting containers:', error.message);
  }

  console.log('\n=== Analysis ===');
  console.log(
    'If there are running containers, they might be causing the exit code 17'
  );
  console.log(
    'because docker compose up fails when containers with conflicting names'
  );
  console.log('already exist.');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
