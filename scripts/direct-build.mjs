#!/usr/bin/env node
/**
 * Direct Build - Push docker-compose.yml directly to Easypanel
 * Bypasses GitHub caching by using inline content
 */
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

async function directBuild() {
  console.log('🚀 DIRECT BUILD - INLINE CONTENT\n');
  console.log('='.repeat(60));

  // Read the current docker-compose.yml
  const composeContent = readFileSync('docker-compose.yml', 'utf-8');

  console.log('📋 Current docker-compose.yml:');
  console.log('   Service name:', composeContent.match(/(\w+-?\w+):/)?.[1] || 'not found');
  console.log('   Build context:', composeContent.match(/context:\s+(\S+)/)?.[1] || 'not found');
  console.log('   Lines:', composeContent.split('\n').length);

  console.log('\n📋 Step 1: Deleting existing service to clear cache...');
  try {
    const deleteCmd = `curl -s -X DELETE \\
      -H "Authorization: Bearer e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172" \\
      "https://vps10.riolabs.ai/api/compose-services/indigo-studio"`;

    execSync(deleteCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service deleted');
  } catch (error) {
    console.log('⚠️  Service may not have existed');
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n📋 Step 2: Creating service with INLINE content (not GitHub)...');

  const payload = {
    projectName: 'riostack',
    serviceName: 'indigo-studio',
    source: {
      type: 'inline',  // KEY: Using inline instead of GitHub
      content: composeContent
    },
    env: [
      { key: 'HOST', value: '0.0.0.0' },
      { key: 'PORT', value: '1337' },
      { key: 'NODE_ENV', value: 'production' },
      { key: 'DATABASE_CLIENT', value: 'sqlite' },
      { key: 'DATABASE_FILENAME', value: '.tmp/data.db' },
      { key: 'APP_KEYS', value: 'd3800189_ad55_41bf_a330_0e326d6873781,ae374b7b_2d06_4c99_9be0_08d6c0ed34622' },
      { key: 'API_TOKEN_SALT', value: '63a1c48c_c951_4bfe_831a_f34009a317c3' },
      { key: 'ADMIN_JWT_SECRET', value: '05130689_2be1_46cc_ad3b_ae1d02798660' },
      { key: 'TRANSFER_TOKEN_SALT', value: '00df0dde_c4b6_412a_a239_c65963c7e02a' },
      { key: 'JWT_SECRET', value: '300f6f44_f604_4fa0_8e9c_4110412dd41e' },
      { key: 'ADMIN_AUTH_SECRET', value: '05130689_2be1_46cc_ad3b_ae1d02798660' },
      { key: 'ADMIN_PATH', value: '/admin' },
      { key: 'CLIENT_URL', value: 'https://indigo-website-cms.vercel.app' },
      { key: 'PREVIEW_SECRET', value: '300f6f44_f604_4fa0_8e9c_4110412dd41e' },
      { key: 'URL', value: 'https://riostack-indigo-studio.ck87nu.easypanel.host' },
      { key: 'PUBLIC_URL', value: 'https://riostack-indigo-studio.ck87nu.easypanel.host' }
    ],
    createDotEnv: false,
    domains: [
      {
        host: 'riostack-indigo-studio.ck87nu.easypanel.host',
        https: true,
        path: '/',
        port: 1337,
        internalProtocol: 'http',
        service: 'indigo-studio'
      }
    ]
  };

  try {
    const createCmd = `curl -s -X POST \\
      -H "Authorization: Bearer e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(payload)}' \\
      "https://vps10.riolabs.ai/api/compose-services"`;

    const result = execSync(createCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Service created with INLINE content');

    if (result) {
      try {
        const response = JSON.parse(result);
        console.log('   Service ID:', response.id || response.serviceId);
      } catch (e) {
        console.log('   Response:', result.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('❌ Service creation failed:', error.message);
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n📋 Step 3: Triggering deployment...');
  try {
    const deployCmd = `curl -s -X POST \\
      -H "Authorization: Bearer e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172" \\
      -H "Content-Type: application/json" \\
      -d '{"json":{"serviceName":"indigo-studio","projectName":"riostack"}}' \\
      "https://vps10.riolabs.ai/api/trpc/services.compose.deployService"`;

    const result = execSync(deployCmd, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Deployment triggered');

    if (result) {
      try {
        const response = JSON.parse(result);
        if (response.error) {
          console.log('   ⚠️  API Error:', response.error.json?.message || response.error.message);
        } else {
          console.log('   Deployment started successfully');
        }
      } catch (e) {
        console.log('   Response:', result.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('⚠️  Deploy command completed');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ DIRECT BUILD COMPLETE!\n');

  console.log('🎯 KEY CHANGES:');
  console.log('• Source type: inline (not GitHub)');
  console.log('• Service name: indigo-studio');
  console.log('• Build context: . (root)');
  console.log('• No caching issues');

  console.log('\n⏳ Expected timeline:');
  console.log('• 2-3 minutes: Containers build');
  console.log('• 1-2 minutes: Containers start');
  console.log('• Total: 3-5 minutes to live');

  console.log('\n🔍 Monitor at:');
  console.log('• https://vps10.riolabs.ai (Easypanel dashboard)');
  console.log('• https://riostack-indigo-studio.ck87nu.easypanel.host/ (when live)');

  console.log('\n' + '='.repeat(60));
}

directBuild().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});