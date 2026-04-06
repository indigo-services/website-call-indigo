#!/usr/bin/env node

/**
 * Comprehensive Deployment Status Check
 * Tests multiple aspects of the deployment to diagnose issues
 */

import { execSync } from 'child_process';

const BASE_URL = 'https://riostack-indigo-studio.ck87nu.easypanel.host';
const API_TOKEN = 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172';
const API_BASE = 'https://vps10.riolabs.ai/api';

async function testEndpoint(name, url) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return { name, url, status: response.status, success: response.status === 200 };
  } catch (error) {
    return { name, url, status: 'ERROR', error: error.message, success: false };
  }
}

async function checkEasypanelService() {
  console.log('🔍 Checking Easypanel service status...');
  try {
    const result = execSync(`curl -s -H "Authorization: Bearer ${API_TOKEN}" "${API_BASE}/services/indigo-studio"`, { encoding: 'utf-8' });

    if (result.includes('<!doctype')) {
      console.log('⚠️  API returned HTML (might be serving frontend)');
      return null;
    }

    const service = JSON.parse(result);
    console.log('✅ Service found:', service.name);
    console.log('   Type:', service.type);
    console.log('   ID:', service.id);

    if (service.composeService && service.composeService.source) {
      console.log('   Source Type:', service.composeService.source.type);
      console.log('   Repository:', service.composeService.source.repository);
      console.log('   Branch:', service.composeService.source.branch);
      console.log('   Build Path:', service.composeService.source.buildPath);

      const sshKey = service.composeService.source.sshKey;
      if (sshKey) {
        const isComplete = !sshKey.includes('...');
        console.log('   SSH Key:', isComplete ? 'Complete ✓' : 'Truncated ✗');
      }
    }

    return service;
  } catch (error) {
    console.log('❌ Could not fetch service:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 COMPREHENSIVE DEPLOYMENT STATUS CHECK\n');
  console.log('='.repeat(60));

  // Check Easypanel service
  await checkEasypanelService();

  console.log('\n📡 Testing Endpoints:');
  console.log('-'.repeat(60));

  const endpoints = [
    { name: 'Main Page', url: BASE_URL },
    { name: 'Admin Panel', url: `${BASE_URL}/manage/admin` },
    { name: 'API Articles', url: `${BASE_URL}/api/articles` }
  ];

  const results = await Promise.all(
    endpoints.map(ep => testEndpoint(ep.name, ep.url))
  );

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name}: ${result.status} OK`);
    } else if (result.status === 503) {
      console.log(`⚠️  ${result.name}: ${result.status} Service Unavailable`);
    } else if (result.status === 502) {
      console.log(`⚠️  ${result.name}: ${result.status} Bad Gateway`);
    } else {
      console.log(`❌ ${result.name}: ${result.status || 'ERROR'}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('🎯 DIAGNOSIS:\n');

  const all503 = results.every(r => r.status === 503);
  const all502 = results.every(r => r.status === 502);

  if (all503) {
    console.log('❌ All endpoints returning 503 - Containers not running');
    console.log('   Possible causes:');
    console.log('   • SSH connection still failing');
    console.log('   • Docker build errors');
    console.log('   • Containers failing to start');
    console.log('   • Application crashes after start');
  } else if (all502) {
    console.log('⚠️  All endpoints returning 502 - Containers starting');
    console.log('   This is normal during initial deployment');
    console.log('   Wait 2-3 minutes for containers to fully start');
  } else if (results.some(r => r.success)) {
    console.log('✅ Some endpoints working - Partial deployment success');
    console.log('   Service is becoming available');
  } else {
    console.log('❌ Mixed status - Check individual endpoints');
  }

  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('1. Check Easypanel logs for container errors');
  console.log('2. Verify SSH configuration was applied correctly');
  console.log('3. Try manual deployment trigger from dashboard');
  console.log('4. Check GitHub repository accessibility');

  console.log('\n📊 MONITORING:');
  console.log('Background monitoring script continues to run');
  console.log('Will automatically detect and report when deployment succeeds');

  console.log('\n' + '='.repeat(60));
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});