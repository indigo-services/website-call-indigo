#!/usr/bin/env node

/**
 * Easypanel API Deployment Automation
 * Automates service creation, configuration, and deployment
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface EasypanelConfig {
  apiToken: string;
  apiBaseUrl: string;
  projectId: string;
  repositoryUrl: string;
  repositoryBranch: string;
  githubRepo: string;
  githubToken: string;
}

interface ServiceConfig {
  name: string;
  type: 'nextjs' | 'strapi';
  port: number;
  buildPath: string;
  buildCommand: string;
  startCommand: string;
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

function loadEnvironment(): EasypanelConfig {
  const envPath = path.join(process.cwd(), '.env');
  let apiToken = process.env.EASYPANEL_API || '';
  let githubToken = process.env.GITHUB_TOKEN || '';
  let githubRepo = process.env.GITHUB_REPOSITORY || 'indigo-buildops/indigo-studio';

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line: string) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('EASYPANEL-API=')) {
        apiToken = trimmedLine.replace('EASYPANEL-API=', '').trim();
      } else if (trimmedLine.startsWith('GITHUB_TOKEN=')) {
        githubToken = trimmedLine.replace('GITHUB_TOKEN=', '').trim();
      } else if (trimmedLine.startsWith('GITHUB_REPOSITORY=')) {
        githubRepo = trimmedLine.replace('GITHUB_REPOSITORY=', '').trim();
      }
    });
  }

  if (!apiToken) {
    throw new Error('EASYPANEL_API token not found in environment or .env file');
  }

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN not found - required for GitHub integration');
  }

  return {
    apiToken,
    apiBaseUrl: process.env.EASYPANEL_API_URL || 'https://api.easypanel.io/v1',
    projectId: process.env.EASYPANEL_PROJECT_ID || 'indigo-studio',
    repositoryUrl: `https://github.com/${githubRepo}`,
    repositoryBranch: process.env.GITHUB_BRANCH || 'main',
    githubRepo,
    githubToken,
  };
}

async function validateDeployment(): Promise<boolean> {
  info('Running production validation...');
  try {
    execSync('yarn validate:prod', { stdio: 'pipe' });
    success('Validation passed');
    return true;
  } catch {
    error('Validation failed');
    return false;
  }
}

async function buildApplications(): Promise<boolean> {
  info('Building Next.js...');
  try {
    execSync('cd next && yarn build', { stdio: 'pipe' });
    success('Next.js build complete');
  } catch {
    error('Next.js build failed');
    return false;
  }

  info('Building Strapi...');
  try {
    execSync('cd strapi && yarn build', { stdio: 'pipe' });
    success('Strapi build complete');
  } catch {
    error('Strapi build failed');
    return false;
  }

  return true;
}

async function callEasypanelAPI(
  endpoint: string,
  method: string,
  config: EasypanelConfig,
  body?: unknown
): Promise<unknown> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiToken}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error ${response.status}: ${errorText}`
      );
    }

    return await response.json();
  } catch (err) {
    throw new Error(
      `Easypanel API call failed: ${err instanceof Error ? err.message : err}`
    );
  }
}

async function loadEnvironmentVariables(): Promise<Record<string, string>> {
  const prodEnvPath = path.join(process.cwd(), '.env.production');
  const envVars: Record<string, string> = {};

  if (fs.existsSync(prodEnvPath)) {
    const content = fs.readFileSync(prodEnvPath, 'utf-8');
    content.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    });
  }

  return envVars;
}

async function createNextJsService(
  config: EasypanelConfig,
  envVars: Record<string, string>
): Promise<unknown> {
  info('Creating Next.js service in Easypanel...');

  const serviceConfig = {
    name: 'indigo-next',
    source: {
      type: 'github',
      repository: config.githubRepo,
      branch: config.repositoryBranch,
      token: config.githubToken,
    },
    buildSettings: {
      dockerfile: undefined, // Auto-detect
      buildCommand: 'cd next && yarn install && yarn build',
      startCommand: 'cd next && yarn start',
      buildPath: './next',
      nodeVersion: 18,
    },
    port: 3000,
    environment: {
      ...envVars,
      NODE_ENV: 'production',
    },
    deployment: {
      autoRedeploy: true,
      autoDeploy: true,
    },
  };

  const result = await callEasypanelAPI(
    `/projects/${config.projectId}/services`,
    'POST',
    config,
    serviceConfig
  );

  success('Next.js service created');
  return result;
}

async function createStrapiService(
  config: EasypanelConfig,
  envVars: Record<string, string>
): Promise<unknown> {
  info('Creating Strapi service in Easypanel...');

  const serviceConfig = {
    name: 'indigo-strapi',
    source: {
      type: 'github',
      repository: config.githubRepo,
      branch: config.repositoryBranch,
      token: config.githubToken,
    },
    buildSettings: {
      dockerfile: undefined, // Auto-detect
      buildCommand: 'cd strapi && yarn install && yarn build',
      startCommand: 'cd strapi && yarn start',
      buildPath: './strapi',
      nodeVersion: 18,
    },
    port: 1337,
    environment: {
      ...envVars,
      NODE_ENV: 'production',
      ADMIN_PATH: '/admin',
    },
    deployment: {
      autoRedeploy: true,
      autoDeploy: true,
    },
    healthCheck: {
      path: '/health',
      port: 1337,
      interval: 30,
      timeout: 5,
    },
  };

  const result = await callEasypanelAPI(
    `/projects/${config.projectId}/services`,
    'POST',
    config,
    serviceConfig
  );

  success('Strapi service created');
  return result;
}

async function deployServices(
  config: EasypanelConfig,
  nextServiceId: string,
  strapiServiceId: string
): Promise<void> {
  info('Triggering deployment...');

  try {
    await callEasypanelAPI(
      `/projects/${config.projectId}/services/${nextServiceId}/deploy`,
      'POST',
      config,
      { pullLatest: true }
    );
    success('Next.js deployment triggered');
  } catch (err) {
    warning(
      `Next.js deployment trigger failed: ${err instanceof Error ? err.message : err}`
    );
  }

  try {
    await callEasypanelAPI(
      `/projects/${config.projectId}/services/${strapiServiceId}/deploy`,
      'POST',
      config,
      { pullLatest: true }
    );
    success('Strapi deployment triggered');
  } catch (err) {
    warning(
      `Strapi deployment trigger failed: ${err instanceof Error ? err.message : err}`
    );
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', blueColor);
  log('║   Easypanel API Deployment Automation                 ║', blueColor);
  log('║   Strapi + Next.js                                     ║', blueColor);
  log('╚════════════════════════════════════════════════════════╝\n', blueColor);

  try {
    const config = loadEnvironment();
    success(`Easypanel API Token: ${config.apiToken.substring(0, 10)}...`);
    success(`Project ID: ${config.projectId}`);
    info(`API Base: ${config.apiBaseUrl}\n`);

    // Validate production readiness
    const validationOk = await validateDeployment();
    if (!validationOk) {
      error('Cannot proceed - validation failed');
      process.exit(1);
    }

    // Build applications
    const buildOk = await buildApplications();
    if (!buildOk) {
      error('Cannot proceed - build failed');
      process.exit(1);
    }

    // Load environment variables
    const envVars = await loadEnvironmentVariables();
    success(
      `Loaded ${Object.keys(envVars).length} environment variables`
    );

    // Create services via API
    info('\nCreating services via Easypanel API...\n');

    let nextServiceId = '';
    let strapiServiceId = '';

    try {
      const nextResult = (await createNextJsService(config, envVars)) as Record<string, unknown>;
      nextServiceId = nextResult.id as string;
    } catch (err) {
      warning(
        `Could not create Next.js service via API: ${err instanceof Error ? err.message : err}\n`
      );
    }

    try {
      const strapiResult = (await createStrapiService(config, envVars)) as Record<string, unknown>;
      strapiServiceId = strapiResult.id as string;
    } catch (err) {
      warning(
        `Could not create Strapi service via API: ${err instanceof Error ? err.message : err}\n`
      );
    }

    // Trigger deployment if services were created
    if (nextServiceId && strapiServiceId) {
      info('\nTriggering deployments...\n');
      await deployServices(config, nextServiceId, strapiServiceId);
    }

    // Final instructions
    log('\n' + '='.repeat(60), blueColor);
    success('✓ Deployment automation complete!');
    log('='.repeat(60) + '\n', blueColor);

    log('📋 Next Steps:\n', blueColor);
    log('1. Monitor deployment in Easypanel dashboard:');
    log('   https://easypanel.io/dashboard\n');

    log('2. Wait for services to reach "healthy" status\n');

    log('3. Configure domain DNS pointing to Easypanel\n');

    log('4. Verify deployment:\n');
    log('   curl https://your-domain.com/\n');
    log('   curl https://your-domain.com/api/health\n');

    log('5. Import content (if needed):\n');
    log('   cd strapi && yarn strapi import -f ./data/export.tar.gz\n');

    log('6. Rotate API keys after verification:\n');
    log('   Update JWT_SECRET, NEXTAUTH_SECRET in Easypanel\n');

    success('Deployment automated successfully!');
    process.exit(0);
  } catch (err) {
    error(`Deployment automation failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

main();
