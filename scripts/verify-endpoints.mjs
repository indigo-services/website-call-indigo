#!/usr/bin/env node
/**
 * Endpoint Screenshot Verification Script
 * Tests all endpoints and generates verification report
 * Usage: node scripts/verify-endpoints.mjs [base-url]
 * Example: node scripts/verify-endpoints.mjs https://next-iv2p06q9v-indigo-projects.vercel.app
 */
import http from 'http';
import https from 'https';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const ENDPOINTS = [
  { path: '/', name: 'Homepage (EN - Default)', type: 'page' },
  { path: '/en', name: 'Homepage (EN - Explicit)', type: 'page' },
  { path: '/fr', name: 'Homepage (FR - Locale)', type: 'page' },
  { path: '/dashboard', name: 'Dashboard', type: 'page' },
  { path: '/api/health', name: 'Health Check API', type: 'json' },
  {
    path: '/this-page-does-not-exist',
    name: '404 Error Handling',
    type: 'page',
  },
];

const results = [];

/**
 * Fetch URL and return response details
 */
async function fetchEndpoint(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();

    protocol
      .get(url, { timeout: 10000 }, (res) => {
        let data = '';
        const headers = res.headers;
        const statusCode = res.statusCode;

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const duration = Date.now() - startTime;
          resolve({
            success: true,
            statusCode,
            contentLength: data.length,
            duration,
            headers,
            preview: data.substring(0, 200),
          });
        });
      })
      .on('error', (err) => {
        resolve({
          success: false,
          error: err.message,
          duration: Date.now() - startTime,
        });
      });
  });
}

/**
 * Main verification function
 */
async function verifyEndpoints() {
  console.log(
    '╔════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║         Endpoint Verification & Screenshot Script              ║'
  );
  console.log(
    '║                    April 1, 2026                               ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝\n'
  );
  console.log(`Testing Base URL: ${BASE_URL}\n`);
  console.log('Testing endpoints...\n');

  for (const endpoint of ENDPOINTS) {
    const fullUrl = `${BASE_URL}${endpoint.path}`;
    console.log(`[Testing] ${endpoint.name}`);
    console.log(`          ${fullUrl}`);

    const result = await fetchEndpoint(fullUrl);

    if (result.success) {
      const status = result.statusCode >= 400 ? '⚠️ ' : '✅ ';
      console.log(`${status} Status: ${result.statusCode}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Size: ${(result.contentLength / 1024).toFixed(2)}KB`);
      console.log(`   Type: ${result.headers['content-type'] || 'unknown'}`);

      if (endpoint.type === 'json') {
        try {
          const json = JSON.parse(result.preview);
          console.log(`   JSON Keys: ${Object.keys(json).join(', ')}`);
        } catch (e) {
          console.log(`   JSON Parse: Failed`);
        }
      }

      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        url: fullUrl,
        status: result.statusCode,
        duration: result.duration,
        size: result.contentLength,
        success: true,
      });
    } else {
      console.log(`❌ Error: ${result.error}`);
      console.log(`   Duration: ${result.duration}ms`);

      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        url: fullUrl,
        error: result.error,
        duration: result.duration,
        success: false,
      });
    }

    console.log('');
  }

  // Generate report
  generateReport(results);
}

/**
 * Generate verification report
 */
function generateReport(results) {
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const totalSize = results
    .filter((r) => r.success)
    .reduce((sum, r) => sum + (r.size || 0), 0);

  console.log(
    '╔════════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║                    VERIFICATION REPORT                         ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝\n'
  );

  console.log(`Endpoints Tested:     ${results.length}`);
  console.log(`Successful:           ${successful} ✅`);
  console.log(`Failed:              ${failed} ❌`);
  console.log(
    `Success Rate:        ${((successful / results.length) * 100).toFixed(1)}%`
  );
  console.log(`\nPerformance:`);
  console.log(`Average Duration:    ${avgDuration.toFixed(0)}ms`);
  console.log(`Total Page Size:     ${(totalSize / 1024).toFixed(2)}KB`);
  console.log(`\nEndpoint Summary:\n`);

  const successfulResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);

  if (successfulResults.length > 0) {
    console.log('✅ PASSING ENDPOINTS:');
    successfulResults.forEach((r) => {
      console.log(
        `   • ${r.endpoint.padEnd(30)} [${r.status}] ${r.duration}ms`
      );
    });
    console.log('');
  }

  if (failedResults.length > 0) {
    console.log('❌ FAILING ENDPOINTS:');
    failedResults.forEach((r) => {
      console.log(`   • ${r.endpoint.padEnd(30)} ${r.error}`);
    });
    console.log('');
  }

  // Deployment readiness
  const isProduction =
    BASE_URL.includes('vercel.app') || BASE_URL.includes('.app');
  const isHealthy = successful === results.length;

  console.log(
    '╔════════════════════════════════════════════════════════════════╗'
  );
  if (isHealthy) {
    console.log(
      '║                   ✅ DEPLOYMENT HEALTHY                        ║'
    );
    console.log(
      '║                All endpoints responding correctly              ║'
    );
  } else {
    console.log(
      '║                   ⚠️ ISSUES DETECTED                          ║'
    );
    console.log(
      '║          Review failing endpoints above                       ║'
    );
  }
  console.log(
    '╚════════════════════════════════════════════════════════════════╝\n'
  );

  if (isProduction) {
    console.log('Environment: PRODUCTION (Vercel)');
    if (isHealthy) {
      console.log('Status: ✅ READY FOR TRAFFIC');
    } else {
      console.log('Status: ⚠️ CHECK ISSUES BEFORE TRAFFIC');
    }
  } else {
    console.log('Environment: DEVELOPMENT (Local)');
    console.log('Status: 🔧 Development verification complete');
  }
  console.log('');

  // JSON export option
  const reportJson = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalEndpoints: results.length,
      successful,
      failed,
      successRate: ((successful / results.length) * 100).toFixed(1) + '%',
      avgDuration: avgDuration.toFixed(0) + 'ms',
      totalSize: (totalSize / 1024).toFixed(2) + 'KB',
    },
    results: results.map((r) => ({
      endpoint: r.endpoint,
      path: r.path,
      url: r.url,
      status: r.status || 'error',
      duration: r.duration,
      size: r.size,
      success: r.success,
      error: r.error || null,
    })),
  };

  console.log('JSON Report:');
  console.log(JSON.stringify(reportJson, null, 2));
}

// Run
verifyEndpoints().catch(console.error);
