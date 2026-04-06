#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
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

interface ComposeBuildPaths {
  composePath: string;
  context: string;
  dockerfile: string;
  contextPath: string;
  dockerfilePath: string;
}

function parseComposeBuildPaths(
  composeContent: string,
  serviceName: string
): { context: string; dockerfile: string } {
  const lines = composeContent.split(/\r?\n/);
  let inServices = false;
  let inTargetService = false;
  let inBuildBlock = false;
  let context = '';
  let dockerfile = 'Dockerfile';

  for (const line of lines) {
    if (!inServices) {
      if (/^services:\s*$/.test(line)) {
        inServices = true;
      }
      continue;
    }

    const serviceMatch = line.match(/^  ([^:\s]+):\s*$/);
    if (serviceMatch) {
      inTargetService = serviceMatch[1] === serviceName;
      inBuildBlock = false;
      continue;
    }

    if (!inTargetService) {
      continue;
    }

    if (/^    build:\s*$/.test(line)) {
      inBuildBlock = true;
      continue;
    }

    if (/^    [^ ]/.test(line)) {
      inBuildBlock = false;
    }

    if (!inBuildBlock) {
      continue;
    }

    const contextMatch = line.match(/^      context:\s*(.+?)\s*$/);
    if (contextMatch) {
      context = contextMatch[1];
      continue;
    }

    const dockerfileMatch = line.match(/^      dockerfile:\s*(.+?)\s*$/);
    if (dockerfileMatch) {
      dockerfile = dockerfileMatch[1];
    }
  }

  if (!context) {
    throw new Error(
      `Could not resolve build.context for service ${serviceName} in docker-compose.yml`
    );
  }

  return { context, dockerfile };
}

function validateComposeBuildPaths(): ComposeBuildPaths {
  const config = loadPortableConfig();
  const composePath = path.resolve(config.cwd, config.composeFile);

  if (!fs.existsSync(composePath)) {
    throw new Error(`Compose file not found: ${composePath}`);
  }

  const { context, dockerfile } = parseComposeBuildPaths(
    fs.readFileSync(composePath, 'utf-8'),
    config.strapiContainerName
  );
  const composeDir = path.dirname(composePath);
  const contextPath = path.resolve(composeDir, context);
  const dockerfilePath = path.resolve(contextPath, dockerfile);

  if (!fs.existsSync(contextPath)) {
    throw new Error(
      `Compose build.context resolves to a missing path: ${context} -> ${contextPath}`
    );
  }

  if (!fs.existsSync(dockerfilePath)) {
    throw new Error(
      `Compose dockerfile resolves to a missing path: ${dockerfile} -> ${dockerfilePath}`
    );
  }

  return {
    composePath,
    context,
    dockerfile,
    contextPath,
    dockerfilePath,
  };
}

async function checkValidation(serviceType: string): Promise<boolean> {
  if (serviceType === 'compose') {
    info('Running Easypanel doctor before compose deployment...');
    try {
      execSync('node --loader ts-node/esm ./scripts/easypanel-ops.mts doctor', {
        stdio: 'inherit',
      });
      success('Easypanel doctor passed');
      return true;
    } catch {
      error('Easypanel doctor failed. Deployment aborted.');
      return false;
    }
  }

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

  const validationPassed = await checkValidation(config.serviceType);
  if (!validationPassed) {
    process.exit(1);
  }

  info(`Deploying to Easypanel...`);
  info(`Project: ${config.projectName}`);
  info(`API Base: ${config.apiBaseUrl}`);
  info(`Target service: ${config.serviceName} (${config.serviceType})`);

  if (config.serviceType === 'compose') {
    info('\nValidating compose build paths...');
    const composePaths = validateComposeBuildPaths();
    success(`Compose file: ${composePaths.composePath}`);
    success(
      `Build context: ${composePaths.context} -> ${composePaths.contextPath}`
    );
    success(
      `Dockerfile: ${composePaths.dockerfile} -> ${composePaths.dockerfilePath}`
    );
  }

  if (config.serviceType !== 'compose') {
    info('\nBuilding Next.js...');
    execSync('cd next && yarn build', { stdio: 'inherit' });
    success('Next.js build complete');
  } else {
    info(
      '\nSkipping Next.js build in deploy:ep because frontend deploys on Vercel'
    );
  }

  info('\nBuilding Strapi...');
  execSync('cd strapi && yarn build', { stdio: 'inherit' });
  success('Strapi build complete');

  info('\nSyncing Easypanel source and triggering deploy...');
  execSync(
    'node --loader ts-node/esm ./scripts/easypanel-ops.mts bootstrap-deploy',
    {
      stdio: 'inherit',
    }
  );
  success('Easypanel bootstrap and deploy trigger completed');

  log('\n' + '='.repeat(60), blueColor);
  info('Follow-up verification');
  log('='.repeat(60) + '\n', blueColor);
  log('yarn easypanel:status');
  log('yarn easypanel:health');
  log('Open the Easypanel deployment logs until the container is healthy.\n');
}

handleDeployment().catch((err) => {
  error(
    `Deployment preparation failed: ${err instanceof Error ? err.message : err}`
  );
  process.exit(1);
});
