import { execFileSync, spawnSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

type Level = 'PASS' | 'WARN' | 'FAIL';

type CheckResult = {
  level: Level;
  label: string;
  detail: string;
};

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const repoRoot = process.cwd();
const nextEnvPath = path.join(repoRoot, 'next', '.env');
const strapiEnvPath = path.join(repoRoot, 'strapi', '.env');

const requiredDeploySecrets = [
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
];

const optionalDeploySecrets = ['EASYPANEL_STRAPI_DEPLOY_WEBHOOK'];

function runCommand(
  command: string,
  commandArgs: string[] = []
): {
  ok: boolean;
  stdout: string;
  stderr: string;
} {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  };
}

function addResult(
  results: CheckResult[],
  level: Level,
  label: string,
  detail: string
): void {
  results.push({ level, label, detail });
}

function readEnv(pathname: string): Record<string, string> {
  if (!fs.existsSync(pathname)) return {};
  return dotenv.parse(fs.readFileSync(pathname, 'utf8'));
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('tobemodified') || value === 'preview_secret';
}

function parseGitHubRepo(): string | null {
  const remote = runCommand('git', ['remote', 'get-url', 'origin']);
  if (!remote.ok || !remote.stdout) return null;

  const match = remote.stdout.match(/github\.com[:/](.+?)(?:\.git)?$/);
  return match?.[1] || null;
}

function checkNodeVersion(results: CheckResult[]): void {
  const version = process.versions.node;
  const major = Number(version.split('.')[0]);
  if (major >= 18 && major <= 22) {
    addResult(results, 'PASS', 'Node.js', `Detected ${version}`);
    return;
  }

  if (major > 22) {
    addResult(
      results,
      'WARN',
      'Node.js',
      `Detected ${version}; Strapi officially targets Node 18-22, but newer versions may still work locally`
    );
    return;
  }

  addResult(
    results,
    'FAIL',
    'Node.js',
    `Detected ${version}; expected a version compatible with Strapi (18-22)`
  );
}

function checkYarn(results: CheckResult[]): void {
  const yarn = runCommand('yarn', ['--version']);
  if (yarn.ok) {
    addResult(results, 'PASS', 'Yarn', `Detected ${yarn.stdout}`);
    return;
  }

  addResult(results, 'FAIL', 'Yarn', yarn.stderr || 'Yarn is not available');
}

function checkRepo(results: CheckResult[]): void {
  const repo = parseGitHubRepo();
  if (repo) {
    addResult(results, 'PASS', 'Git remote', `origin -> ${repo}`);
    return;
  }

  addResult(results, 'FAIL', 'Git remote', 'No GitHub origin remote detected');
}

function checkEnvFiles(results: CheckResult[]): void {
  const nextEnv = readEnv(nextEnvPath);
  const strapiEnv = readEnv(strapiEnvPath);

  if (!fs.existsSync(nextEnvPath)) {
    addResult(results, 'FAIL', 'next/.env', 'Missing next/.env');
  } else if (
    !nextEnv.WEBSITE_URL ||
    !nextEnv.NEXT_PUBLIC_API_URL ||
    isPlaceholder(nextEnv.PREVIEW_SECRET)
  ) {
    addResult(
      results,
      'FAIL',
      'next/.env',
      'Missing or placeholder values in WEBSITE_URL, NEXT_PUBLIC_API_URL, or PREVIEW_SECRET'
    );
  } else {
    addResult(
      results,
      'PASS',
      'next/.env',
      'Required local Next values are set'
    );
  }

  if (!fs.existsSync(strapiEnvPath)) {
    addResult(results, 'FAIL', 'strapi/.env', 'Missing strapi/.env');
  } else {
    const requiredKeys = [
      'APP_KEYS',
      'API_TOKEN_SALT',
      'ADMIN_JWT_SECRET',
      'TRANSFER_TOKEN_SALT',
      'JWT_SECRET',
      'CLIENT_URL',
      'PREVIEW_SECRET',
    ];
    const missing = requiredKeys.filter((key) => isPlaceholder(strapiEnv[key]));
    if (missing.length > 0) {
      addResult(
        results,
        'FAIL',
        'strapi/.env',
        `Missing or placeholder values in ${missing.join(', ')}`
      );
    } else {
      addResult(
        results,
        'PASS',
        'strapi/.env',
        'Required local Strapi values are set'
      );
    }
  }
}

function checkGitHubAuth(results: CheckResult[]): void {
  const auth = runCommand('gh', ['auth', 'status']);
  if (auth.ok) {
    addResult(results, 'PASS', 'GitHub auth', 'gh is authenticated');
    return;
  }

  addResult(
    results,
    'WARN',
    'GitHub auth',
    auth.stderr || 'gh auth status failed'
  );
}

function checkGhp(results: CheckResult[]): void {
  const ghp = runCommand('yarn', ['ghp', '--version']);
  if (ghp.ok) {
    addResult(results, 'PASS', 'ghp', `Detected ${ghp.stdout}`);
    return;
  }

  addResult(results, 'WARN', 'ghp', ghp.stderr || 'ghp is not available');
}

function resolveVercelCommand(): {
  command: string;
  args: string[];
  label: string;
} | null {
  const globalVercel = runCommand('vercel', ['--version']);
  if (globalVercel.ok) {
    return { command: 'vercel', args: [], label: globalVercel.stdout };
  }

  const npxVercel = runCommand('npx', ['vercel', '--version']);
  if (npxVercel.ok) {
    return { command: 'npx', args: ['vercel'], label: npxVercel.stdout };
  }

  return null;
}

function checkVercel(results: CheckResult[]): void {
  const vercel = resolveVercelCommand();
  if (!vercel) {
    addResult(
      results,
      'WARN',
      'Vercel CLI',
      'Neither vercel nor npx vercel is available'
    );
    return;
  }

  addResult(results, 'PASS', 'Vercel CLI', `Detected ${vercel.label}`);

  const whoami = runCommand(vercel.command, [...vercel.args, 'whoami']);
  if (whoami.ok) {
    addResult(results, 'PASS', 'Vercel auth', whoami.stdout || 'Authenticated');
  } else {
    addResult(
      results,
      'WARN',
      'Vercel auth',
      whoami.stderr || 'Vercel CLI is not authenticated'
    );
  }

  const projectJson = path.join(repoRoot, 'next', '.vercel', 'project.json');
  if (fs.existsSync(projectJson)) {
    addResult(
      results,
      'PASS',
      'Vercel link',
      'next/.vercel/project.json exists'
    );
  } else {
    addResult(
      results,
      'WARN',
      'Vercel link',
      'next/.vercel/project.json is missing; run vercel link in next/ if needed'
    );
  }
}

function checkGitHubSecrets(results: CheckResult[]): void {
  const repo = parseGitHubRepo();
  if (!repo) {
    addResult(
      results,
      'WARN',
      'GitHub secrets',
      'Cannot inspect secrets without a GitHub origin remote'
    );
    return;
  }

  const secrets = runCommand('gh', ['secret', 'list', '--repo', repo]);
  if (!secrets.ok) {
    addResult(
      results,
      'WARN',
      'GitHub secrets',
      secrets.stderr || 'Unable to inspect repo secrets'
    );
    return;
  }

  const names = new Set(
    secrets.stdout
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean)
  );

  const missingRequired = requiredDeploySecrets.filter(
    (name) => !names.has(name)
  );
  if (missingRequired.length === 0) {
    addResult(
      results,
      'PASS',
      'Deploy secrets',
      `Required GitHub secrets present: ${requiredDeploySecrets.join(', ')}`
    );
  } else {
    addResult(
      results,
      'WARN',
      'Deploy secrets',
      `Missing GitHub secrets: ${missingRequired.join(', ')}`
    );
  }

  const missingOptional = optionalDeploySecrets.filter(
    (name) => !names.has(name)
  );
  if (missingOptional.length === 0) {
    addResult(
      results,
      'PASS',
      'EasyPanel webhook secret',
      'EASYPANEL_STRAPI_DEPLOY_WEBHOOK is configured'
    );
  } else {
    addResult(
      results,
      'WARN',
      'EasyPanel webhook secret',
      `Optional webhook secret missing: ${missingOptional.join(', ')}`
    );
  }
}

function printResults(results: CheckResult[]): number {
  const levelIcon: Record<Level, string> = {
    PASS: '[PASS]',
    WARN: '[WARN]',
    FAIL: '[FAIL]',
  };

  console.log('Setup doctor');
  for (const result of results) {
    console.log(`${levelIcon[result.level]} ${result.label}: ${result.detail}`);
  }

  const failCount = results.filter((result) => result.level === 'FAIL').length;
  const warnCount = results.filter((result) => result.level === 'WARN').length;
  const passCount = results.filter((result) => result.level === 'PASS').length;

  console.log(
    `Summary: ${passCount} pass, ${warnCount} warn, ${failCount} fail`
  );

  if (strict && (failCount > 0 || warnCount > 0)) {
    return 1;
  }

  if (failCount > 0) {
    return 1;
  }

  return 0;
}

function main(): void {
  const results: CheckResult[] = [];
  checkNodeVersion(results);
  checkYarn(results);
  checkRepo(results);
  checkEnvFiles(results);
  checkGitHubAuth(results);
  checkGhp(results);
  checkVercel(results);
  checkGitHubSecrets(results);

  const exitCode = printResults(results);
  process.exit(exitCode);
}

main();
