#!/usr/bin/env node

/**
 * Diagnose Easypanel deployment issue
 * Check service configuration and try to understand the deployment failure
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

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Easypanel Deployment Diagnosis                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Get service details
  console.log('=== Service Inspection ===');
  try {
    const service = await trpcGetRequest('services.compose.inspectService', {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
    });

    console.log('Name:', service.name);
    console.log('Type:', service.type);
    console.log('Enabled:', service.enabled);
    console.log('Env file:', service.env || 'none');
    console.log('Create .env:', service.createDotEnv);
    console.log('Deployment URL:', service.deploymentUrl || 'none');
  } catch (error) {
    console.error('Error getting service details:', error.message);
  }

  // Get compose issues
  console.log('\n=== Compose Issues ===');
  try {
    const issues = await trpcGetRequest('services.compose.getIssues', {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
    });

    console.log('Issues found:', issues.issues.length);
    if (issues.issues.length > 0) {
      issues.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}.`, JSON.stringify(issue, null, 2));
      });
    }
    if (issues.stderr) {
      console.log('STDERR:', issues.stderr);
    }
  } catch (error) {
    console.error('Error getting compose issues:', error.message);
  }

  // Get project inspection
  console.log('\n=== Project Services ===');
  try {
    const project = await trpcGetRequest('projects.inspectProject', {
      projectName: PROJECT_NAME,
    });

    const target = project.services.find((s) => s.name === SERVICE_NAME);
    if (target) {
      console.log('Found service:', SERVICE_NAME);
      console.log('Type:', target.type);
      console.log('Source type:', target.source?.type || 'none');
      console.log('Build type:', target.build?.type || 'none');
      if (target.build) {
        console.log('Build config:', JSON.stringify(target.build, null, 2));
      }
      if (target.source && target.source.type === 'github') {
        console.log(
          'GitHub repo:',
          `${target.source.owner}/${target.source.repo}`
        );
        console.log('Branch:', target.source.ref);
        console.log('Path:', target.source.path);
      }
    } else {
      console.log('Service not found in project');
    }
  } catch (error) {
    console.error('Error inspecting project:', error.message);
  }

  console.log('\n=== Analysis ===');
  console.log('Exit code 17 usually indicates:');
  console.log('1. Docker compose syntax error');
  console.log('2. Service already exists with conflicting configuration');
  console.log('3. File not found (build context or dockerfile issue)');
  console.log('\nThe deployment command shows:');
  console.log(
    'docker compose -f /etc/easypanel/projects/riostack/indigo-studio/code/docker-compose.yml'
  );
  console.log(
    '              -f /etc/easypanel/projects/riostack/indigo-studio/code/docker-compose.override.yml'
  );
  console.log('              -p riostack_indigo-studio up --build -d');
  console.log('\nThe override file might be causing conflicts!');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
