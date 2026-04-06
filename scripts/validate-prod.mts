#!/usr/bin/env node
/**
 * Production Deployment Validation Script
 * Validates environment, builds, and performs pre-deployment checks
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Load environment variables from .env.production
function loadEnvironment(): void {
  const envPath = path.join(process.cwd(), '.env.production');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: CheckResult[] = [];
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

function checkEnvironmentVariables(): void {
  log('\n--- Environment Variables ---', blueColor);

  const requiredVars = ['NEXT_PUBLIC_API_URL', 'WEBSITE_URL', 'ENVIRONMENT'];

  const productionVars = ['JWT_SECRET', 'NEXTAUTH_SECRET'];

  const isProd = process.env.ENVIRONMENT === 'production';

  requiredVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (value) {
      success(`${envVar} defined`);
      results.push({
        name: `Environment: ${envVar}`,
        passed: true,
        message: 'Defined and set',
        critical: true,
      });
    } else {
      error(`${envVar} not defined`);
      results.push({
        name: `Environment: ${envVar}`,
        passed: false,
        message: 'Required environment variable missing',
        critical: true,
      });
    }
  });

  if (isProd) {
    productionVars.forEach((envVar) => {
      const value = process.env[envVar];
      if (value) {
        success(`${envVar} defined (Production)`);
        results.push({
          name: `Environment: ${envVar}`,
          passed: true,
          message: 'Production variable set',
          critical: true,
        });
      } else {
        error(`${envVar} not defined (Required for Production)`);
        results.push({
          name: `Environment: ${envVar}`,
          passed: false,
          message: 'Production variable missing - CRITICAL',
          critical: true,
        });
      }
    });
  }
}

function checkFiles(): void {
  log('\n--- File Checks ---', blueColor);

  const requiredFiles = [
    { path: 'vercel.json', critical: true },
    { path: 'next/package.json', critical: true },
    { path: 'strapi/package.json', critical: true },
    { path: 'package.json', critical: true },
    {
      path: 'docs/deployment/DEPLOYMENT_CHECKLIST.md',
      critical: false,
    },
  ];

  requiredFiles.forEach(({ path: filePath, critical }) => {
    if (fs.existsSync(filePath)) {
      success(`${filePath} exists`);
      results.push({
        name: `File: ${filePath}`,
        passed: true,
        message: 'File present',
        critical,
      });
    } else {
      const msg = `${filePath} missing`;
      if (critical) {
        error(msg);
      } else {
        warning(msg);
      }
      results.push({
        name: `File: ${filePath}`,
        passed: false,
        message: critical ? 'Critical file missing' : 'Optional file missing',
        critical,
      });
    }
  });
}

function checkDependencies(): void {
  log('\n--- Dependency Checks ---', blueColor);

  try {
    execSync('yarn --version', { stdio: 'pipe' });
    success('Yarn installed');
    results.push({
      name: 'Yarn',
      passed: true,
      message: 'Yarn is available',
      critical: true,
    });
  } catch {
    error('Yarn not found');
    results.push({
      name: 'Yarn',
      passed: false,
      message: 'Yarn package manager not installed',
      critical: true,
    });
  }

  try {
    execSync('node --version', { stdio: 'pipe' });
    const nodeVersion = execSync('node --version', {
      encoding: 'utf-8',
    }).trim();
    const majorVersion = parseInt(
      nodeVersion.split('.')[0].replace('v', ''),
      10
    );

    if (majorVersion >= 18) {
      success(`Node.js ${nodeVersion} (v18+)`);
      results.push({
        name: 'Node.js Version',
        passed: true,
        message: `Node.js ${nodeVersion}`,
        critical: true,
      });
    } else {
      error(`Node.js ${nodeVersion} - Requires v18+`);
      results.push({
        name: 'Node.js Version',
        passed: false,
        message: `Node.js ${nodeVersion} - Should be v18 or higher`,
        critical: true,
      });
    }
  } catch {
    error('Node.js not found');
    results.push({
      name: 'Node.js',
      passed: false,
      message: 'Node.js is not installed',
      critical: true,
    });
  }
}

function checkBuild(): void {
  log('\n--- Build Checks ---', blueColor);

  // Check Next.js build
  try {
    info('Running Next.js build...');
    execSync('cd next && yarn build 2>&1', {
      stdio: 'pipe',
      timeout: 300000, // 5 minutes
    });
    success('Next.js build successful');
    results.push({
      name: 'Next.js Build',
      passed: true,
      message: 'Build completed without errors',
      critical: true,
    });
  } catch (err) {
    error('Next.js build failed');
    results.push({
      name: 'Next.js Build',
      passed: false,
      message: `Build error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      critical: true,
    });
  }

  // Check Strapi build
  try {
    info('Running Strapi build...');
    execSync('cd strapi && yarn build 2>&1', {
      stdio: 'pipe',
      timeout: 300000,
    });
    success('Strapi build successful');
    results.push({
      name: 'Strapi Build',
      passed: true,
      message: 'Build completed without errors',
      critical: true,
    });
  } catch (err) {
    error('Strapi build failed');
    results.push({
      name: 'Strapi Build',
      passed: false,
      message: `Build error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      critical: true,
    });
  }
}

function checkLinting(): void {
  log('\n--- Linting Checks ---', blueColor);

  try {
    info('Running linter...');
    execSync('yarn lint 2>&1', {
      stdio: 'pipe',
      timeout: 60000,
    });
    success('Linting passed');
    results.push({
      name: 'ESLint',
      passed: true,
      message: 'No lint errors detected',
      critical: false,
    });
  } catch (err) {
    warning('Linting warnings found');
    results.push({
      name: 'ESLint',
      passed: false,
      message: 'Lint errors present - review recommended',
      critical: false,
    });
  }
}

function checkSecurity(): void {
  log('\n--- Security Checks ---', blueColor);

  // Check for hardcoded secrets
  const sensitivePatterns = [
    /\.env\./,
    /password\s*=\s*["']/i,
    /secret\s*=\s*["']/i,
    /api[_-]?key\s*=\s*["']/i,
  ];

  let foundSensitiveData = false;

  // Cross-platform recursive file finder
  function findFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          files.push(...findFiles(fullPath, extensions));
        } else if (
          entry.isFile() &&
          extensions.some((ext) => entry.name.endsWith(ext))
        ) {
          files.push(fullPath);
        }
      });
    } catch {
      // Directory doesn't exist or is not readable
    }
    return files;
  }

  const filesToCheck = ['next/src', 'strapi/src'];
  filesToCheck.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = findFiles(dir, ['.ts', '.tsx', '.js']);

      files.forEach((file) => {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          sensitivePatterns.forEach((pattern) => {
            if (pattern.test(content)) {
              foundSensitiveData = true;
            }
          });
        } catch {
          // Ignore unreadable files
        }
      });
    }
  });

  if (!foundSensitiveData) {
    success('No hardcoded secrets detected');
    results.push({
      name: 'Security: Hardcoded Secrets',
      passed: true,
      message: 'No sensitive data found in source code',
      critical: false,
    });
  } else {
    warning('Potential hardcoded secrets found - review carefully');
    results.push({
      name: 'Security: Hardcoded Secrets',
      passed: false,
      message: 'Possible sensitive data in source code - needs review',
      critical: false,
    });
  }

  // Check package dependencies for vulnerabilities
  try {
    execSync('yarn audit --level moderate 2>&1', {
      stdio: 'pipe',
      timeout: 60000,
    });
    success('No npm vulnerabilities found');
    results.push({
      name: 'Security: npm Audit',
      passed: true,
      message: 'No critical vulnerabilities',
      critical: false,
    });
  } catch {
    warning('npm vulnerabilities detected - review audit report');
    results.push({
      name: 'Security: npm Audit',
      passed: false,
      message: "Vulnerabilities found - check 'yarn audit' output",
      critical: false,
    });
  }
}

function generateReport(): void {
  log('\n' + '='.repeat(60), blueColor);
  log('DEPLOYMENT VALIDATION REPORT', blueColor);
  log('='.repeat(60), blueColor);

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const criticalFailed = results.filter((r) => !r.passed && r.critical).length;

  info(`\nTotal Checks: ${results.length}`);
  success(`Passed: ${passed}`);
  if (failed > 0) {
    error(`Failed: ${failed}`);
  }
  if (criticalFailed > 0) {
    error(`Critical Issues: ${criticalFailed}`);
  }

  log('\n--- Detailed Results ---', blueColor);
  results.forEach((result) => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed
      ? greenColor
      : result.critical
        ? redColor
        : yellowColor;
    log(`${color}${status} ${result.name}: ${result.message}${resetColor}`);
  });

  log('\n' + '='.repeat(60), blueColor);

  if (criticalFailed === 0) {
    success('✓ Ready for deployment!');
    process.exit(0);
  } else {
    error(
      `✗ ${criticalFailed} critical issue(s) must be resolved before deployment`
    );
    process.exit(1);
  }
}

// Main execution
async function main() {
  // Load environment variables first
  loadEnvironment();

  log(
    '\n╔═══════════════════════════════════════════════════════════╗',
    blueColor
  );
  log(
    '║   Production Deployment Validation Script                ║',
    blueColor
  );
  log(
    '║   Strapi + Next.js on Vercel                             ║',
    blueColor
  );
  log(
    '╚═══════════════════════════════════════════════════════════╝',
    blueColor
  );

  checkEnvironmentVariables();
  checkFiles();
  checkDependencies();
  checkLinting();
  checkSecurity();

  // Build checks last as they take longest
  checkBuild();

  generateReport();
}

main().catch((err) => {
  error(`Script failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
