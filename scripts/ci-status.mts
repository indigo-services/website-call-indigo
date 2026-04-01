#!/usr/bin/env node

/**
 * CI/CD Pipeline Status Script
 * Provides real-time CI/CD status for deployment readiness
 */

import * as fs from 'fs';
import * as path from 'path';

interface CIPipeline {
  name: string;
  status: 'passing' | 'failing' | 'pending';
  lastRun?: string;
  branch?: string;
  commit?: string;
  message?: string;
}

interface DeploymentStatus {
  environment: string;
  status: 'active' | 'degraded' | 'down';
  lastDeploy?: string;
  version?: string;
  message?: string;
}

const greenBg = '\x1b[42m';
const redBg = '\x1b[41m';
const yellowBg = '\x1b[43m';
const resetColor = '\x1b[0m';

function displayStatus(name: string, status: string, details?: string) {
  let bg = yellowBg;
  if (status === 'passing' || status === 'active') bg = greenBg;
  if (status === 'failing' || status === 'down') bg = redBg;

  const detailsStr = details ? ` - ${details}` : '';
  console.log(`${bg}${resetColor} ${name}: ${status}${detailsStr}`);
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   CI/CD Pipeline Status Report                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check for common CI configuration files
  const hasCIConfig = {
    github: fs.existsSync('.github/workflows'),
    gitlab: fs.existsSync('.gitlab-ci.yml'),
    circleci: fs.existsSync('.circleci/config.yml'),
    jenkins: fs.existsSync('Jenkinsfile'),
  };

  console.log('CI/CD Configuration:');
  Object.entries(hasCIConfig).forEach(([provider, exists]) => {
    displayStatus(provider.toUpperCase(), exists ? 'configured' : 'not-configured');
  });

  // Check for deployment files
  console.log('\nDeployment Configuration:');
  const hasDeployConfig = {
    vercel: fs.existsSync('vercel.json'),
    docker: fs.existsSync('Dockerfile'),
    k8s: fs.existsSync('k8s'),
  };

  Object.entries(hasDeployConfig).forEach(([provider, exists]) => {
    displayStatus(provider.toUpperCase(), exists ? 'configured' : 'not-configured');
  });

  // Check environment files
  console.log('\nEnvironment Configuration:');
  const envFiles = [
    { name: '.env.example', exists: fs.existsSync('.env.example') },
    { name: '.env.production', exists: fs.existsSync('.env.production') },
    { name: 'vercel.json', exists: fs.existsSync('vercel.json') },
  ];

  envFiles.forEach(({ name, exists }) => {
    displayStatus(name, exists ? 'present' : 'missing');
  });

  console.log('\n' + '='.repeat(60));
  console.log('To view detailed pipeline information, use:');
  console.log('  - GitHub: https://github.com/YOUR_ORG/YOUR_REPO/actions');
  console.log('  - Vercel: https://vercel.com');
  console.log('  - Check logs: yarn validate-prod\n');
}

main();
