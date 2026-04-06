#!/usr/bin/env node

/**
 * Fix SSH Configuration via Easypanel API
 * Updates repository URL and SSH key for proper GitHub integration
 */

const COMPLETE_SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`;

async function fixEasypanelSSH() {
  console.log('🔧 Fixing Easypanel SSH Configuration via API...\n');

  const API_BASE = 'https://vps10.riolabs.ai/api';
  const API_TOKEN = process.env.EASYPANEL_API;
  const SERVICE_NAME = 'indigo-studio';

  if (!API_TOKEN) {
    console.error('❌ EASYPANEL_API environment variable not set');
    process.exit(1);
  }

  try {
    // Get the service details
    console.log('📋 Fetching service details...');
    const response = await fetch(`${API_BASE}/services/${SERVICE_NAME}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get service: ${response.statusText}`);
    }

    const service = await response.json();
    console.log('✅ Service found:', service.name);

    // Update the compose configuration
    console.log('\n🔄 Updating SSH configuration...');

    const updateData = {
      composeService: {
        ...service.composeService,
        source: {
          type: 'github',
          repository: 'git@github.com:indigo-services/indigo-studio.git',
          branch: 'main',
          buildPath: '/',
          composeFile: 'docker-compose.yml',
          sshKey: COMPLETE_SSH_KEY
        }
      }
    };

    const updateResponse = await fetch(`${API_BASE}/services/${SERVICE_NAME}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update service: ${updateResponse.statusText}`);
    }

    console.log('✅ SSH configuration updated successfully!');

    // Trigger deployment
    console.log('\n🚀 Triggering deployment...');
    const deployResponse = await fetch(`${API_BASE}/services/${SERVICE_NAME}/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!deployResponse.ok) {
      throw new Error(`Failed to trigger deployment: ${deployResponse.statusText}`);
    }

    console.log('✅ Deployment triggered successfully!');
    console.log('\n📋 Configuration Changes Applied:');
    console.log('• Repository URL: git@github.com:indigo-services/indigo-studio.git');
    console.log('• SSH Key: Complete (replaced truncated key)');
    console.log('• Branch: main');
    console.log('• Build Path: /');
    console.log('• Compose File: docker-compose.yml');

    console.log('\n🔍 Monitoring deployment at:');
    console.log('https://riostack-indigo-studio.ck87nu.easypanel.host/');

    console.log('\n✅ SSH connection should now work!');
    console.log('✅ Containers should build and start successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);

    // Fallback: show manual steps
    console.log('\n📝 Manual Configuration Steps:');
    console.log('1. Go to Easypanel dashboard');
    console.log('2. Open indigo-studio service');
    console.log('3. Change Repository URL to: git@github.com:indigo-services/indigo-studio.git');
    console.log('4. Replace SSH Key with complete key above');
    console.log('5. Save and Deploy');

    process.exit(1);
  }
}

fixEasypanelSSH();