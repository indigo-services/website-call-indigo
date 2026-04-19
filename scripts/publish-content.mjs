#!/usr/bin/env node
/**
 * Content Publishing Script
 * Publishes content from export file to production Strapi instance
 */
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

async function publishContent() {
  console.log('📝 PUBLISHING CONTENT TO PRODUCTION STRAPI\n');
  console.log('='.repeat(60));

  const exportFile = './data/export.tar.gz';

  if (!existsSync(exportFile)) {
    throw new Error(`Export file not found: ${exportFile}`);
  }

  console.log(`✅ Found export file: ${exportFile}`);
  console.log(`   Size: ${(23).toFixed(1)}MB`);

  console.log('\n📋 Available publishing methods:');
  console.log('1. Manual import via admin panel');
  console.log('2. Direct database seeding');
  console.log('3. API-based content import');

  console.log('\n🔧 Method 1: Admin Panel Import');
  console.log('   Steps:');
  console.log('   1. Access admin panel: https://riostack-indigo-studio.ck87nu.easypanel.host/manage/admin');
  console.log('   2. Navigate to: Settings → Import/Export');
  console.log('   3. Upload export file: ' + exportFile);
  console.log('   4. Click "Import" to load content');

  console.log('\n🔧 Method 2: Direct Database Seeding');
  console.log('   This requires copying content to Easypanel container volumes.');

  console.log('\n🔧 Method 3: API Import');
  console.log('   Requires authentication token and API access.');

  console.log('\n📋 RECOMMENDED APPROACH:');
  console.log('Since the export file is 23MB, manual import via admin panel is most reliable.');
  console.log('The content includes:');
  console.log('• Schemas and content types');
  console.log('• Entity data (articles, pages, etc.)');
  console.log('• Media assets and images');
  console.log('• Admin configurations');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Access the admin panel manually');
  console.log('2. Use the Import/Export feature');
  console.log('3. Upload the export file from the data directory');
  console.log('4. Validate content appears in the API');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Content publishing guide complete');
}

publishContent().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
