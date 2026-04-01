#!/usr/bin/env node

/**
 * Easypanel Deployment Script
 * Deploys Strapi + Next.js application to Easypanel
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DeploymentConfig {
  apiToken: string;
  projectName: string;
  environment: string;
  nextJsPort: number;
  strapiPort: number;
}

const resetColor = '\x1b[0m';
const greenColor = '\x1b[32m';
const redColor = '\x1b[31m';
const yellowColor = '\x1b[33m';
const blueColor = '\x1b[34m';

function log(message: string, color: string = resetColor) {
  console.log(`${color}${message}${resetColor}`);
}

function success(message: string) {
  log(`✓ ${message}`, greenColor);
}

function error(message: string) {
  log(`✗ ${message}`, redColor);
}

function warning(message: string) {
  log(`⚠ ${message}`, yellowColor);
}

function info(message: string) {
  log(`ℹ ${message}`, blueColor);
}

function loadEnvironment(): DeploymentConfig {
  // Load from .env file in root
  const envPath = path.join(process.cwd(), '.env');
  let apiToken = process.env.EASYPANEL_API || '';

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line: string) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('EASYPANEL-API=')) {
        apiToken = trimmedLine.replace('EASYPANEL-API=', '').trim();
      }
    });
  }

  if (!apiToken) {
    throw new Error('EASYPANEL_API token not found in environment or .env file');
  }

  return {
    apiToken,
    projectName: 'indigo-studio',
    environment: process.env.ENVIRONMENT || 'production',
    nextJsPort: 3000,
    strapiPort: 1337,
  };
}

async function checkValidation(): Promise<boolean> {
  info('Running production validation before deployment...');
  try {
    execSync('yarn validate:prod', { stdio: 'inherit' });
    success('Production validation passed');
    return true;
  } catch {
    error('Production validation failed. Deployment aborted.');
    return false;
  }
}

async function handleDeployment(config: DeploymentConfig): Promise<void> {
  log('\n╔════════════════════════════════════════════════════════╗', blueColor);
  log('║   Easypanel Deployment - Strapi + Next.js             ║', blueColor);
  log('╚════════════════════════════════════════════════════════╝\n', blueColor);

  // Verify validation passed
  const validationPassed = await checkValidation();
  if (!validationPassed) {
    process.exit(1);
  }

  info(`Deploying to Easypanel...`);
  info(`Project: ${config.projectName}`);
  info(`Environment: ${config.environment}`);

  // Build both applications
  info('\nBuilding Next.js...');
  try {
    execSync('cd next && yarn build', { stdio: 'inherit' });
    success('Next.js build complete');
  } catch (err) {
    error('Next.js build failed');
    throw err;
  }

  info('\nBuilding Strapi...');
  try {
    execSync('cd strapi && yarn build', { stdio: 'inherit' });
    success('Strapi build complete');
  } catch (err) {
    error('Strapi build failed');
    throw err;
  }

  // Deployment info
  log('\n' + '='.repeat(60), blueColor);
  info('📋 Deployment Configuration');
  log('='.repeat(60) + '\n', blueColor);

  const deploymentSteps = [
    {
      step: 1,
      title: 'Build Artifacts',
      status: 'complete',
      details: 'Next.js and Strapi built successfully',
    },
    {
      step: 2,
      title: 'Service Configuration',
      status: 'pending',
      details: 'Next.js on :' + config.nextJsPort + ', Strapi on :' + config.strapiPort,
    },
    {
      step: 3,
      title: 'Environment Variables',
      status: 'pending',
      details: 'Configure in Easypanel dashboard',
    },
    {
      step: 4,
      title: 'Deploy Services',
      status: 'pending',
      details: 'Push to Easypanel infrastructure',
    },
  ];

  deploymentSteps.forEach((step) => {
    const symbol = step.status === 'complete' ? '✓' : '◯';
    const color = step.status === 'complete' ? greenColor : yellowColor;
    log(`${color}${symbol}${resetColor} [${step.step}/4] ${step.title}`);
    log(`         ${step.details}\n`);
  });

  log('\n' + '='.repeat(60), blueColor);
  info('🚀 Next Steps');
  log('='.repeat(60) + '\n', blueColor);

  log('To complete deployment to Easypanel:\n', blueColor);
  log('1. Log into Easypanel Dashboard');
  log('   URL: https://easypanel.io/dashboard\n');

  log('2. Create Next.js Service:');
  log('   - Framework: Next.js');
  log('   - Directory: ./next');
  log('   - Build Command: yarn build');
  log('   - Start Command: yarn start');
  log('   - Port: ' + config.nextJsPort + '\n');

  log('3. Create Strapi Service:');
  log('   - Framework: Strapi v5');
  log('   - Directory: ./strapi');
  log('   - Build Command: yarn build');
  log('   - Start Command: yarn start');
  log('   - Port: ' + config.strapiPort + '\n');

  log('4. Set Environment Variables:\n');
  const prodEnvPath = path.join(process.cwd(), '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    const envContent = fs.readFileSync(prodEnvPath, 'utf-8');
    const lines = envContent.split('\n').filter((line: string) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    });
    lines.forEach((line: string) => {
      const [key] = line.split('=');
      log(`   - ${key}`);
    });
  }

  log('\n5. Link Services:');
  log('   - Next.js → Strapi (via NEXT_PUBLIC_API_URL env var)\n');

  log('6. Deploy Services:');
  log('   - Click "Deploy" on each service in Easypanel\n');

  log('7. Configure Domain:');
  log('   - Point your domain to Easypanel infrastructure\n');

  log('\n' + '='.repeat(60), blueColor);
  success('✓ Application ready for Easypanel deployment!');
  log('='.repeat(60) + '\n', blueColor);

  info('Deployment packages prepared:');
  success('• Next.js: ./next/.next (ready for deployment)');
  success('• Strapi: ./strapi/dist (ready for deployment)');
  success('• Configuration: .env.production (for Easypanel secrets)');

  log('\nFor Docker-based deployment, use:');
  log('• next/Dockerfile (if available)');
  log('• strapi/Dockerfile (if available)\n');
}

async function main() {
  try {
    const config = loadEnvironment();
    await handleDeployment(config);
    process.exit(0);
  } catch (err) {
    error(`Deployment failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

main();
