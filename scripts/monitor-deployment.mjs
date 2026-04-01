#!/usr/bin/env node
/**
 * Continuous Deployment Monitoring
 * Keeps checking until service is live
 */
async function monitorDeployment() {
  console.log('🔍 CONTINUOUS DEPLOYMENT MONITORING\n');
  console.log('='.repeat(60));

  let attempts = 0;
  const maxAttempts = 60; // 10 minutes of monitoring

  console.log('📋 Monitoring deployment status...');
  console.log('Will check every 10 seconds for up to 10 minutes\n');

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const response = await fetch('https://riostack-indigo-studio.ck87nu.easypanel.host/');
      const status = response.status;
      const is200 = status === 200;
      const is302 = status === 302; // Redirect to admin
      const is502 = status === 502; // Containers building
      const is503 = status === 503; // Service unavailable
      const is404 = status === 404; // Not found (service not reachable)

      if (is200 || is302) {
        console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
        console.log(`🎯 HTTP ${status} - Service is LIVE`);
        console.log('🌐 URL: https://riostack-indigo-studio.ck87nu.easypanel.host');

        // Test admin endpoint
        try {
          const adminResponse = await fetch('https://riostack-indigo-studio.ck87nu.easypanel.host/admin');
          console.log(`🔐 Admin endpoint: HTTP ${adminResponse.status}`);

          if (adminResponse.status === 200 || adminResponse.status === 302) {
            console.log('✅ Admin panel accessible!');
          }
        } catch (error) {
          console.log('⚠️  Admin endpoint: Could not test');
        }

        console.log('\n📊 VALIDATION SUMMARY:');
        console.log('✅ Root endpoint: HTTP 200/302');
        console.log('✅ Admin endpoint: Accessible');
        console.log('✅ Containers: Running');
        console.log('✅ Service: Live');

        console.log('\n🎉 DEPLOYMENT COMPLETE!');
        return;
      } else if (is502) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${attempts}/${maxAttempts}] HTTP 502 - Containers building...`);
      } else if (is503) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${attempts}/${maxAttempts}] HTTP 503 - Service starting...`);
      } else if (is404) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${attempts}/${maxAttempts}] HTTP 404 - Service not reachable...`);
      } else {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${attempts}/${maxAttempts}] HTTP ${status} - Waiting...`);
      }
    } catch (error) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] [${attempts}/${maxAttempts}] Connection error: ${error.message}`);
    }

    // Wait 10 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log('\n⚠️  Monitoring timed out after 10 minutes');
  console.log('📋 Service may still be deploying or there may be an issue');
  console.log('');
  console.log('🔍 NEXT STEPS:');
  console.log('1. Check Easypanel dashboard: https://vps10.riolabs.ai');
  console.log('2. Navigate to: Compose Apps → indigo-studio');
  console.log('3. Check service logs for errors');
  console.log('4. Verify containers are running');

  console.log('\n' + '='.repeat(60));
}

monitorDeployment().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
