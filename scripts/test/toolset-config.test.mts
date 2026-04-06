import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import assert from 'node:assert/strict';

import { loadPortableConfig } from '../lib/easypanel.mjs';
import {
  readToolsetMeta,
  renderToolsetFile,
  runToolsetInit,
} from '../lib/toolset.mjs';

type TestCase = {
  name: string;
  fn: () => void;
};

function createTempWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'toolset-config-'));
}

const cases: TestCase[] = [
  {
    name: 'loadPortableConfig ignores placeholder values from generated local env files',
    fn: () => {
      const cwd = createTempWorkspace();

      fs.writeFileSync(
        path.join(cwd, '.env.easypanel.local'),
        [
          'EASYPANEL_API=replace-with-api-token',
          'EASYPANEL_PROJECT_NAME=replace-with-project-name',
          'URL=https://your-strapi-domain.example.com',
        ].join('\n')
      );
      fs.writeFileSync(
        path.join(cwd, '.env.production.local'),
        [
          'WEBSITE_URL=https://your-vercel-domain.example.com',
          'STRAPI_URL=https://your-strapi-domain.example.com',
        ].join('\n')
      );
      fs.writeFileSync(
        path.join(cwd, '.env'),
        [
          'EASYPANEL_API=real-api-token',
          'EASYPANEL_PROJECT_NAME=riostack',
          'EASYPANEL_SERVICE_NAME=indigo-studio',
        ].join('\n')
      );

      const config = loadPortableConfig(cwd);

      assert.equal(config.apiToken, 'real-api-token');
      assert.equal(config.projectName, 'riostack');
      assert.equal(config.websiteUrl, '');
      assert.equal(config.apiUrl, '');
    },
  },
  {
    name: 'renderToolsetFile includes provider-aware metadata comments',
    fn: () => {
      const meta = readToolsetMeta(process.cwd());
      const rendered = renderToolsetFile(meta, '.env.local');

      assert.match(rendered, /provider=openai/);
      assert.match(rendered, /provider=zai/);
      assert.match(rendered, /scope=global/);
      assert.match(
        rendered,
        /Optional user-level token for OpenAI-powered tooling/
      );
      assert.match(rendered, /Windows user-level env vars/);
      assert.match(rendered, /Z.AI OpenAI-compatible base URL/);
    },
  },
  {
    name: 'loadPortableConfig honors process.env for user-level provider tokens',
    fn: () => {
      const cwd = createTempWorkspace();
      const originalOpenai = process.env.OPENAI_API_KEY;
      const originalZai = process.env.ZAI_API_KEY;
      const originalRepo = process.env.GITHUB_REPOSITORY;

      process.env.OPENAI_API_KEY = 'process-openai-token';
      process.env.ZAI_API_KEY = 'process-zai-token';
      process.env.GITHUB_REPOSITORY = 'process-owner/process-repo';

      try {
        const config = loadPortableConfig(cwd);

        assert.equal(config.values.OPENAI_API_KEY, 'process-openai-token');
        assert.equal(config.values.ZAI_API_KEY, 'process-zai-token');
        assert.equal(
          config.values.GITHUB_REPOSITORY,
          'process-owner/process-repo'
        );
        assert.equal(config.apiToken, '');
        assert.equal(config.githubOwner, 'process-owner');
        assert.equal(config.githubRepo, 'process-repo');
      } finally {
        restoreEnv('OPENAI_API_KEY', originalOpenai);
        restoreEnv('ZAI_API_KEY', originalZai);
        restoreEnv('GITHUB_REPOSITORY', originalRepo);
      }
    },
  },
  {
    name: 'runToolsetInit creates all declared local env files',
    fn: () => {
      const cwd = createTempWorkspace();
      fs.mkdirSync(path.join(cwd, 'config'), { recursive: true });
      fs.copyFileSync(
        path.join(process.cwd(), 'config/toolset-env-meta.json'),
        path.join(cwd, 'config/toolset-env-meta.json')
      );

      runToolsetInit(cwd);

      assert.equal(fs.existsSync(path.join(cwd, '.env.local')), true);
      assert.equal(fs.existsSync(path.join(cwd, '.env.easypanel.local')), true);
      assert.equal(
        fs.existsSync(path.join(cwd, '.env.production.local')),
        true
      );
    },
  },
];

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

let failures = 0;

for (const testCase of cases) {
  try {
    testCase.fn();
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error instanceof Error ? error.stack : String(error));
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`PASS ${cases.length} toolset checks`);
}
