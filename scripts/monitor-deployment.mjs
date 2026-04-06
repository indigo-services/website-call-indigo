#!/usr/bin/env node

/**
 * Deployment Monitoring Script
 * Monitors the deployment until all endpoints are functional
 */

const BASE_URL = 'https://riostack-indigo-studio.ck87nu.easypanel.host';
const ENDPOINTS = [
  { path: '/', expected: 200, name: 'Main Page' },
  { path: '/manage/admin', expected: 200, name: 'Admin Panel' },
  { path: '/api/articles', expected: 200, name: 'API Articles' }
];

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

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    if (response.status === endpoint.expected) {
      success(`${endpoint.name}: ${url} - ${response.status} ${response.statusText}`);
      return { success: true, status: response.status, url };
    } else if (response.status === 503) {
      warning(`${endpoint.name}: ${url} - ${response.status} Service Unavailable (Containers building)`);
      return { success: false, status: response.status, url, issue: '503 Service Unavailable' };
    } else if (response.status === 502) {
      warning(`${endpoint.name}: ${url} - ${response.status} Bad Gateway (Container not ready)`);
      return { success: false, status: response.status, url, issue: '502 Bad Gateway' };
    } else {
      error(`${endpoint.name}: ${url} - ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, url };
    }
  } catch (err) {
    error(`${endpoint.name}: ${url} - ${err.message}`);
    return { success: false, error: err.message, url };
  }
}

async function monitorDeployment() {
  header('🚀 Indigo Studio Deployment Monitor');
  log('Target: https://riostack-indigo-studio.ck87nu.easypanel.host/', COLORS.cyan);

  let allPassed = false;
  let attempt = 0;

  while (!allPassed) {
    attempt++;
    log(`\n🔄 Monitoring Attempt #${attempt}...`, COLORS.cyan);

    const results = await Promise.all(
      ENDPOINTS.map(endpoint => testEndpoint(endpoint))
    );

    allPassed = results.every(result => result.success);

    if (allPassed) {
      header('🎉 DEPLOYMENT SUCCESSFUL - ALL SYSTEMS OPERATIONAL!');
      log('✨ All endpoints are functional and validated!\n', COLORS.green);

      results.forEach(result => {
        success(`✓ ${result.url} - Fully Operational`);
      });

      log('\n📋 Final Status:', COLORS.cyan);
      success(`• Main endpoint: ${BASE_URL}/`);
      success(`• Admin panel: ${BASE_URL}/manage/admin`);
      success(`• API endpoint: ${BASE_URL}/api/articles`);

      log('\n🔐 Admin Access:', COLORS.yellow);
      info('• URL: https://riostack-indigo-studio.ck87nu.easypanel.host/manage/admin');
      info('• Default admin: admin@example.com');

      log('\n✅ Ready for team approval and production use!\n', COLORS.green);
      return true;

    } else {
      const failedResults = results.filter(r => !r.success);
      log(`\n❌ ${failedResults.length} endpoint(s) still checking...`, COLORS.red);

      failedResults.forEach(result => {
        if (result.issue === '503 Service Unavailable') {
          warning(`• ${result.url} - Containers still building`);
        } else if (result.issue === '502 Bad Gateway') {
          warning(`• ${result.url} - Container starting up`);
        } else if (result.status) {
          error(`• ${result.url} - HTTP ${result.status}`);
        } else {
          error(`• ${result.url} - ${result.error || 'Connection failed'}`);
        }
      });

      const waitTime = Math.min(30, attempt * 2);
      log(`\n⏳ Checking again in ${waitTime} seconds...`, COLORS.cyan);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
  }
}

monitorDeployment().catch(err => {
  error(`\n❌ Monitoring failed: ${err.message}`);
  process.exit(1);
});