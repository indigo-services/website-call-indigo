#!/usr/bin/env node

/**
 * Strapi Diagnostic Script
 * Checks Strapi API status and content availability
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

interface HealthResponse {
  status?: string;
}

interface ContentTypeResponse {
  data?: unknown[];
  error?: { message: string };
}

async function checkEndpoint(path: string, description: string): Promise<boolean> {
  try {
    console.log(`\nChecking: ${description}`);
    console.log(`URL: ${API_URL}${path}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Strapi-Diagnostic/1.0' },
    });

    clearTimeout(timeoutId);

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
      return false;
    }

    try {
      const data = await response.json() as HealthResponse & ContentTypeResponse;
      if (data.error) {
        console.log(`Error: ${data.error.message}`);
        return false;
      }
      if (data.data) {
        console.log(
          `Found ${Array.isArray(data.data) ? data.data.length : '1'} items`
        );
      } else if (data.status) {
        console.log(`Status: ${data.status}`);
      }
      return true;
    } catch (e) {
      console.log('Response: (non-JSON)');
      return true; // Non-JSON response is OK
    }
  } catch (error) {
    console.log(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Strapi API Diagnostic                                ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  console.log(`\nAPI URL: ${API_URL}`);
  console.log('Node.js:', process.version);

  const checks = [
    ['/health', 'Strapi Health Endpoint'],
    ['/api/admin', 'Admin Panel'],
    ['/api/globals', 'Globals Collection (if exists)'],
    ['/api/global', 'Global Single Type'],
    ['/api/upload/files', 'Media Library'],
    ['/api/users', 'Users Collection'],
  ];

  let successCount = 0;
  for (const [path, desc] of checks) {
    const success = await checkEndpoint(path as string, desc as string);
    if (success) successCount++;
  }

  console.log('\n' + '='.repeat(54));
  console.log(`\nResults: ${successCount}/${checks.length} checks passed`);

  if (successCount === 0) {
    console.log('\n⚠️  Strapi appears to be offline');
    console.log('To start Strapi: yarn strapi OR cd strapi && yarn develop');
  } else if (successCount < checks.length) {
    console.log('\n⚠️  Some endpoints unavailable');
    console.log('Check Strapi admin at: http://localhost:1337/admin');
  } else {
    console.log('\n✅ All checks passed');
  }

  console.log(
    '\nTo fix "global" content type errors:',
    '\n1. Check that Strapi is running (yarn dev)',
    '\n2. Create "global" single type in Strapi',
    '\n3. Publish a "global" entry',
    '\n4. Restart Next.js'
  );

  process.exit(successCount > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Diagnostic failed:', err);
  process.exit(1);
});
