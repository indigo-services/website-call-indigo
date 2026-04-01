#!/usr/bin/env node
/**
 * Check what Easypanel actually has for the compose configuration
 */
import { execSync } from 'child_process';

async function checkComposeConfig() {
  console.log('🔍 CHECKING EASYPANEL COMPOSE CONFIGURATION\n');
  console.log('='.repeat(60));

  try {
    // Use the Easypanel operations to get service details
    const { easypanelOps } = await import('./easypanel-ops.mts');
    
    const service = await easypanelOps.findService({
      projectId: 'riostack',
      serviceName: 'indigo-studio'
    });

    if (service) {
      console.log('✅ Service found:', service.name);
      console.log('   Type:', service.serviceType);
      console.log('   ID:', service.id);
      
      // Check if it has compose configuration
      if (service.composeService) {
        console.log('\n📋 Compose Configuration:');
        console.log('   Source Type:', service.composeService.sourceType);
        console.log('   Branch:', service.composeService.branch);
        console.log('   Repository:', service.composeService.repository);
        
        // Try to get the actual compose content
        if (service.composeService.composeCompose) {
          console.log('\n📄 Compose Content (first 500 chars):');
          console.log(service.composeService.composeCompose.substring(0, 500));
        }
      }
    } else {
      console.log('❌ Service not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback: Try using the bootstrap to see what happens
    console.log('\n📋 Trying bootstrap to see actual configuration...');
    try {
      const result = execSync('yarn easypanel:bootstrap --dry-run', {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 30000
      });
      console.log('Bootstrap result:', result.substring(0, 500));
    } catch (bootstrapError) {
      console.log('Bootstrap failed:', bootstrapError.message);
    }
  }

  console.log('\n' + '='.repeat(60));
}

checkComposeConfig();
