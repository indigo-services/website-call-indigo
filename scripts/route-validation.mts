#!/usr/bin/env node
/**
 * Enhanced Route Validation Framework
 *
 * Comprehensive route discovery and validation system extending verify-endpoints.mjs
 * with performance benchmarking, API contract validation, and end-to-end user flow testing.
 *
 * Features:
 * - Automatic route discovery for both Next.js and Strapi
 * - Performance benchmarking (response times, load testing)
 * - API contract validation
 * - End-to-end user flow testing
 * - Enhanced error handling and reporting
 */

import http from 'http';
import https from 'https';
import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Route {
  path: string;
  name: string;
  type: 'page' | 'api' | 'health' | 'admin' | 'unknown';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  expectedStatus?: number;
  contentType?: string;
  description?: string;
}

interface RouteTestResult {
  route: Route;
  url: string;
  success: boolean;
  status?: number;
  duration: number;
  size?: number;
  error?: string;
  headers?: Record<string, string>;
  validationResult?: 'passed' | 'failed' | 'warning';
  performanceMetrics?: {
    ttfb?: number; // Time to first byte
    downloadTime?: number;
    totalTime?: number;
  };
}

interface PerformanceBenchmark {
  url: string;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  requestCount: number;
  successRate: number;
  rps: number; // Requests per second
}

interface UserFlowStep {
  description: string;
  url: string;
  expectedStatus: number;
  waitForSelector?: string;
  timeout?: number;
}

interface UserFlowTest {
  name: string;
  description: string;
  steps: UserFlowStep[];
}

export class RouteValidationFramework {
  private baseUrl: string;
  private routes: Route[] = [];
  private testResults: RouteTestResult[] = [];
  private performanceBenchmarks: Map<string, PerformanceBenchmark> = new Map();
  private config: {
    timeout: number;
    loadTestRequests: number;
    loadTestConcurrency: number;
    performanceThresholds: {
      ttfb: number;
      totalDuration: number;
      errorRate: number;
    };
  };

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.config = {
      timeout: 30000,
      loadTestRequests: 10,
      loadTestConcurrency: 3,
      performanceThresholds: {
        ttfb: 1000, // 1 second
        totalDuration: 5000, // 5 seconds
        errorRate: 0.05 // 5% error rate
      }
    };
  }

  /**
   * Discover routes automatically from Next.js and Strapi
   */
  async discoverRoutes(): Promise<Route[]> {
    console.log('Discovering routes...');

    const discoveredRoutes: Route[] = [];

    // Discover Next.js routes
    try {
      const nextRoutes = await this.discoverNextJsRoutes();
      discoveredRoutes.push(...nextRoutes);
    } catch (error) {
      console.warn('Failed to discover Next.js routes:', error);
    }

    // Discover Strapi routes
    try {
      const strapiRoutes = await this.discoverStrapiRoutes();
      discoveredRoutes.push(...strapiRoutes);
    } catch (error) {
      console.warn('Failed to discover Strapi routes:', error);
    }

    // Add common health and admin routes
    discoveredRoutes.push(
      { path: '/api/health', name: 'Health API', type: 'health', method: 'GET', expectedStatus: 200 },
      { path: '/health', name: 'Health Endpoint', type: 'health', method: 'GET', expectedStatus: 200 },
      { path: '/admin', name: 'Admin Panel', type: 'admin', method: 'GET', expectedStatus: 200 },
      { path: '/manage/admin', name: 'Strapi Admin', type: 'admin', method: 'GET', expectedStatus: 200 }
    );

    this.routes = discoveredRoutes;
    console.log(`Discovered ${discoveredRoutes.length} routes`);
    return discoveredRoutes;
  }

  /**
   * Discover Next.js routes
   */
  private async discoverNextJsRoutes(): Promise<Route[]> {
    const routes: Route[] = [];

    // Try to read Next.js route manifest
    try {
      const manifestPath = join(process.cwd(), 'next', '.next', 'server', 'routes-manifest.json');
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

        for (const route of manifest.routes || []) {
          routes.push({
            path: route.page || route,
            name: `Next.js: ${route.page || route}`,
            type: 'page',
            method: 'GET',
            description: route.page || 'Next.js page'
          });
        }
      }
    } catch (error) {
      // Fallback: Try to discover from pages directory
      console.log('Could not read Next.js manifest, trying directory discovery...');
    }

    // Add common Next.js routes if discovery failed
    if (routes.length === 0) {
      routes.push(
        { path: '/', name: 'Homepage', type: 'page', method: 'GET', description: 'Main homepage' },
        { path: '/en', name: 'Homepage (EN)', type: 'page', method: 'GET', description: 'English homepage' },
        { path: '/fr', name: 'Homepage (FR)', type: 'page', method: 'GET', description: 'French homepage' },
        { path: '/dashboard', name: 'Dashboard', type: 'page', method: 'GET', description: 'User dashboard' }
      );
    }

    return routes;
  }

  /**
   * Discover Strapi routes
   */
  private async discoverStrapiRoutes(): Promise<Route[]> {
    const routes: Route[] = [];

    try {
      // Try to fetch Strapi API endpoints
      const response = await this.fetchEndpoint(`${this.baseUrl}/api`, {
        method: 'GET',
        timeout: 5000
      });

      if (response.success && response.statusCode === 200) {
        try {
          const data = JSON.parse(response.data || '{}');
          if (data.data && Array.isArray(data.data)) {
            for (const endpoint of data.data) {
              routes.push({
                path: `/api/${endpoint}`,
                name: `Strapi API: ${endpoint}`,
                type: 'api',
                method: 'GET',
                description: `Strapi content API for ${endpoint}`,
                contentType: 'application/json'
              });
            }
          }
        } catch (parseError) {
          console.log('Could not parse Strapi API response');
        }
      }
    } catch (error) {
      console.log('Could not discover Strapi routes via API');
    }

    // Add common Strapi routes
    routes.push(
      { path: '/api/articles', name: 'Strapi: Articles', type: 'api', method: 'GET', contentType: 'application/json' },
      { path: '/api/pages', name: 'Strapi: Pages', type: 'api', method: 'GET', contentType: 'application/json' },
      { path: '/api/users', name: 'Strapi: Users', type: 'api', method: 'GET', contentType: 'application/json' }
    );

    return routes;
  }

  /**
   * Test all discovered routes
   */
  async testAllRoutes(): Promise<RouteTestResult[]> {
    if (this.routes.length === 0) {
      await this.discoverRoutes();
    }

    console.log(`Testing ${this.routes.length} routes...`);
    this.testResults = [];

    for (const route of this.routes) {
      const result = await this.testRoute(route);
      this.testResults.push(result);
      this.logTestResult(result);
    }

    return this.testResults;
  }

  /**
   * Test a single route
   */
  async testRoute(route: Route): Promise<RouteTestResult> {
    const url = `${this.baseUrl}${route.path}`;
    const startTime = Date.now();

    try {
      const response = await this.fetchEndpoint(url, {
        method: route.method,
        timeout: this.config.timeout
      });

      const duration = Date.now() - startTime;
      const success = response.statusCode !== undefined && response.statusCode < 500;

      // Validate response
      let validationResult: 'passed' | 'failed' | 'warning' = 'passed';

      if (!success) {
        validationResult = 'failed';
      } else if (route.expectedStatus && response.statusCode !== route.expectedStatus) {
        validationResult = 'warning';
      } else if (duration > this.config.performanceThresholds.totalDuration) {
        validationResult = 'warning';
      }

      return {
        route,
        url,
        success,
        status: response.statusCode,
        duration,
        size: response.data?.length || 0,
        headers: response.headers,
        validationResult,
        performanceMetrics: {
          ttfb: response.ttfb,
          totalTime: duration,
          downloadTime: duration - (response.ttfb || 0)
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        route,
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        validationResult: 'failed'
      };
    }
  }

  /**
   * Fetch endpoint with detailed metrics
   */
  private async fetchEndpoint(url: string, options: {
    method?: string;
    timeout?: number;
    data?: string;
  } = {}): Promise<{
    success: boolean;
    statusCode?: number;
    data?: string;
    headers?: Record<string, string>;
    ttfb?: number;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const method = options.method || 'GET';
      const protocol = url.startsWith('https') ? https : http;
      const urlObj = new URL(url);
      const ttfbStart = Date.now();

      const requestOptions = {
        method,
        hostname: urlObj.hostname,
        port: urlObj.port || (url.startsWith('https') ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        timeout: options.timeout || this.config.timeout,
        headers: {
          'User-Agent': 'RouteValidationFramework/1.0'
        }
      };

      const req = protocol.request(requestOptions, (res) => {
        let data = '';
        const ttfb = Date.now() - ttfbStart;

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            success: true,
            statusCode: res.statusCode,
            data,
            headers: res.headers as Record<string, string>,
            ttfb
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout'
        });
      });

      if (options.data) {
        req.write(options.data);
      }

      req.end();
    });
  }

  /**
   * Performance benchmarking
   */
  async benchmarkPerformance(url: string, options: {
    requests?: number;
    concurrency?: number;
  } = {}): Promise<PerformanceBenchmark> {
    const requests = options.requests || this.config.loadTestRequests;
    const concurrency = options.concurrency || this.config.loadTestConcurrency;

    console.log(`Running performance benchmark: ${requests} requests with concurrency ${concurrency}`);

    const durations: number[] = [];
    const errors: number[] = [];
    const startTime = Date.now();

    // Run requests in batches
    for (let i = 0; i < requests; i += concurrency) {
      const batchSize = Math.min(concurrency, requests - i);
      const batchPromises: Promise<void>[] = [];

      for (let j = 0; j < batchSize; j++) {
        batchPromises.push(
          this.fetchEndpoint(url, { timeout: this.config.timeout }).then(result => {
            durations.push(result.ttfb || 0);
            if (!result.success) {
              errors.push(1);
            }
          })
        );
      }

      await Promise.all(batchPromises);
    }

    const totalTime = Date.now() - startTime;

    const benchmark: PerformanceBenchmark = {
      url,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      requestCount: requests,
      successRate: (requests - errors.length) / requests,
      rps: (requests / totalTime) * 1000
    };

    this.performanceBenchmarks.set(url, benchmark);

    console.log(`Benchmark complete: ${benchmark.averageDuration.toFixed(0)}ms avg, ${benchmark.rps.toFixed(1)} RPS`);

    return benchmark;
  }

  /**
   * API contract validation
   */
  async validateApiContract(url: string, expectedContract: {
    contentType?: string;
    requiredFields?: string[];
    responseSchema?: Record<string, any>;
  }): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const result = await this.fetchEndpoint(url);

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!result.success) {
      errors.push(`Request failed: ${result.error}`);
      return { valid: false, errors, warnings };
    }

    // Validate content type
    if (expectedContract.contentType) {
      const actualContentType = result.headers?.['content-type'] || '';
      if (!actualContentType.includes(expectedContract.contentType)) {
        errors.push(`Content-Type mismatch: expected ${expectedContract.contentType}, got ${actualContentType}`);
      }
    }

    // Validate JSON response
    if (result.data) {
      try {
        const jsonData = JSON.parse(result.data);

        // Check for required fields
        if (expectedContract.requiredFields) {
          for (const field of expectedContract.requiredFields) {
            if (!(field in jsonData)) {
              errors.push(`Missing required field: ${field}`);
            }
          }
        }

        // Validate schema if provided
        if (expectedContract.responseSchema) {
          // Basic schema validation
          for (const [key, type] of Object.entries(expectedContract.responseSchema)) {
            if (key in jsonData) {
              const actualType = typeof jsonData[key];
              if (actualType !== type) {
                warnings.push(`Field ${key} type mismatch: expected ${type}, got ${actualType}`);
              }
            }
          }
        }

      } catch (parseError) {
        errors.push('Failed to parse JSON response');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * End-to-end user flow testing
   */
  async testUserFlow(flow: UserFlowTest): Promise<{
    success: boolean;
    results: Array<{
      step: number;
      description: string;
      url: string;
      success: boolean;
      duration: number;
      error?: string;
    }>;
  }> {
    console.log(`Testing user flow: ${flow.name}`);

    const results = [];
    let allSuccess = true;

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      const startTime = Date.now();

      try {
        const result = await this.fetchEndpoint(step.url, {
          timeout: step.timeout || this.config.timeout
        });

        const duration = Date.now() - startTime;
        const success = result.statusCode === step.expectedStatus;

        if (!success) {
          allSuccess = false;
        }

        results.push({
          step: i + 1,
          description: step.description,
          url: step.url,
          success,
          duration,
          error: success ? undefined : `Expected status ${step.expectedStatus}, got ${result.statusCode}`
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        allSuccess = false;

        results.push({
          step: i + 1,
          description: step.description,
          url: step.url,
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success: allSuccess, results };
  }

  /**
   * Log test result
   */
  private logTestResult(result: RouteTestResult): void {
    const status = result.validationResult === 'passed' ? '✅' :
                   result.validationResult === 'failed' ? '❌' : '⚠️';

    console.log(`${status} ${result.route.name}`);
    console.log(`   ${result.url}`);

    if (result.success) {
      console.log(`   Status: ${result.status}, Duration: ${result.duration}ms`);

      if (result.performanceMetrics) {
        console.log(`   TTFB: ${result.performanceMetrics.ttfb}ms, Total: ${result.performanceMetrics.totalTime}ms`);
      }
    } else {
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }

    console.log('');
  }

  /**
   * Generate comprehensive report
   */
  generateReport(): {
    summary: any;
    details: RouteTestResult[];
    performanceBenchmarks: PerformanceBenchmark[];
  } {
    const passed = this.testResults.filter(r => r.validationResult === 'passed').length;
    const failed = this.testResults.filter(r => r.validationResult === 'failed').length;
    const warnings = this.testResults.filter(r => r.validationResult === 'warning').length;

    const summary = {
      totalRoutes: this.testResults.length,
      passed,
      failed,
      warnings,
      successRate: ((passed / this.testResults.length) * 100).toFixed(1) + '%',
      averageDuration: this.testResults.reduce((sum, r) => sum + r.duration, 0) / this.testResults.length,
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString()
    };

    return {
      summary,
      details: this.testResults,
      performanceBenchmarks: Array.from(this.performanceBenchmarks.values())
    };
  }

  /**
   * Run comprehensive validation
   */
  async runComprehensiveValidation(): Promise<{
    success: boolean;
    summary: any;
  }> {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           ROUTE VALIDATION FRAMEWORK                         ║');
    console.log('║               Comprehensive Testing                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Discover routes
    await this.discoverRoutes();

    // Test all routes
    await this.testAllRoutes();

    // Performance benchmarks for key routes
    console.log('\nRunning performance benchmarks...');
    const keyRoutes = ['/api/health', '/', '/admin'];
    for (const route of keyRoutes) {
      const url = `${this.baseUrl}${route}`;
      await this.benchmarkPerformance(url);
    }

    // Generate report
    const report = this.generateReport();

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    VALIDATION REPORT                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`Routes Tested:        ${report.summary.totalRoutes}`);
    console.log(`Passed:              ${report.summary.passed} ✅`);
    console.log(`Failed:              ${report.summary.failed} ❌`);
    console.log(`Warnings:            ${report.summary.warnings} ⚠️`);
    console.log(`Success Rate:        ${report.summary.successRate}`);
    console.log(`Average Duration:    ${report.summary.averageDuration.toFixed(0)}ms\n`);

    if (report.summary.failed > 0) {
      console.log('❌ VALIDATION FAILED');
      return { success: false, summary: report.summary };
    }

    console.log('✅ VALIDATION PASSED');
    return { success: true, summary: report.summary };
  }
}

/**
 * CLI interface
 */
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const framework = new RouteValidationFramework(baseUrl);

  const args = process.argv.slice(3);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Route Validation Framework

Usage:
  node route-validation.mts [base-url] [options]

Options:
  --comprehensive       Run comprehensive validation (default)
  --discover            Discover routes only
  --test                Test discovered routes
  --benchmark <url>     Performance benchmark specific URL
  --validate-api <url>  Validate API contract
  --help                Show this help message

Examples:
  node route-validation.mts https://call-indigo.com
  node route-validation.mts http://localhost:3000 --comprehensive
  node route-validation.mts https://studio.call-indigo.com --benchmark /api/health
    `);
    process.exit(0);
  }

  try {
    if (args.includes('--comprehensive') || args.length === 0) {
      const result = await framework.runComprehensiveValidation();
      process.exit(result.success ? 0 : 1);
    } else if (args.includes('--discover')) {
      await framework.discoverRoutes();
      console.log(`Discovered ${framework.routes.length} routes`);
    } else if (args.includes('--test')) {
      await framework.testAllRoutes();
      const report = framework.generateReport();
      console.log(JSON.stringify(report, null, 2));
    } else if (args.includes('--benchmark')) {
      const urlIndex = args.indexOf('--benchmark');
      const url = args[urlIndex + 1];
      if (url) {
        const benchmark = await framework.benchmarkPerformance(`${baseUrl}${url}`);
        console.log(JSON.stringify(benchmark, null, 2));
      }
    }

  } catch (error) {
    console.error('Route validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { RouteValidationFramework, Route, RouteTestResult, PerformanceBenchmark, UserFlowTest };