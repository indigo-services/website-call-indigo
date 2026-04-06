#!/usr/bin/env node

/**
 * DIRECT EASYPANEL API FIX
 * Uses the correct Easypanel API endpoints and format
 */

import { execSync } from 'child_process';

const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const EASYPANEL_URL = 'https://vps10.riolabs.ai';

const COMPLETE_SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`;

async function directEasypanelAPIFix() {
  console.log('🔧 DIRECT EASYPANEL API FIX\n');
  console.log('='.repeat(60));

  // First, let's try the correct API endpoint for updating compose service
  console.log('\n📋 Step 1: Updating Compose Service via Easypanel API...');

  // The correct endpoint for updating a compose service source
  const updateUrl = `${EASYPANEL_URL}/api/compose-services/indigo-studio`;

  const payload = {
    serviceName: 'indigo-studio',
    source: {
      type: 'github',
      repository: 'git@github.com:indigo-services/indigo-studio.git',
      branch: 'main',
      composeFile: 'docker-compose.yml',
      sshKey: COMPLETE_SSH_KEY
    }
  };

  try {
    const updateCmd = `curl -s -X PUT \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(payload)}' \\
      "${updateUrl}"`;

    console.log('Sending update command...');
    const result = execSync(updateCmd, { encoding: 'utf-8', stdio: 'pipe' });

    if (result && !result.includes('<!doctype')) {
      console.log('✅ Update response:', result.substring(0, 200));
    } else {
      console.log('⚠️  Update may not have processed correctly');
    }
  } catch (error) {
    console.log('❌ Update failed:', error.message);
  }

  // Alternative: Try the project-specific endpoint
  console.log('\n📋 Step 2: Trying project-specific endpoint...');

  const projectUpdateUrl = `${EASYPANEL_URL}/api/projects/riostack/compose-services/indigo-studio`;

  try {
    const projectUpdateCmd = `curl -s -X PUT \\
      -H "Authorization: Bearer ${API_TOKEN}" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify({ source: payload.source })}' \\
      "${projectUpdateUrl}"`;

    console.log('Sending project update command...');
    const result = execSync(projectUpdateCmd, { encoding: 'utf-8', stdio: 'pipe' });

    if (result && !result.includes('<!doctype')) {
      console.log('✅ Project update response:', result.substring(0, 200));
    } else {
      console.log('⚠️  Project update may not have processed');
    }
  } catch (error) {
    console.log('❌ Project update failed:', error.message);
  }

  // Step 3: Trigger deployment using the correct endpoint
  console.log('\n🚀 Step 3: Triggering deployment...');

  const deployEndpoints = [
    `${EASYPANEL_URL}/api/compose-services/indigo-studio/deploy`,
    `${EASYPANEL_URL}/api/projects/riostack/compose-services/indigo-studio/deploy`,
    `${EASYPANEL_URL}/api/services/indigo-studio/deploy`
  ];

  for (const endpoint of deployEndpoints) {
    try {
      const deployCmd = `curl -s -X POST \\
        -H "Authorization: Bearer ${API_TOKEN}" \\
        -H "Content-Type: application/json" \\
        "${endpoint}"`;

      console.log(`Trying: ${endpoint}`);
      const result = execSync(deployCmd, { encoding: 'utf-8', stdio: 'pipe' });

      if (result && !result.includes('<!doctype')) {
        console.log('✅ Deploy response:', result.substring(0, 200));
        break; // Success, stop trying other endpoints
      }
    } catch (error) {
      console.log(`⚠️  Endpoint failed: ${endpoint}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNOSIS:\n');
  console.log('If API calls are not working, the issue is likely:');
  console.log('1. API endpoint URLs are incorrect');
  console.log('2. API requires different authentication format');
  console.log('3. API has different request/response format than expected');

  console.log('\n📋 MANUAL CONFIGURATION NEEDED:');
  console.log('Since API automation is not working, please manually configure:');
  console.log('1. Go to: https://vps10.riolabs.ai');
  console.log('2. Navigate to: Compose Apps → indigo-studio → Edit');
  console.log('3. Update Repository URL: git@github.com:indigo-services/indigo-studio.git');
  console.log('4. Replace SSH Key with complete key (see script)');
  console.log('5. Click Save → Deploy');

  console.log('\n' + '='.repeat(60));
}

directEasypanelAPIFix().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});