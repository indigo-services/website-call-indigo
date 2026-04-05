#!/usr/bin/env node
import { execSync } from 'child_process';

import { loadPortableConfig } from './lib/easypanel.mjs';

const resetColor = '\x1b[0m';
const greenColor = '\x1b[32m';
const redColor = '\x1b[31m';
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

function info(message: string) {
  log(`ℹ ${message}`, blueColor);
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

async function handleDeployment(): Promise<void> {
  const config = loadPortableConfig();

  log(
    '\n╔════════════════════════════════════════════════════════╗',
    blueColor
  );
  log('║   Easypanel Deployment - Strapi + Next.js             ║', blueColor);
  log(
    '╚════════════════════════════════════════════════════════╝\n',
    blueColor
  );

  const validationPassed = await checkValidation();
  if (!validationPassed) {
    process.exit(1);
  }

  info(`Deploying to Easypanel...`);
  info(`Project: ${config.projectName}`);
  info(`API Base: ${config.apiBaseUrl}`);
  info(`Target service: ${config.serviceName} (${config.serviceType})`);

  info('\nBuilding Next.js...');
  execSync('cd next && yarn build', { stdio: 'inherit' });
  success('Next.js build complete');

  info('\nBuilding Strapi...');
  execSync('cd strapi && yarn build', { stdio: 'inherit' });
  success('Strapi build complete');

  log('\n' + '='.repeat(60), blueColor);
  info('Deployment plan');
  log('='.repeat(60) + '\n', blueColor);

  success('1. Local builds are clean');
  log('   next -> deployed on Vercel');
  log(`   strapi -> ${config.strapiPath}\n`);

  success('2. Portable config surface is ready');
  log('   .env.example');
  log('   .env.easypanel.example');
  log('   .env.production');
  log('   strapi/easypanel.env\n');

  success('3. Recommended preflight commands');
  log('   yarn easypanel:doctor');
  log('   yarn easypanel:recommend');
  log('   yarn easypanel:status\n');

  success('4. Automated bootstrap and deploy');
  log('   yarn deploy:easypanel:api\n');

  success('5. Post-deploy verification');
  log('   yarn easypanel:health');
  log('   yarn easypanel:cron\n');
}

handleDeployment().catch((err) => {
  error(
    `Deployment preparation failed: ${err instanceof Error ? err.message : err}`
  );
  process.exit(1);
});
