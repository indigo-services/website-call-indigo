#!/usr/bin/env node

/**
 * SSH Cleanup and Deploy
 * Connects to the Easypanel server via SSH to clean up stale containers and redeploy
 */

import { execSync } from 'child_process';

const SERVER = 'root@vps10.riolabs.ai';
const PROJECT_NAME = 'riostack';
const SERVICE_NAME = 'indigo-studio';

async function sshCommand(command) {
  try {
    const result = execSync(`ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER} "${command}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 30000,
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  SSH Cleanup and Deploy                               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('Server:', SERVER);
  console.log('Project:', PROJECT_NAME);
  console.log('Service:', SERVICE_NAME);
  console.log('');

  // Step 1: Check if we can SSH
  console.log('=== Step 1: Testing SSH Connection ===');
  const testResult = await sshCommand('echo "SSH connection successful"');
  if (!testResult.success) {
    console.error('❌ SSH connection failed:', testResult.error);
    console.log('\nYou need to:');
    console.log('1. Ensure SSH key is configured');
    console.log('2. Or run this script manually with password authentication');
    process.exit(1);
  }
  console.log('✓ SSH connection successful\n');

  // Step 2: Check current containers
  console.log('=== Step 2: Checking Current Docker Containers ===');
  const containersResult = await sshCommand('docker ps -a --filter "name=indigo" --format "table {{.Names}}\t{{.Status}}\t{{.State}}"');
  console.log(containersResult.output || 'No indigo containers found\n');

  // Step 3: Stop and remove containers
  console.log('=== Step 3: Stopping and Removing Containers ===');

  const projectPath = `/etc/easypanel/projects/${PROJECT_NAME}/${SERVICE_NAME}/code`;
  console.log('Project path:', projectPath);

  // Change to project directory and run docker compose down
  const downResult = await sshCommand(`cd ${projectPath} && docker compose down --volumes --remove-orphans 2>&1 || echo "Already down or no compose file"`);
  console.log(downResult.output);

  // Step 4: Remove any dangling images
  console.log('\n=== Step 4: Cleaning Up Docker Resources ===');
  const pruneResult = await sshCommand('docker image prune -f && docker container prune -f');
  console.log(pruneResult.output);

  // Step 5: Check the compose file on the server
  console.log('\n=== Step 5: Checking Compose File on Server ===');
  const composeCheckResult = await sshCommand(`cat ${projectPath}/docker-compose.yml`);
  if (composeCheckResult.success) {
    console.log('✓ Compose file exists');
    console.log('Content preview:');
    console.log(composeCheckResult.output.substring(0, 500));
    console.log('...');
  } else {
    console.log('⚠ Compose file not found or cannot be read');
  }

  // Step 6: Check if the directory structure is correct
  console.log('\n=== Step 6: Checking Directory Structure ===');
  const lsResult = await sshCommand(`ls -la ${projectPath}/`);
  console.log(lsResult.output);

  // Step 7: Trigger deployment via Easypanel API
  console.log('\n=== Step 7: Triggering Deployment ===');
  console.log('Now triggering deployment via Easypanel API...');

  const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
  const API_BASE = 'https://vps10.riolabs.ai/api';

  const deployEndpoint = `${API_BASE}/trpc/services.compose.deployService`;
  const deployPayload = {
    json: {
      projectName: PROJECT_NAME,
      serviceName: SERVICE_NAME,
      forceRebuild: true,
    }
  };

  try {
    const deployCommand = `curl -s -X POST \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(deployPayload)}' \\
      "${deployEndpoint}"`;

    const deployResult = await sshCommand(deployCommand);
    console.log('Deployment response:', deployResult.output);
  } catch (error) {
    console.log('Deployment trigger:', error.message);
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Cleanup Complete!                                    ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log('\nMonitor deployment:');
  console.log(`1. Go to: https://vps10.riolabs.ai`);
  console.log(`2. Navigate to: Compose Apps → ${SERVICE_NAME}`);
  console.log(`3. Watch the logs for deployment progress`);
  console.log(`4. Check containers: ssh ${SERVER} "docker ps"`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
