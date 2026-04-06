#!/usr/bin/env node
/**
 * Easypanel SSH Deployment Diagnostic Script
 * Run this to diagnose SSH/GitHub access issues for Easypanel deployment
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✓ ${message}`, COLORS.green);
}

function error(message) {
  log(`✗ ${message}`, COLORS.red);
}

function warning(message) {
  log(`⚠ ${message}`, COLORS.yellow);
}

function info(message) {
  log(`ℹ ${message}`, COLORS.blue);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, COLORS.magenta);
  log(message, COLORS.magenta);
  log('='.repeat(60), COLORS.magenta);
}

function runCommand(command, description) {
  try {
    info(`Running: ${description}`);
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    success(`${description} - OK`);
    return { success: true, output: output.trim() };
  } catch (err) {
    error(`${description} - FAILED`);
    return { success: false, error: err.message };
  }
}

function checkFile(filePath, description) {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      success(`${description} - Found`);
      return { success: true, exists: true };
    } else {
      warning(`${description} - Not found`);
      return { success: false, exists: false };
    }
  } catch (err) {
    error(`${description} - Error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

function main() {
  header('Easypanel SSH Deployment Diagnostic');

  console.log(
    '\n📋 This script checks for common Easypanel SSH deployment issues\n'
  );

  // Check 1: SSH Keys Exist
  header('1. Checking SSH Keys');
  const sshDir = path.join(process.env.HOME || '', '.ssh');
  const keyTypes = ['id_ed25519', 'id_rsa', 'easypanel_deploy_key'];

  let foundKey = null;
  for (const keyType of keyTypes) {
    const keyPath = path.join(sshDir, keyType);
    const pubKeyPath = path.join(sshDir, `${keyType}.pub`);

    const keyExists = checkFile(keyPath, `Private key: ${keyType}`);
    const pubKeyExists = checkFile(pubKeyPath, `Public key: ${keyType}.pub`);

    if (keyExists.exists && pubKeyExists.exists) {
      foundKey = keyType;
      success(`Found usable SSH key: ${keyType}`);
      break;
    }
  }

  if (!foundKey) {
    warning('No SSH keys found. You need to generate one:');
    info('ssh-keygen -t ed25519 -C "easypanel@riostack"');
  }

  // Check 2: Git Configuration
  header('2. Checking Git Configuration');
  const gitRemote = runCommand('git remote get-url origin', 'Git remote URL');

  if (gitRemote.success) {
    const remoteUrl = gitRemote.output;
    info(`Current remote: ${remoteUrl}`);

    if (remoteUrl.includes('https://')) {
      warning('Using HTTPS. For Easypanel SSH, you need SSH format:');
      info(
        'git remote set-url origin git@github.com:indigo-services/indigo-studio.git'
      );
    } else if (remoteUrl.includes('git@github.com')) {
      success('Git remote is properly configured for SSH');
    }
  }

  // Check 3: Docker Compose File
  header('3. Checking Docker Compose Configuration');
  const composeFile = checkFile('./docker-compose.yml', 'Docker Compose file');
  const envFile = checkFile('./.env.easypanel', 'Easypanel environment file');

  if (composeFile.exists && envFile.exists) {
    success('Required configuration files present');
  } else {
    error('Missing required configuration files');
  }

  // Check 4: Test SSH Connection
  header('4. Testing SSH Connection to GitHub');
  if (foundKey) {
    info('Testing SSH connection...');
    const sshTest = runCommand(
      `ssh -i ${path.join(sshDir, foundKey)} -T git@github.com 2>&1 || true`,
      'SSH connection test'
    );

    if (sshTest.output.includes('successfully authenticated')) {
      success('SSH connection to GitHub working!');
    } else if (sshTest.output.includes('Permission denied')) {
      error('SSH permission denied - key not added to GitHub');
      warning('Solution: Add the public key to GitHub Deploy Keys');
    } else {
      warning('SSH test inconclusive');
      info('Output: ' + sshTest.output);
    }
  } else {
    warning('Cannot test SSH - no keys found');
  }

  // Check 5: Verify Git Repository Access
  header('5. Verifying Repository Access');
  const gitFetch = runCommand('git fetch origin main', 'Git fetch test');

  if (gitFetch.success) {
    success('Repository access confirmed');
  } else {
    error('Repository access failed');
    warning('Check your GitHub credentials and repository permissions');
  }

  // Recommendations
  header('📋 Recommendations');

  if (!foundKey) {
    warning('1. Generate SSH key for Easypanel');
    info(
      '   ssh-keygen -t ed25519 -C "easypanel@riostack" -f ~/.ssh/easypanel_deploy_key'
    );
  }

  if (gitRemote.success && gitRemote.output.includes('https://')) {
    warning('2. Switch Git remote to SSH');
    info(
      '   git remote set-url origin git@github.com:indigo-services/indigo-studio.git'
    );
  }

  warning('3. Add public key to GitHub Deploy Keys with write access');
  info('   → GitHub → Repo Settings → Deploy Keys → Add deploy key');
  info('   → Enable "Allow write access"');

  warning('4. Configure Easypanel with private key');
  info('   → Easypanel → Project Settings → Git');
  info('   → Paste entire private key (including BEGIN/END markers)');

  success('5. Set Docker Compose path to: docker-compose.yml');

  console.log('\n' + '='.repeat(60) + '\n');
  success('Diagnostic complete! Follow the recommendations above.');
  info('For detailed setup, see: EASYPANEL_SSH_SETUP_GUIDE.md\n');
}

main();
