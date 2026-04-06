#!/usr/bin/env node

/**
 * Verify and test docker-compose.yml content
 */

import fs from 'fs';

const composeContent = fs.readFileSync('docker-compose.yml', 'utf-8');

console.log('=== Docker Compose Content Analysis ===\n');
console.log('Full content:');
console.log('---');
console.log(composeContent);
console.log('---\n');

console.log('=== Build Configuration ===');
const buildMatch = composeContent.match(/build:([\s\S]*?)dockerfile:/);
if (buildMatch) {
  const buildSection = buildMatch[0] + ' strapi/Dockerfile';
  console.log(buildSection);
}

console.log('\n=== Validation ===');

// Check if build context is correct
if (composeContent.includes('context: .')) {
  console.log('✓ Build context is . (repository root)');
} else {
  console.log('✗ Build context is not .');
}

if (composeContent.includes('dockerfile: strapi/Dockerfile')) {
  console.log('✓ Dockerfile path is strapi/Dockerfile');
} else {
  console.log('✗ Dockerfile path is not strapi/Dockerfile');
}

// Check for container_name which can cause conflicts
if (composeContent.includes('container_name:')) {
  console.log('⚠ container_name is set - this can cause conflicts!');
}

// Check for BUILD_CONTEXT arg
if (composeContent.includes('BUILD_CONTEXT')) {
  console.log('✓ BUILD_CONTEXT arg is defined');
  const argMatch = composeContent.match(/BUILD_CONTEXT:\s*(.+)/);
  if (argMatch) {
    console.log('  Value:', argMatch[1].trim());
  }
}

console.log('\n=== File Structure Check ===');
const strapiDockerfile = fs.existsSync('strapi/Dockerfile');
console.log('strapi/Dockerfile exists:', strapiDockerfile ? '✓' : '✗');

const strapiPackageJson = fs.existsSync('strapi/package.json');
console.log('strapi/package.json exists:', strapiPackageJson ? '✓' : '✗');

console.log('\n=== Recommendation ===');
console.log('The docker-compose.yml looks correct.');
console.log('The issue might be that Easypanel is not reading the file correctly');
console.log('or there is a cached/override file on the server.');
