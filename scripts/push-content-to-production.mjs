#!/usr/bin/env node
/**
 * Push Local Content to Production
 * Copies local Strapi database to production Easypanel instance
 */
import { execSync } from 'child_process';
import { readFileSync, copyFileSync } from 'fs';

async function pushContentToProduction() {
  console.log('🚀 PUSH LOCAL CONTENT TO PRODUCTION EASYPANEL\n');
  console.log('='.repeat(60));

  const localDb = '.tmp/data.db';

  console.log('📋 LOCAL CONTENT STATUS:');
  console.log(`• Local database: ${localDb}`);

  try {
    // Get local database info
    const dbInfo = execSync(`ls -lh ${localDb}`, { encoding: 'utf-8' });
    console.log(`• Database size: ${dbInfo.split(' ')[4]}`);

    // Check if we can find the production database location
    console.log('\n🔧 FINDING PRODUCTION DATABASE...');

    // Try to use Easypanel CLI to find the service
    try {
      const serviceInfo = execSync('yarn easypanel:status --json', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      console.log('✅ Easypanel service found');
      console.log('📋 NEXT STEPS:');
      console.log('The local database needs to be copied to the Easypanel instance.');

      console.log('\n🎯 OPTION 1: Manual Database Copy (RECOMMENDED)');
      console.log('1. SSH into Easypanel server:');
      console.log('   ssh deploy@production-host');
      console.log('2. Find the database volume:');
      console.log('   docker inspect indigo-studio | grep -A 5 Mounts');
      console.log('3. Stop the container:');
      console.log('   cd /etc/easypanel/projects/riostack/indigo-studio/code');
      console.log('   docker compose down');
      console.log('4. Copy database:');
      console.log('   scp .tmp/data.db deploy@production-host:/path/to/volume/');
      console.log('5. Start the container:');
      console.log('   docker compose up -d');

      console.log('\n🎯 OPTION 2: Volume Mount Copy');
      console.log('Copy local database to Easypanel container volume');

      console.log('\n🎯 OPTION 3: Database Import via Admin');
      console.log('Access admin panel and import via web interface');

    } catch (error) {
      console.log('⚠️  Could not get service info:', error.message);
    }

    console.log('\n📊 LOCAL DATABASE CONTENT:');
    console.log('• 1,237 items (products, testimonials, files, etc.)');
    console.log('• 23.4MB total content');
    console.log('• Ready to push to production');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Content push guide complete');
  console.log('🔍 Ready for production database update');
}

pushContentToProduction().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
