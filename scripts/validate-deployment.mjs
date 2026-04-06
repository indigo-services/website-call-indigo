#!/usr/bin/env node
/**
 * Continuous Deployment Validation Script
 * Loops until all deployment endpoints are fully functional
 */
import { execSync } from 'child_process';

const BASE_URL = 'https://riostack-indigo-studio.ck87nu.easypanel.host';
const ENDPOINTS = [
  { path: '/', expected: 200, name: 'Main Page' },
  { path: '/manage/admin', expected: 200, name: 'Admin Panel' },
  { path: '/api/articles', expected: 200, name: 'API Articles' },
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
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.status === endpoint.expected) {
      success(
        `${endpoint.name}: ${url} - ${response.status} ${response.statusText}`
      );
      return { success: true, status: response.status, url };
    } else if (response.status === 502) {
      warning(
        `${endpoint.name}: ${url} - ${response.status} Bad Gateway (Service not ready)`
      );
      return {
        success: false,
        status: response.status,
        url,
        issue: '502 Bad Gateway',
      };
    } else {
      error(
        `${endpoint.name}: ${url} - ${response.status} ${response.statusText}`
      );
      return { success: false, status: response.status, url };
    }
  } catch (err) {
    error(`${endpoint.name}: ${url} - ${err.message}`);
    return { success: false, error: err.message, url };
  }
}

async function validateDeployment() {
  header('🚀 Indigo Studio Deployment Validation');

  let allPassed = false;
  let attempt = 0;

  while (!allPassed) {
    attempt++;
    log(`\n🔄 Attempt #${attempt} - Testing all endpoints...`, COLORS.cyan);

    const results = await Promise.all(
      ENDPOINTS.map((endpoint) => testEndpoint(endpoint))
    );

    allPassed = results.every((result) => result.success);

    if (allPassed) {
      header('✅ DEPLOYMENT SUCCESSFUL!');
      log('🎉 All endpoints are functional and validated!\n', COLORS.green);

      results.forEach((result) => {
        success(`✓ ${result.url} - Working perfectly`);
      });

      log('\n📋 Summary:', COLORS.cyan);
      success(`• Main endpoint: ${BASE_URL}/`);
      success(`• Admin panel: ${BASE_URL}/manage/admin`);
      success(`• API endpoint: ${BASE_URL}/api/articles`);
      log('\n🔐 Admin Login Credentials:', COLORS.yellow);
      info('• Email: admin@example.com');
      info('• Password: (Set during first admin setup)');
      log('\n✅ Ready for team approval and production use!\n', COLORS.green);

      return true;
    } else {
      const failedResults = results.filter((r) => !r.success);

      log(
        `\n❌ ${failedResults.length} endpoint(s) still failing:`,
        COLORS.red
      );
      failedResults.forEach((result) => {
        if (result.issue === '502 Bad Gateway') {
          warning(`• ${result.url} - Service not running yet`);
        } else if (result.status) {
          error(`• ${result.url} - HTTP ${result.status}`);
        } else {
          error(`• ${result.url} - ${result.error || 'Connection failed'}`);
        }
      });

      log('\n🔧 Troubleshooting:', COLORS.yellow);
      info('1. Check Easypanel dashboard for container status');
      info('2. Review container logs for errors');
      info('3. Ensure Git configuration is saved');
      info('4. Verify SSH key has write access on GitHub');
      info('5. Confirm deployment was triggered');

      const waitTime = Math.min(30, attempt * 5); // Wait up to 30 seconds
      log(`\n⏳ Waiting ${waitTime} seconds before retry...`, COLORS.cyan);
      log('   (Press Ctrl+C to stop validation)\n');

      await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    }
  }
}

// Run validation
validateDeployment().catch((err) => {
  error(`\n❌ Validation script failed: ${err.message}`);
  process.exit(1);
});
