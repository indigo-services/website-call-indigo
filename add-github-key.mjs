#!/usr/bin/env node

/**
 * Add Easypanel SSH Key to GitHub
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const EASYPANEL_SSH_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBPqX/Al+9WKPteY9WOqoe+p9k+E7Etz9Ywpsxjl6DXU root@d6357425ba02';

async function addGitHubKey() {
  console.log('🔑 ADDING EASYPANEL SSH KEY TO GITHUB\n');

  // Write key to temp file
  writeFileSync('/tmp/easypanel_deploy_key.pub', EASYPANEL_SSH_KEY);

  try {
    // Use GitHub CLI to add the deploy key
    const result = execSync(
      `cat /tmp/easypanel_deploy_key.pub | gh repo deploy-key add indigo-services/indigo-studio --title "Easypanel-Server-d6357425ba02" --allow-write`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    if (result.includes('already exists') || result.includes('Key already added')) {
      console.log('✅ Deploy key already exists on GitHub');
    } else {
      console.log('✅ Easypanel SSH key added to GitHub successfully');
    }
  } catch (error) {
    if (error.stderr && error.stderr.includes('already exists')) {
      console.log('✅ Deploy key already exists on GitHub');
    } else {
      console.log('⚠️  Could not add key automatically');
      console.log('Please add manually:');
      console.log('1. Go to: https://github.com/indigo-services/indigo-studio/settings/keys');
      console.log('2. Click "Add deploy key"');
      console.log('3. Title: "Easypanel-Server-d6357425ba02"');
      console.log('4. Key:', EASYPANEL_SSH_KEY);
      console.log('5. ✅ Check "Allow write access"');
      console.log('6. Click "Add deploy key"');
    }
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Deploy key is now added to GitHub');
  console.log('2. Easypanel can now access the repository via SSH');
  console.log('3. Run: yarn deploy:easypanel:api');
  console.log('4. Deployment should succeed');
}

addGitHubKey().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});