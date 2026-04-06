#!/usr/bin/env node

/**
 * Easypanel API Configuration Script
 * Uses Easypanel API to fix SSH key and repository configuration
 */

import { execSync } from 'child_process';

const EASYPANEL_API_URL = 'https://vps10.riolabs.ai/api';
const EASYPANEL_API_TOKEN = process.env.EASYPANEL_API || '';

const COMPLETE_SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`;

const CORRECT_REPO_URL = 'git@github.com:indigo-services/indigo-studio.git';

async function updateEasypanelConfig() {
  console.log('🔧 Updating Easypanel Configuration via API...\n');

  try {
    // Update compose service source configuration
    const updatePayload = {
      projectName: 'riostack',
      serviceName: 'indigo-studio',
      source: {
        type: 'github',
        repo: CORRECT_REPO_URL,
        branch: 'main',
        path: '/',
        composePath: 'docker-compose.yml',
        sshKey: COMPLETE_SSH_KEY
      }
    };

    console.log('📋 Configuration Payload:');
    console.log(JSON.stringify(updatePayload, null, 2));

    // Make API call to update service
    const response = await fetch(`${EASYPANEL_API_URL}/trpc/services.compose.updateSource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EASYPANEL_API_TOKEN}`
      },
      body: JSON.stringify(updatePayload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Configuration updated successfully!');
      console.log('Response:', result);
    } else {
      console.error('❌ API call failed:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
    }

  } catch (error) {
    console.error('❌ Error updating configuration:', error.message);
    process.exit(1);
  }
}

updateEasypanelConfig();