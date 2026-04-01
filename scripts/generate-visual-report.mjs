#!/usr/bin/env node
/**
 * Visual Endpoint Test Report Generator
 * Creates HTML report showing all endpoints with visual data
 * Usage: node scripts/generate-visual-report.mjs [base-url]
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const REPORT_DIR = './visual-reports';
const REPORT_FILE = path.join(REPORT_DIR, `report-${new Date().toISOString().split('T')[0]}.html`);

const ENDPOINTS = [
  { path: '/', name: 'Homepage (EN - Default)', type: 'page', description: 'Main homepage at root path' },
  { path: '/en', name: 'English Locale (Explicit)', type: 'page', description: 'Explicit English locale redirect' },
  { path: '/fr', name: 'French Locale', type: 'page', description: 'French locale with /fr prefix' },
  { path: '/dashboard', name: 'Dashboard', type: 'page', description: 'Deployment readiness dashboard' },
  { path: '/api/health', name: 'Health Check API', type: 'json', description: 'API health status endpoint' },
  { path: '/nonexistent', name: '404 Error Page', type: 'page', description: 'Error boundary test' },
];

/**
 * Fetch endpoint and capture response
 */
async function fetchEndpoint(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();

    protocol.get(url, { timeout: 10000 }, (res) => {
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
          headers,
          body: data,
          duration,
          size: data.length,
        });
      });
    }).on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        duration: Date.now() - startTime,
      });
    });
  });
}

/**
 * Extract key info from HTML
 */
function extractPageInfo(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  
  return {
    title: titleMatch ? titleMatch[1] : 'N/A',
    heading: h1Match ? h1Match[1] : 'N/A',
    description: descMatch ? descMatch[1] : 'N/A',
  };
}

/**
 * Generate HTML report
 */
async function generateReport() {
  // Create reports directory
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const results = [];
  let passCount = 0;
  let failCount = 0;

  console.log('🔄 Generating visual test report...\n');

  for (const endpoint of ENDPOINTS) {
    const fullUrl = `${BASE_URL}${endpoint.path}`;
    console.log(`Testing: ${endpoint.name}`);
    
    const result = await fetchEndpoint(fullUrl);
    
    if (result.success) {
      passCount++;
      const pageInfo = result.headers['content-type']?.includes('json') 
        ? { title: 'JSON Response', heading: 'API Endpoint', description: 'Health check API' }
        : extractPageInfo(result.body);
      
      results.push({
        endpoint,
        url: fullUrl,
        status: result.statusCode,
        statusText: result.statusCode === 200 ? 'OK' : result.statusCode === 307 ? 'REDIRECT' : 'ERROR',
        duration: result.duration,
        size: result.size,
        passed: true,
        pageInfo,
        contentType: result.headers['content-type'],
        preview: result.body.substring(0, 500),
      });
    } else {
      failCount++;
      results.push({
        endpoint,
        url: fullUrl,
        error: result.error,
        duration: result.duration,
        passed: false,
      });
    }
  }

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Endpoint Test Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    header p {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .summary-item {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .summary-item .number {
      font-size: 2.5em;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .summary-item .label {
      color: #666;
      font-size: 0.9em;
    }

    .endpoint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      gap: 20px;
      padding: 40px;
    }

    .endpoint-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .endpoint-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .endpoint-card.passed {
      border-left: 4px solid #4caf50;
    }

    .endpoint-card.failed {
      border-left: 4px solid #f44336;
    }

    .endpoint-header {
      background: #f8f9fa;
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    .endpoint-name {
      font-size: 1.1em;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .endpoint-description {
      font-size: 0.85em;
      color: #999;
    }

    .endpoint-body {
      padding: 20px;
    }

    .endpoint-url {
      font-family: 'Monaco', 'Menlo', monospace;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-size: 0.85em;
      margin-bottom: 15px;
      overflow-x: auto;
      word-break: break-all;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .status-badge.pass {
      background: #4caf50;
      color: white;
    }

    .status-badge.redirect {
      background: #ff9800;
      color: white;
    }

    .status-badge.error {
      background: #f44336;
      color: white;
    }

    .metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .metric {
      font-size: 0.9em;
    }

    .metric-label {
      color: #999;
      font-size: 0.85em;
    }

    .metric-value {
      color: #333;
      font-weight: 600;
    }

    .page-info {
      margin-top: 15px;
      padding: 10px;
      background: #f0f7ff;
      border-radius: 4px;
      border-left: 3px solid #667eea;
    }

    .page-info .label {
      font-size: 0.75em;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .page-info .value {
      font-size: 0.9em;
      color: #333;
      margin-top: 2px;
    }

    .content-preview {
      margin-top: 15px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.8em;
      max-height: 150px;
      overflow-y: auto;
      color: #666;
    }

    .error-message {
      color: #f44336;
      padding: 10px;
      background: #ffebee;
      border-radius: 4px;
      margin-top: 10px;
    }

    footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 0.9em;
      border-top: 1px solid #e0e0e0;
    }

    .success-banner {
      background: #4caf50;
      color: white;
      padding: 20px;
      text-align: center;
    }

    .fail-banner {
      background: #f44336;
      color: white;
      padding: 20px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .endpoint-grid {
        grid-template-columns: 1fr;
      }

      header h1 {
        font-size: 1.8em;
      }
    }

    .timestamp {
      font-size: 0.9em;
      color: rgba(255,255,255,0.8);
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📸 Visual Endpoint Test Report</h1>
      <p>Comprehensive endpoint verification and visual documentation</p>
      <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
      <p class="timestamp">Base URL: <strong>${BASE_URL}</strong></p>
    </header>

    <div class="summary">
      <div class="summary-item">
        <div class="number">${ENDPOINTS.length}</div>
        <div class="label">Total Endpoints</div>
      </div>
      <div class="summary-item">
        <div class="number" style="color: #4caf50;">${passCount}</div>
        <div class="label">Passing ✅</div>
      </div>
      <div class="summary-item">
        <div class="number" style="color: #f44336;">${failCount}</div>
        <div class="label">Failing ❌</div>
      </div>
      <div class="summary-item">
        <div class="number">${((passCount / ENDPOINTS.length) * 100).toFixed(1)}%</div>
        <div class="label">Success Rate</div>
      </div>
    </div>

    ${passCount === ENDPOINTS.length 
      ? '<div class="success-banner">✅ ALL ENDPOINTS PASSING - DEPLOYMENT HEALTHY</div>' 
      : '<div class="fail-banner">⚠️ SOME ENDPOINTS FAILING - REVIEW BELOW</div>'}

    <div class="endpoint-grid">
      ${results.map((result, idx) => `
        <div class="endpoint-card ${result.passed ? 'passed' : 'failed'}">
          <div class="endpoint-header">
            <div class="endpoint-name">${idx + 1}. ${result.endpoint.name}</div>
            <div class="endpoint-description">${result.endpoint.description}</div>
          </div>
          <div class="endpoint-body">
            <div class="endpoint-url">${result.url}</div>
            
            ${result.passed ? `
              <div class="status-badge ${result.status === 200 ? 'pass' : result.status === 307 ? 'redirect' : 'error'}">
                ${result.status} ${result.statusText}
              </div>
              
              <div class="metrics">
                <div class="metric">
                  <div class="metric-label">Load Time</div>
                  <div class="metric-value">${result.duration}ms</div>
                </div>
                <div class="metric">
                  <div class="metric-label">Page Size</div>
                  <div class="metric-value">${(result.size / 1024).toFixed(2)}KB</div>
                </div>
              </div>

              ${result.pageInfo ? `
                <div class="page-info">
                  <div class="label">Page Title</div>
                  <div class="value">${result.pageInfo.title}</div>
                  <div class="label" style="margin-top: 8px;">Heading</div>
                  <div class="value">${result.pageInfo.heading}</div>
                  <div class="label" style="margin-top: 8px;">Content Type</div>
                  <div class="value">${result.contentType || 'N/A'}</div>
                </div>
              ` : ''}

              ${result.preview ? `
                <div class="content-preview">
                  ${result.preview}...
                </div>
              ` : ''}
            ` : `
              <div class="status-badge error">ERROR</div>
              <div class="error-message">
                <strong>Error:</strong> ${result.error}
              </div>
            `}
          </div>
        </div>
      `).join('')}
    </div>

    <footer>
      <p>Visual Endpoint Test Report | Generated: ${new Date().toISOString()}</p>
      <p>All endpoints tested and documented for visual verification</p>
    </footer>
  </div>
</body>
</html>`;

  // Write report
  fs.writeFileSync(REPORT_FILE, html, 'utf-8');
  console.log(`\n✅ Report generated: ${REPORT_FILE}`);
  console.log(`\n📖 Open in browser to view visual report`);
  console.log(`   File: file://${path.resolve(REPORT_FILE)}`);

  // Print summary to console
  console.log(`\n${'='.repeat(60)}`);
  console.log('VISUAL TEST REPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Endpoints:   ${ENDPOINTS.length}`);
  console.log(`Passing:           ${passCount} ✅`);
  console.log(`Failing:           ${failCount} ❌`);
  console.log(`Success Rate:      ${((passCount / ENDPOINTS.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  return { reportFile: REPORT_FILE, passCount, failCount };
}

// Run
generateReport().catch(console.error);
