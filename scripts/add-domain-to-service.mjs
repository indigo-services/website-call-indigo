#!/usr/bin/env node
/**
 * Add Domain to Easypanel Service Script
 * This script attempts to add domain configuration to the indigo-studio service
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✓ ${message}`, COLORS.green);
}

function error(message) {
  log(`✗ ${message}`, COLORS.red);
}

function warning(message) {
  log(`⚠ ${message}`, COLORS.yellow);
}

function info(message) {
  log(`ℹ ${message}`, COLORS.blue);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, COLORS.magenta);
  log(message, COLORS.magenta);
  log('='.repeat(60), COLORS.magenta);
}

async function main() {
  header('🌐 Add Domain to Easypanel Service');

  const domainToAdd = 'riostack-indigo-studio.ck87nu.easypanel.host';

  log('\n🎯 Target Configuration:', COLORS.cyan);
  log(`Project: riostack`, COLORS.cyan);
  log(`Service: indigo-studio`, COLORS.cyan);
  log(`Domain: ${domainToAdd}`, COLORS.cyan);
  log(`Container: indigo-strapi`, COLORS.cyan);
  log(`Internal Port: 1337`, COLORS.cyan);

  log('\n🔧 Attempting to add domain configuration...', COLORS.yellow);

  // Try using the Easypanel ops script
  try {
    info('Attempting to add domain through Easypanel API...');

    // Since there's no direct domain API in the existing library,
    // we need to manually construct the API call
    const easypanelUrl = 'https://vps10.riolabs.ai/api';
    const apiToken = process.env.EASYPANEL_API;

    if (!apiToken) {
      error('EASYPANEL_API environment variable not found');
      error('Please set EASYPANEL_API token in environment');
      process.exit(1);
    }

    // Try to use curl to add domain configuration
    const domainPayload = {
      projectName: 'riostack',
      serviceName: 'indigo-studio',
      domains: [
        {
          host: domainToAdd,
          https: true,
          port: 1337,
          internalProtocol: 'http',
        },
      ],
    };

    log('\n📋 Domain Configuration Payload:', COLORS.cyan);
    log(JSON.stringify(domainPayload, null, 2), COLORS.cyan);

    warning(
      '⚠️ The existing Easypanel library does not have domain update functions.'
    );
    warning('⚠️ Manual configuration required in Easypanel dashboard.');

    log('\n📝 Manual Steps Required:', COLORS.yellow);
    log('1. Access Easypanel dashboard', COLORS.cyan);
    log(
      '2. Navigate to Project: riostack → Service: indigo-studio',
      COLORS.cyan
    );
    log(`3. Add domain: ${domainToAdd}`, COLORS.cyan);
    log(
      '4. Configure reverse proxy to container: indigo-strapi:1337',
      COLORS.cyan
    );
    log('5. Enable HTTPS and save configuration', COLORS.cyan);

    log('\n🔍 Why This is Needed:', COLORS.magenta);
    info('• Service exists and is enabled');
    info('• Docker Compose configuration is loaded');
    info('• Builds completed successfully');
    error('• Domain mapping is missing (causes 502 errors)');

    log('\n✅ Once domain is configured:', COLORS.green);
    success('Service will be accessible at: https://' + domainToAdd);
    success('Admin panel: https://' + domainToAdd + '/manage/admin');
    success('API endpoints: https://' + domainToAdd + '/api/*');

    log('\n' + '='.repeat(60) + '\n', COLORS.magenta);
  } catch (err) {
    error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  error(`Script failed: ${err.message}`);
  process.exit(1);
});
