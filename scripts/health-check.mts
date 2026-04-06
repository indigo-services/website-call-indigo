#!/usr/bin/env node

/**
 * Health Check Script
 * Validates that all services are running and healthy
 */

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  statusCode?: number;
  responseTime?: number;
  message: string;
}

const results: HealthCheckResult[] = [];

async function checkEndpoint(
  service: string,
  url: string,
  timeout = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Health-Check/1.0',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service,
        status: 'healthy',
        statusCode: response.status,
        responseTime,
        message: `OK - ${responseTime}ms`,
      };
    } else {
      return {
        service,
        status: 'unhealthy',
        statusCode: response.status,
        responseTime,
        message: `HTTP ${response.status}`,
      };
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        service,
        status: 'warning',
        responseTime: timeout,
        message: `Timeout after ${timeout}ms`,
      };
    }

    return {
      service,
      status: 'unhealthy',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function formatStatus(status: string): string {
  const colors = {
    healthy: '\x1b[32m', // Green
    unhealthy: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m',
  };

  const statusSymbols = {
    healthy: '✓',
    unhealthy: '✗',
    warning: '⚠',
  };

  const color = colors[status as keyof typeof colors] || colors.reset;
  const symbol = statusSymbols[status as keyof typeof statusSymbols] || '?';

  return `${color}${symbol} ${status}${colors.reset}`;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Health Check - Strapi + Next.js           ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  const appUrl = process.env.WEBSITE_URL || 'http://localhost:3000';

  console.log(`\nChecking services...\n`);

  // Check Strapi
  results.push(await checkEndpoint('Strapi API', `${apiUrl}/health`, 5000));

  // Check Next.js
  results.push(
    await checkEndpoint('Next.js App', `${appUrl}/api/health`, 5000)
  );

  // Check Strapi Admin
  results.push(await checkEndpoint('Strapi Admin', `${apiUrl}/admin`, 5000));

  // Print results
  let allHealthy = true;
  results.forEach((result) => {
    const statusStr = formatStatus(result.status);
    const responseTime = result.responseTime
      ? ` (${result.responseTime}ms)`
      : '';
    console.log(
      `${statusStr}  ${result.service.padEnd(20)} ${result.message}${responseTime}`
    );

    if (result.status !== 'healthy') {
      allHealthy = false;
    }
  });

  // Summary
  console.log('\n' + '─'.repeat(50));
  const summary = allHealthy
    ? `✓ All services healthy`
    : `✗ Some services need attention`;
  const color = allHealthy ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${summary}\x1b[0m\n`);

  process.exit(allHealthy ? 0 : 1);
}

main().catch((err) => {
  console.error('\x1b[31m✗ Health check failed:', err, '\x1b[0m');
  process.exit(1);
});
