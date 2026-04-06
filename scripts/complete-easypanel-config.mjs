#!/usr/bin/env node
/**
 * Complete Easypanel Configuration Script
 * Fixes SSH, enables service, configures domain, and triggers deployment
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const EASYPANEL_API_URL = 'https://vps10.riolabs.ai/api';
const EASYPANEL_API_TOKEN =
  'e590310e008a56861e12e9c27d0bde3f172548036e7e0d5199e2671870fd3172'; // From environment

const COMPLETE_SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9QwAAAJjKCPLfygjy
3wAAAAtzc2gtZWQyNTUxOQAAACBSvofbs7+sTstKRVZ9nnCYXr2+4/GmevbADcVg31h9Qw
AAAEBkD0kLTT90KjR2copz2nUAYWzOCiQMS6E1EMzZrtQ6rVK+h9uzv6xOy0pFVn2ecJhe
vb7j8aZ69sANxWDfWH1DAAAAEmVhc3lwYW5lbEByaW9zdGFjawECAw==
-----END OPENSSH PRIVATE KEY-----`;

const DOMAIN_CONFIG = {
  host: 'riostack-indigo-studio.ck87nu.easypanel.host',
  https: true,
  port: 1337,
  path: '',
  internalProtocol: 'http',
  containerName: 'indigo-strapi',
};

async function easypanelAPI(endpoint, method, body) {
  const url = `${EASYPANEL_API_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${EASYPANEL_API_TOKEN}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

async function main() {
  console.log('🚀 Starting Complete Easypanel Configuration...\n');

  try {
    // Step 1: Update compose service configuration
    console.log('📝 Step 1: Updating Compose Service Configuration...');

    await easypanelAPI('/trpc/services.compose.updateComposeService', 'POST', {
      projectName: 'riostack',
      serviceName: 'indigo-studio',
      enabled: true,
      source: {
        type: 'github',
        repo: 'git@github.com:indigo-services/indigo-studio.git',
        branch: 'main',
        path: '/',
        composePath: 'docker-compose.yml',
      },
    });

    console.log('✅ Service configuration updated\n');

    // Step 2: Update SSH key
    console.log('🔑 Step 2: Updating SSH Key...');

    await easypanelAPI('/trpc/services.compose.updateComposeEnv', 'POST', {
      projectName: 'riostack',
      serviceName: 'indigo-studio',
      sshKey: COMPLETE_SSH_KEY,
      createDotEnv: false,
    });

    console.log('✅ SSH key updated\n');

    // Step 3: Add domain configuration
    console.log('🌐 Step 3: Configuring Domain...');

    await easypanelAPI('/trpc/services.compose.updateDomains', 'POST', {
      projectName: 'riostack',
      serviceName: 'indigo-studio',
      domains: [DOMAIN_CONFIG],
    });

    console.log('✅ Domain configured\n');

    // Step 4: Trigger deployment
    console.log('🚀 Step 4: Triggering Deployment...');

    await easypanelAPI('/trpc/services.compose.deployService', 'POST', {
      projectName: 'riostack',
      serviceName: 'indigo-studio',
      forceRebuild: true,
    });

    console.log('✅ Deployment triggered\n');

    console.log('🎉 Configuration Complete!');
    console.log('\n📋 Summary:');
    console.log('• SSH Key: Updated');
    console.log(
      '• Repository URL: git@github.com:indigo-services/indigo-studio.git'
    );
    console.log('• Domain: riostack-indigo-studio.ck87nu.easypanel.host');
    console.log('• Service Status: Enabled');
    console.log('• Deployment: In Progress');
    console.log('\n⏳ The service should be available in 2-3 minutes at:');
    console.log('   https://riostack-indigo-studio.ck87nu.easypanel.host/');
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
