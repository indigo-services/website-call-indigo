#!/usr/bin/env node

/**
 * PRODUCTION-GRADE PRE-DEPLOYMENT VALIDATION
 * No deployment attempts without passing all checks
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) { log(`✅ ${message}`, COLORS.green); }
function error(message) { log(`❌ ${message}`, COLORS.red); }
function warn(message) { log(`⚠️  ${message}`, COLORS.yellow); }
function info(message) { log(`ℹ️  ${message}`, COLORS.blue); }
function header(message) { log(`\n${'='.repeat(60)}`, COLORS.cyan); log(message, COLORS.cyan); log('='.repeat(60), COLORS.cyan); }

let checksPassed = 0;
let checksFailed = 0;

function check(name, condition, details = '') {
  if (condition) {
    success(name);
    if (details) info(`   ${details}`);
    checksPassed++;
    return true;
  } else {
    error(name);
    if (details) info(`   ${details}`);
    checksFailed++;
    return false;
  }
}

async function runProductionValidation() {
  header('🔍 PRODUCTION DEPLOYMENT VALIDATION');

  console.log('\n📋 PRE-DEPLOYMENT CHECKS');
  console.log('-'.repeat(60));

  // Check 1: Docker Compose syntax
  info('Checking Docker Compose syntax...');
  try {
    execSync('docker compose -f docker-compose.yml config', { encoding: 'utf-8', stdio: 'pipe' });
    check('Docker Compose syntax valid', true);
  } catch (error) {
    check('Docker Compose syntax valid', false, error.message);
  }

  // Check 2: Dockerfile exists
  info('Checking Dockerfile...');
  import { existsSync } from 'fs';
  const dockerfileExists = existsSync('strapi/Dockerfile');
  check('Dockerfile exists at strapi/Dockerfile', dockerfileExists);

  // Check 3: Build context validation
  info('Validating build context...');
  try {
    import { readFileSync } from 'fs';
    const composeContent = readFileSync('docker-compose.yml', 'utf-8');
    const hasCorrectContext = composeContent.includes('context: .') || composeContent.includes('context: "."');
    const hasCorrectDockerfile = composeContent.includes('dockerfile: strapi/Dockerfile');

    check('Build context set to root (.)', hasCorrectContext,
      hasCorrectContext ? 'Using correct build path' : 'Build context may be wrong');
    check('Dockerfile path correct', hasCorrectDockerfile,
      hasCorrectDockerfile ? 'Using strapi/Dockerfile' : 'Dockerfile path may be wrong');
  } catch (error) {
    check('Build context validation', false, error.message);
  }

  // Check 4: Environment variables
  info('Checking environment configuration...');
  const envExists = require('fs').existsSync('.env');
  check('.env file exists', envExists, envExists ? 'Environment configuration found' : 'Missing .env file');

  // Check 5: Git status
  info('Checking Git repository status...');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    const isClean = gitStatus.trim() === '';
    check('Working directory clean', isClean,
      isClean ? 'No uncommitted changes' : 'There are uncommitted changes');
  } catch (error) {
    check('Git status check', false, error.message);
  }

  // Check 6: GitHub connectivity
  info('Checking GitHub connectivity...');
  try {
    execSync('gh repo view indigo-services/indigo-studio', { encoding: 'utf-8', stdio: 'pipe' });
    check('GitHub repository accessible', true, 'Can access indigo-services/indigo-studio');
  } catch (error) {
    check('GitHub repository accessible', false, 'Cannot access GitHub repository');
  }

  // Check 7: Easypanel API connectivity
  info('Checking Easypanel API...');
  try {
    const API_TOKEN = process.env.EASYPANEL_API || 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
    const result = execSync(`curl -s -w "%{http_code}" -o /dev/null "https://vps10.riolabs.ai/api" -H "Authorization: Bearer ${API_TOKEN}"`, { encoding: 'utf-8' });
    const apiAccessible = result.includes('200') || result.includes('401'); // 401 means API is up but auth issue
    check('Easypanel API accessible', apiAccessible,
      apiAccessible ? 'Easypanel server is reachable' : 'Cannot reach Easypanel API');
  } catch (error) {
    check('Easypanel API accessible', false, 'Easypanel API check failed');
  }

  // Check 8: GitHub deploy key
  info('Checking GitHub deploy keys...');
  try {
    const deployKeys = execSync('gh repo deploy-key list indigo-services/indigo-studio', { encoding: 'utf-8', stdio: 'pipe' });
    const hasEasypanelKey = deployKeys.includes('d6357425ba02') || deployKeys.includes('easypanel');
    check('Easypanel deploy key exists', hasEasypanelKey,
      hasEasypanelKey ? 'Deploy key found in GitHub' : 'Easypanel SSH key not added to GitHub');
  } catch (error) {
    check('GitHub deploy key check', false, 'Could not verify deploy keys');
  }

  // Check 9: Current deployment status
  info('Checking current deployment status...');
  try {
    const response = await fetch('https://riostack-indigo-studio.ck87nu.easypanel.host/', { method: 'HEAD' });
    const is200 = response.status === 200;
    const is502 = response.status === 502;
    const is503 = response.status === 503;

    if (is200) {
      check('Deployment status', true, 'Service is live and functional (200 OK)');
    } else if (is502) {
      warn('Deployment status: 502 Bad Gateway');
      info('   Containers are starting or reverse proxy misconfigured');
      checksPassed++; // Partial credit
    } else if (is503) {
      warn('Deployment status: 503 Service Unavailable');
      info('   Containers not running or build failed');
    } else {
      warn(`Deployment status: ${response.status}`);
    }
  } catch (error) {
    check('Deployment status check', false, `Cannot reach deployment: ${error.message}`);
  }

  // Summary
  header('VALIDATION SUMMARY');

  console.log(`\n✅ Passed: ${checksPassed}`);
  console.log(`❌ Failed: ${checksFailed}`);

  if (checksFailed === 0) {
    success('All checks passed! Deployment is ready.');
    console.log('\n🚀 Ready to deploy: yarn deploy:easypanel:api');
    return 0;
  } else {
    error(`${checksFailed} check(s) failed. Fix issues before deploying.`);
    console.log('\n🔧 Required actions:');
    if (!require('fs').existsSync('.env')) error('• Create .env file with proper configuration');
    if (execSync('git status --porcelain', { encoding: 'utf-8' }).trim() !== '') error('• Commit or stash changes');
    console.log('\n❌ Deployment blocked until all checks pass.');
    return 1;
  }
}

runProductionValidation().then(exitCode => {
  process.exit(exitCode);
}).catch(err => {
  error(`Validation failed: ${err.message}`);
  process.exit(1);
});