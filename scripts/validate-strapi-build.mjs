#!/usr/bin/env node
/**
 * Strapi Build & Docker Validation Script
 * Validates Strapi readiness for VPS deployment
 * Usage: node scripts/validate-strapi-build.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const STRAPI_DIR = './strapi';
const CHECKS = [];

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         Strapi Build & VPS Deployment Validation              ║');
console.log('║                    April 1, 2026                              ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

/**
 * Check file/directory existence
 */
function checkFileExists(filePath, description) {
  const fullPath = path.join(STRAPI_DIR, filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}: ${filePath}`);
  CHECKS.push({ name: description, passed: exists });
  return exists;
}

/**
 * Check Dockerfile validity
 */
function validateDockerfile() {
  console.log('\n--- Docker Configuration ---');
  
  if (!checkFileExists('Dockerfile', 'Dockerfile')) {
    console.log('   ⚠️  Dockerfile missing - container cannot be built');
    return false;
  }

  try {
    const dockerfile = fs.readFileSync(path.join(STRAPI_DIR, 'Dockerfile'), 'utf-8');
    
    // Check for key patterns
    const checks = [
      { pattern: /FROM node:\d+/, name: 'FROM instruction' },
      { pattern: /WORKDIR/, name: 'WORKDIR instruction' },
      { pattern: /COPY/, name: 'COPY instruction' },
      { pattern: /yarn install|npm install/, name: 'Dependency installation' },
      { pattern: /yarn build|npm run build/, name: 'Build command' },
      { pattern: /CMD|ENTRYPOINT/, name: 'Entry point' },
      { pattern: /EXPOSE/, name: 'Port exposure' },
    ];

    let dockerfileValid = true;
    checks.forEach(check => {
      if (check.pattern.test(dockerfile)) {
        console.log(`✅ ${check.name}`);
        CHECKS.push({ name: `Dockerfile: ${check.name}`, passed: true });
      } else {
        console.log(`❌ ${check.name} - missing or invalid`);
        CHECKS.push({ name: `Dockerfile: ${check.name}`, passed: false });
        dockerfileValid = false;
      }
    });

    return dockerfileValid;
  } catch (err) {
    console.log(`❌ Failed to read Dockerfile: ${err.message}`);
    CHECKS.push({ name: 'Dockerfile validity', passed: false });
    return false;
  }
}

/**
 * Check Strapi directory structure
 */
function validateStrapiStructure() {
  console.log('\n--- Strapi Directory Structure ---');
  
  const requiredDirs = [
    'config',
    'src',
    'types',
    'database',
    'public',
  ];

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    '.env.example',
  ];

  let structureValid = true;

  requiredDirs.forEach(dir => {
    if (checkFileExists(dir, `Directory: ${dir}`)) {
      // Check not empty
      const fullPath = path.join(STRAPI_DIR, dir);
      const files = fs.readdirSync(fullPath);
      if (files.length > 0) {
        console.log(`   └─ Contains ${files.length} item(s)`);
      }
    } else {
      structureValid = false;
    }
  });

  requiredFiles.forEach(file => {
    if (!checkFileExists(file, `File: ${file}`)) {
      structureValid = false;
    }
  });

  return structureValid;
}

/**
 * Check build configuration
 */
function validateBuildConfig() {
  console.log('\n--- Build Configuration ---');

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(STRAPI_DIR, 'package.json'), 'utf-8')
    );

    const checks = [
      { key: 'name', label: 'Package name' },
      { key: 'version', label: 'Version' },
      { key: 'description', label: 'Description' },
      { key: 'scripts', label: 'Scripts defined' },
      { key: 'dependencies', label: 'Dependencies' },
    ];

    let configValid = true;
    checks.forEach(check => {
      if (packageJson[check.key]) {
        if (check.key === 'scripts') {
          const buildScript = packageJson.scripts.build ? '✅' : '❌';
          console.log(`✅ ${check.label}: ${Object.keys(packageJson.scripts).join(', ')}`);
          CHECKS.push({ name: `Build script`, passed: !!packageJson.scripts.build });
          if (!packageJson.scripts.build) configValid = false;
        } else if (check.key === 'dependencies') {
          console.log(`✅ ${check.label}: ${Object.keys(packageJson.dependencies).length} packages`);
          CHECKS.push({ name: `Dependencies`, passed: true });
        } else {
          console.log(`✅ ${check.label}: ${packageJson[check.key]}`);
          CHECKS.push({ name: check.label, passed: true });
        }
      } else {
        console.log(`❌ ${check.label}: missing`);
        CHECKS.push({ name: check.label, passed: false });
        configValid = false;
      }
    });

    return configValid;
  } catch (err) {
    console.log(`❌ Failed to read package.json: ${err.message}`);
    CHECKS.push({ name: 'package.json validation', passed: false });
    return false;
  }
}

/**
 * Check environment configuration
 */
function validateEnvironment() {
  console.log('\n--- Environment Configuration ---');

  const envStatus = checkFileExists('.env.example', 'Example env file');
  
  try {
    const envExample = fs.readFileSync(path.join(STRAPI_DIR, '.env.example'), 'utf-8');
    const envVars = envExample.split('\n').filter(line => line && !line.startsWith('#'));
    console.log(`   └─ Defines ${envVars.length} environment variables`);
  } catch (err) {
    console.log(`   └─ Could not parse .env.example`);
  }

  return envStatus;
}

/**
 * Check build readiness
 */
function validateBuildReadiness() {
  console.log('\n--- Build Readiness ---');

  try {
    const distDir = path.join(STRAPI_DIR, 'dist');
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      console.log(`✅ Build artifacts exist: ${files.length} file(s)`);
      CHECKS.push({ name: 'Build artifacts', passed: true });
      return true;
    } else {
      console.log(`⚠️  Build artifacts not found (expected on clean install)`);
      console.log(`   Run: cd strapi && yarn build`);
      CHECKS.push({ name: 'Build artifacts', passed: false });
      return false;
    }
  } catch (err) {
    console.log(`❌ Error checking build: ${err.message}`);
    CHECKS.push({ name: 'Build check', passed: false });
    return false;
  }
}

/**
 * Check Docker installation
 */
function validateDockerSetup() {
  console.log('\n--- Docker Setup ---');

  try {
    execSync('docker --version', { stdio: 'pipe' });
    const dockerVersion = execSync('docker --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ Docker installed: ${dockerVersion}`);
    CHECKS.push({ name: 'Docker installed', passed: true });

    try {
      execSync('docker buildx version', { stdio: 'pipe' });
      console.log(`✅ Docker buildx available`);
      CHECKS.push({ name: 'Docker buildx', passed: true });
    } catch {
      console.log(`⚠️  Docker buildx not available`);
      CHECKS.push({ name: 'Docker buildx', passed: false });
    }

    return true;
  } catch (err) {
    console.log(`❌ Docker not installed or not in PATH`);
    console.log(`   Install from: https://www.docker.com/products/docker-desktop`);
    CHECKS.push({ name: 'Docker installed', passed: false });
    return false;
  }
}

/**
 * Generate final report
 */
function generateReport() {
  const passed = CHECKS.filter(c => c.passed).length;
  const total = CHECKS.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    VALIDATION REPORT                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`Checks Passed:     ${passed}/${total}`);
  console.log(`Success Rate:      ${percentage}%`);
  console.log(`\nStatus:            ${percentage === '100.0' ? '✅ READY FOR DEPLOYMENT' : '⚠️  NEEDS ATTENTION'}`);

  // VPS Deployment readiness
  console.log('\n--- VPS Deployment Readiness ---');
  const dockerfileOk = CHECKS.some(c => c.name === 'Dockerfile' && c.passed);
  const structureOk = CHECKS.filter(c => c.name.startsWith('Directory:') || c.name.startsWith('File:')).every(c => c.passed);
  const buildOk = CHECKS.some(c => c.name === 'Build script' && c.passed);

  if (dockerfileOk && structureOk && buildOk) {
    console.log('✅ Strapi is ready for Docker deployment on VPS');
    console.log('   Next steps:');
    console.log('   1. Push to GitHub: git push origin main');
    console.log('   2. Configure Docker build in Riostack/Easypanel');
    console.log('   3. Set environment variables from .env.example');
    console.log('   4. Deploy to production');
  } else {
    console.log('⚠️  Strapi needs attention before VPS deployment');
    if (!dockerfileOk) console.log('   - Create/fix Dockerfile');
    if (!structureOk) console.log('   - Verify directory structure');
    if (!buildOk) console.log('   - Configure build scripts');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  // Return exit code
  return percentage === '100.0' ? 0 : 1;
}

// Run validations
validateDockerfile();
validateStrapiStructure();
validateBuildConfig();
validateEnvironment();
validateBuildReadiness();
validateDockerSetup();

const exitCode = generateReport();
process.exit(exitCode);
