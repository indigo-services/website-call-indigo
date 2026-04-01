import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { v4 as uuidv4 } from 'uuid';

const args = new Set(process.argv.slice(2));
const nonInteractive = args.has('--non-interactive');
const repoRoot = process.cwd();
const nextDir = path.join(repoRoot, 'next');
const strapiDir = path.join(repoRoot, 'strapi');

const NEXT_ENV_PATH = path.join(nextDir, '.env');
const NEXT_EXAMPLE_PATH = path.join(nextDir, '.env.example');
const STRAPI_ENV_PATH = path.join(strapiDir, '.env');
const STRAPI_EXAMPLE_PATH = path.join(strapiDir, '.env.example');

const STRAPI_SECRET_KEYS = [
  'APP_KEYS',
  'API_TOKEN_SALT',
  'ADMIN_JWT_SECRET',
  'TRANSFER_TOKEN_SALT',
  'JWT_SECRET',
];

function generateSecret(): string {
  return uuidv4().replace(/-/g, '_');
}

function isPlaceholderValue(key: string, value: string | undefined): boolean {
  if (!value) return true;

  if (key === 'PREVIEW_SECRET') {
    return value.trim() === 'preview_secret';
  }

  return value.includes('tobemodified');
}

function ensureEnvFile(envPath: string, examplePath: string): boolean {
  if (fs.existsSync(envPath)) return false;

  if (!fs.existsSync(examplePath)) {
    throw new Error(`Missing env example file: ${examplePath}`);
  }

  fs.copyFileSync(examplePath, envPath);
  return true;
}

function readEnvFile(envPath: string): {
  raw: string;
  parsed: Record<string, string>;
} {
  const raw = fs.readFileSync(envPath, 'utf8');
  const parsed = dotenv.parse(raw);
  return { raw, parsed };
}

function upsertEnvValue(raw: string, key: string, value: string): string {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linePattern = new RegExp(
    `^(${escapedKey}=)([^\\r\\n]*?)(\\s+#.*)?$`,
    'm'
  );

  if (linePattern.test(raw)) {
    return raw.replace(linePattern, `$1${value}$3`);
  }

  const suffix = raw.endsWith('\n') ? '' : '\n';
  return `${raw}${suffix}${key}=${value}\n`;
}

async function promptWithDefault(
  rl: readline.Interface,
  label: string,
  defaultValue: string
): Promise<string> {
  const response = await rl.question(`${label} [${defaultValue}]: `);
  return response.trim() || defaultValue;
}

async function main(): Promise<void> {
  const nextCreated = ensureEnvFile(NEXT_ENV_PATH, NEXT_EXAMPLE_PATH);
  const strapiCreated = ensureEnvFile(STRAPI_ENV_PATH, STRAPI_EXAMPLE_PATH);

  let nextEnv = readEnvFile(NEXT_ENV_PATH);
  let strapiEnv = readEnvFile(STRAPI_ENV_PATH);

  const generatedPreviewSecret = !isPlaceholderValue(
    'PREVIEW_SECRET',
    nextEnv.parsed.PREVIEW_SECRET
  )
    ? nextEnv.parsed.PREVIEW_SECRET
    : !isPlaceholderValue('PREVIEW_SECRET', strapiEnv.parsed.PREVIEW_SECRET)
      ? strapiEnv.parsed.PREVIEW_SECRET
      : generateSecret();

  const needsPrompt =
    !nonInteractive &&
    process.stdin.isTTY &&
    process.stdout.isTTY &&
    (nextCreated ||
      strapiCreated ||
      !nextEnv.parsed.WEBSITE_URL ||
      !nextEnv.parsed.NEXT_PUBLIC_API_URL ||
      !strapiEnv.parsed.CLIENT_URL);

  let websiteUrl = nextEnv.parsed.WEBSITE_URL || 'http://localhost:3000';
  let apiUrl = nextEnv.parsed.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  let clientUrl = strapiEnv.parsed.CLIENT_URL || websiteUrl;

  if (needsPrompt) {
    console.log('Setup prompts');
    console.log('Press Enter to keep the suggested local defaults.');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      websiteUrl = await promptWithDefault(rl, 'Next website URL', websiteUrl);
      apiUrl = await promptWithDefault(rl, 'Strapi public API URL', apiUrl);
      clientUrl = await promptWithDefault(
        rl,
        'Strapi client URL',
        clientUrl || websiteUrl
      );
    } finally {
      rl.close();
    }
  }

  nextEnv.raw = upsertEnvValue(nextEnv.raw, 'WEBSITE_URL', websiteUrl);
  nextEnv.raw = upsertEnvValue(nextEnv.raw, 'NEXT_PUBLIC_API_URL', apiUrl);
  nextEnv.raw = upsertEnvValue(
    nextEnv.raw,
    'PREVIEW_SECRET',
    generatedPreviewSecret
  );

  strapiEnv.raw = upsertEnvValue(strapiEnv.raw, 'CLIENT_URL', clientUrl);
  strapiEnv.raw = upsertEnvValue(
    strapiEnv.raw,
    'PREVIEW_SECRET',
    generatedPreviewSecret
  );
  strapiEnv.raw = upsertEnvValue(strapiEnv.raw, 'DATABASE_CLIENT', 'sqlite');
  strapiEnv.raw = upsertEnvValue(
    strapiEnv.raw,
    'DATABASE_FILENAME',
    '.tmp/data.db'
  );

  for (const key of STRAPI_SECRET_KEYS) {
    const currentValue = strapiEnv.parsed[key];
    if (key === 'APP_KEYS') {
      const appKeys = isPlaceholderValue(key, currentValue)
        ? [
            generateSecret(),
            generateSecret(),
            generateSecret(),
            generateSecret(),
          ].join(',')
        : currentValue;
      strapiEnv.raw = upsertEnvValue(strapiEnv.raw, key, appKeys);
      continue;
    }

    const nextValue = isPlaceholderValue(key, currentValue)
      ? generateSecret()
      : currentValue;
    strapiEnv.raw = upsertEnvValue(strapiEnv.raw, key, nextValue);
  }

  fs.writeFileSync(NEXT_ENV_PATH, nextEnv.raw, 'utf8');
  fs.writeFileSync(STRAPI_ENV_PATH, strapiEnv.raw, 'utf8');

  console.log('Environment bootstrap complete.');
  console.log(`- next/.env: ${nextCreated ? 'created' : 'verified'}`);
  console.log(`- strapi/.env: ${strapiCreated ? 'created' : 'verified'}`);
  console.log(`- WEBSITE_URL=${websiteUrl}`);
  console.log(`- NEXT_PUBLIC_API_URL=${apiUrl}`);
  console.log(`- CLIENT_URL=${clientUrl}`);
}

main().catch((error) => {
  console.error('Environment bootstrap failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
