#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { pathToFileURL } from 'url';

import {
  EasypanelClient,
  EasypanelCreateServicePayload,
  EasypanelRuntimeConfig,
  isLocalUrl,
  loadNextServiceEnv,
  loadPortableConfig,
  loadStrapiServiceEnv,
  maskSecret,
  serializeEnv,
  toAbsoluteUrl,
} from './lib/easypanel.mjs';

type CommandName =
  | 'doctor'
  | 'status'
  | 'health'
  | 'cron'
  | 'recommend'
  | 'bootstrap'
  | 'deploy'
  | 'bootstrap-deploy';

type HealthState = 'healthy' | 'warning' | 'unhealthy';

interface HealthCheckResult {
  label: string;
  url: string;
  status: HealthState;
  code?: number;
  responseTimeMs?: number;
  detail: string;
}

interface DoctorCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function colorize(message: string, color: keyof typeof colors): string {
  return `${colors[color]}${message}${colors.reset}`;
}

function info(message: string): void {
  console.log(colorize(message, 'blue'));
}

function success(message: string): void {
  console.log(colorize(`✓ ${message}`, 'green'));
}

function warning(message: string): void {
  console.log(colorize(`⚠ ${message}`, 'yellow'));
}

function failure(message: string): void {
  console.log(colorize(`✗ ${message}`, 'red'));
}

function header(title: string, subtitle?: string): void {
  console.log('');
  console.log(
    colorize(
      '╔════════════════════════════════════════════════════════╗',
      'cyan'
    )
  );
  console.log(colorize(`║ ${title.padEnd(54)}║`, 'cyan'));
  if (subtitle) {
    console.log(colorize(`║ ${subtitle.padEnd(54)}║`, 'cyan'));
  }
  console.log(
    colorize(
      '╚════════════════════════════════════════════════════════╝',
      'cyan'
    )
  );
  console.log('');
}

function parseArguments(argv: string[]): {
  command: CommandName;
  flags: Set<string>;
} {
  const [commandArg, ...rest] = argv;
  return {
    command: (commandArg || 'doctor') as CommandName,
    flags: new Set(rest.filter((entry) => entry.startsWith('--'))),
  };
}

function ensureRuntimeConfig(config: EasypanelRuntimeConfig): string[] {
  const missing: string[] = [];

  if (!config.apiToken) {
    missing.push('EASYPANEL_API');
  }

  if (!config.projectName) {
    missing.push('EASYPANEL_PROJECT_NAME');
  }

  if (!config.serviceName) {
    missing.push('EASYPANEL_SERVICE_NAME');
  }

  return missing;
}

function ensureBootstrapConfig(config: EasypanelRuntimeConfig): string[] {
  const missing = ensureRuntimeConfig(config);

  if (config.serviceType === 'app') {
    if (!config.githubOwner) {
      missing.push('EASYPANEL_GITHUB_OWNER or owner/repo GITHUB_REPOSITORY');
    }

    if (!config.githubRepo) {
      missing.push('EASYPANEL_GITHUB_REPO or owner/repo GITHUB_REPOSITORY');
    }
  }

  return missing;
}

function readFile(relativePath: string): string {
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absolutePath)) {
    return '';
  }

  return fs.readFileSync(absolutePath, 'utf-8');
}

function readJson(relativePath: string): Record<string, unknown> {
  const content = readFile(relativePath);
  return content ? (JSON.parse(content) as Record<string, unknown>) : {};
}

function buildNextEnvironment(config: EasypanelRuntimeConfig): string {
  const env = {
    ...loadNextServiceEnv(config.cwd),
  };

  if (config.nextDomain) {
    env.WEBSITE_URL = toAbsoluteUrl(config.nextDomain);
  }

  if (config.strapiDomain) {
    env.NEXT_PUBLIC_API_URL = toAbsoluteUrl(config.strapiDomain);
    env.STRAPI_URL = toAbsoluteUrl(config.strapiDomain);
  }

  env.NEXT_PUBLIC_ENVIRONMENT = env.NEXT_PUBLIC_ENVIRONMENT || 'production';
  env.ENVIRONMENT = env.ENVIRONMENT || 'production';

  return serializeEnv(env);
}

function buildStrapiEnvironment(config: EasypanelRuntimeConfig): string {
  const env = {
    ...loadStrapiServiceEnv(config.cwd),
  };

  if (config.nextDomain) {
    env.CLIENT_URL = toAbsoluteUrl(config.nextDomain);
  }

  if (config.strapiDomain) {
    env.URL = toAbsoluteUrl(config.strapiDomain);
    env.PUBLIC_URL = toAbsoluteUrl(config.strapiDomain);
  }

  env.ADMIN_PATH = env.ADMIN_PATH || config.adminPath;
  env.HOST = env.HOST || '0.0.0.0';
  env.PORT = env.PORT || '1337';
  env.NODE_ENV = env.NODE_ENV || 'production';

  return serializeEnv(env);
}

function buildAppPayload(
  config: EasypanelRuntimeConfig
): EasypanelCreateServicePayload {
  const strapiDomains = config.strapiDomain
    ? [
        {
          host: config.strapiDomain,
          https: true,
          path: '/',
          port: 1337,
          internalProtocol: 'http' as const,
        },
      ]
    : [];

  return {
    projectName: config.projectName,
    serviceName: config.serviceName,
    source: {
      type: 'github',
      owner: config.githubOwner,
      repo: config.githubRepo,
      ref: config.githubRef,
      path: config.strapiPath,
      autoDeploy: false,
    },
    build: {
      type: 'nixpacks',
      installCommand: 'yarn install',
      buildCommand: 'yarn build',
      startCommand: 'yarn start',
    },
    env: buildStrapiEnvironment(config),
    deploy: {
      replicas: 1,
      command: null,
      zeroDowntime: true,
    },
    domains: strapiDomains,
    scripts: [
      {
        name: 'health',
        script: `curl -fsS http://127.0.0.1:1337${config.strapiHealthPath}`,
      },
    ],
  };
}

function buildComposePayload(config: EasypanelRuntimeConfig): {
  projectName: string;
  serviceName: string;
  source: { type: 'inline'; content: string };
  env: string;
  createDotEnv: boolean;
  domains: Array<{
    host: string;
    https: boolean;
    path: string;
    port: number;
    internalProtocol: 'http';
    service: string;
  }>;
} {
  const composeContent = readFile('docker-compose.yml');
  const domains = config.strapiDomain
    ? [
        {
          host: config.strapiDomain,
          https: true,
          path: '/',
          port: 1337,
          internalProtocol: 'http' as const,
          service: config.strapiContainerName,
        },
      ]
    : [];

  return {
    projectName: config.projectName,
    serviceName: config.serviceName,
    source: {
      type: 'inline',
      content: composeContent,
    },
    env: buildStrapiEnvironment(config),
    createDotEnv: false,
    domains,
  };
}

async function checkUrl(
  label: string,
  url: string,
  expectedCodes = [200],
  timeoutMs = 8000
): Promise<HealthCheckResult> {
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'easypanel-ops/1.0',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    return {
      label,
      url,
      status: expectedCodes.includes(response.status)
        ? 'healthy'
        : response.status >= 500
          ? 'unhealthy'
          : 'warning',
      code: response.status,
      responseTimeMs: Date.now() - startedAt,
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      label,
      url,
      status:
        error instanceof Error && error.name === 'AbortError'
          ? 'warning'
          : 'unhealthy',
      detail: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function printHealthResults(results: HealthCheckResult[]): void {
  results.forEach((result) => {
    const statusColor =
      result.status === 'healthy'
        ? 'green'
        : result.status === 'warning'
          ? 'yellow'
          : 'red';
    const responseTime = result.responseTimeMs
      ? ` (${result.responseTimeMs}ms)`
      : '';
    console.log(
      `${colorize(result.status.toUpperCase().padEnd(9), statusColor)} ${result.label.padEnd(16)} ${result.detail}${responseTime}`
    );
    console.log(`          ${result.url}`);
  });
}

async function resolveHealthUrls(
  _client: EasypanelClient,
  config: EasypanelRuntimeConfig
): Promise<HealthCheckResult[]> {
  const checks: HealthCheckResult[] = [];

  if (config.websiteUrl && !isLocalUrl(config.websiteUrl)) {
    checks.push(
      await checkUrl(
        'Next.js health',
        `${config.websiteUrl.replace(/\/$/, '')}/api/health`
      )
    );
  } else if (config.websiteUrl) {
    checks.push({
      label: 'Next.js health',
      url: config.websiteUrl,
      status: 'warning',
      detail:
        'Skipped because WEBSITE_URL is local. Set it to the Vercel production URL for remote health checks.',
    });
  } else {
    checks.push({
      label: 'Next.js health',
      url: 'WEBSITE_URL',
      status: 'warning',
      detail:
        'Skipped because WEBSITE_URL is not configured. Set it to the Vercel production URL.',
    });
  }

  if (config.apiUrl) {
    checks.push(
      await checkUrl(
        'Strapi health',
        `${config.apiUrl.replace(/\/$/, '')}${config.strapiHealthPath}`,
        [200, 302]
      )
    );
    const configuredAdminUrl = `${config.apiUrl.replace(/\/$/, '')}${config.adminPath}`;
    const configuredAdminResult = await checkUrl(
      'Strapi admin',
      configuredAdminUrl,
      [200, 302]
    );

    if (
      configuredAdminResult.status !== 'healthy' &&
      config.adminPath !== '/admin'
    ) {
      const fallbackAdminResult = await checkUrl(
        'Strapi admin',
        `${config.apiUrl.replace(/\/$/, '')}/admin`,
        [200, 302]
      );

      if (fallbackAdminResult.status === 'healthy') {
        checks.push({
          ...fallbackAdminResult,
          status: 'warning',
          detail: `Configured admin path ${config.adminPath} did not respond, but /admin is healthy`,
        });
      } else {
        checks.push(configuredAdminResult);
      }
    } else {
      checks.push(configuredAdminResult);
    }
  } else {
    checks.push({
      label: 'Strapi health',
      url: 'STRAPI_URL',
      status: 'warning',
      detail:
        'Skipped because STRAPI_URL, NEXT_PUBLIC_API_URL, URL, and PUBLIC_URL are not configured.',
    });
  }

  return checks;
}

function buildRecommendations(config: EasypanelRuntimeConfig): string[] {
  const nextPackage = readJson('next/package.json') as {
    version?: string;
    dependencies?: Record<string, string>;
  };
  const nextVersion = `${nextPackage.dependencies?.next || nextPackage.version || ''}`;
  const nextInstalled = readJson('next/node_modules/next/package.json') as {
    engines?: { node?: string };
  };
  const nextEngine = `${nextInstalled.engines?.node || '>=20.9.0'}`;
  const strapiPackage = readJson('strapi/package.json') as {
    engines?: { node?: string };
  };
  const strapiEngine = `${strapiPackage.engines?.node || '<=22.x.x'}`;
  const serverConfig = readFile('strapi/config/server.ts');
  const adminConfig = readFile('strapi/config/admin.ts');
  const strapiEnv = loadStrapiServiceEnv(config.cwd);
  const recommendations: string[] = [];

  recommendations.push(
    `Use Node 22 on Easypanel. Next ${nextVersion || 'current'} requires ${nextEngine}, and Strapi declares ${strapiEngine}.`
  );

  if (!serverConfig.includes('proxy')) {
    recommendations.push(
      'Add Strapi reverse-proxy awareness in strapi/config/server.ts with a proxy/url configuration before relying on production absolute URLs.'
    );
  }

  if (
    strapiEnv.ADMIN_PATH &&
    !adminConfig.includes('ADMIN_PATH') &&
    !adminConfig.includes("env('ADMIN_PATH'")
  ) {
    recommendations.push(
      `ADMIN_PATH is set to ${strapiEnv.ADMIN_PATH}, but strapi/config/admin.ts does not currently read it. Keep /admin or wire ADMIN_PATH explicitly before assuming ${strapiEnv.ADMIN_PATH}.`
    );
  }

  if ((strapiEnv.DATABASE_CLIENT || '').toLowerCase() === 'sqlite') {
    recommendations.push(
      'Current Easypanel Strapi runtime uses SQLite. This is fine for single-instance deployments, but Postgres should be the next upgrade if content volume, concurrency, or backup guarantees matter.'
    );
  }

  if (!config.websiteUrl || !config.apiUrl) {
    recommendations.push(
      'Set WEBSITE_URL for the Vercel frontend and STRAPI_URL or NEXT_PUBLIC_API_URL for the Easypanel Strapi service so health checks resolve the right public URLs.'
    );
  }

  return recommendations;
}

async function runDoctor(
  client: EasypanelClient,
  config: EasypanelRuntimeConfig,
  jsonOutput: boolean
): Promise<number> {
  header('Easypanel Doctor', 'Config, auth, project, and API checks');

  const checks: DoctorCheck[] = [];
  const missingConfig = ensureRuntimeConfig(config);

  checks.push({
    name: 'Loaded env files',
    status: config.loadedFiles.length ? 'pass' : 'warn',
    detail: config.loadedFiles.length
      ? config.loadedFiles.join(', ')
      : 'No env files detected; relying only on process env',
  });

  checks.push({
    name: 'API token',
    status: config.apiToken ? 'pass' : 'fail',
    detail: config.apiToken
      ? `Present as ${config.legacyApiKeyInUse ? 'legacy EASYPANEL-API' : 'EASYPANEL_API'} (${maskSecret(config.apiToken)})`
      : 'Missing EASYPANEL_API',
  });

  checks.push({
    name: 'Project name',
    status: config.projectName ? 'pass' : 'fail',
    detail: config.projectName || 'Missing EASYPANEL_PROJECT_NAME',
  });

  checks.push({
    name: 'Service target',
    status: config.serviceName ? 'pass' : 'fail',
    detail: `${config.projectName}/${config.serviceName} (${config.serviceType})`,
  });

  checks.push({
    name: 'Frontend URL',
    status: config.websiteUrl
      ? isLocalUrl(config.websiteUrl)
        ? 'warn'
        : 'pass'
      : 'warn',
    detail: config.websiteUrl
      ? isLocalUrl(config.websiteUrl)
        ? `${config.websiteUrl} is a local placeholder. Set WEBSITE_URL to the Vercel production URL for remote health checks.`
        : config.websiteUrl
      : 'WEBSITE_URL not set. Frontend health checks will be skipped.',
  });

  checks.push({
    name: 'Strapi URL',
    status: config.apiUrl
      ? isLocalUrl(config.apiUrl)
        ? 'warn'
        : 'pass'
      : 'warn',
    detail: config.apiUrl
      ? isLocalUrl(config.apiUrl)
        ? `${config.apiUrl} is local. Set STRAPI_URL or URL to the Easypanel public URL for remote checks.`
        : config.apiUrl
      : 'STRAPI_URL or URL not set. Strapi remote health checks will be skipped.',
  });

  checks.push({
    name: 'GitHub source',
    status: config.githubOwner && config.githubRepo ? 'pass' : 'warn',
    detail:
      config.githubOwner && config.githubRepo
        ? `${config.githubOwner}/${config.githubRepo}@${config.githubRef}`
        : 'Bootstrap for app services needs EASYPANEL_GITHUB_OWNER and EASYPANEL_GITHUB_REPO. Compose sync can work without them.',
  });

  if (config.legacyApiKeyInUse) {
    checks.push({
      name: 'Legacy env compatibility',
      status: 'warn',
      detail:
        'Legacy EASYPANEL-API is still accepted, but EASYPANEL_API is now the canonical key.',
    });
  }

  if (config.tlsVerificationDisabled) {
    checks.push({
      name: 'TLS verification',
      status: 'warn',
      detail:
        'NODE_TLS_REJECT_UNAUTHORIZED=0 is active in this shell. Remove it unless you are intentionally bypassing certificate verification.',
    });
  }

  if (missingConfig.length === 0) {
    try {
      const spec = await client.getOpenApiSpec();
      checks.push({
        name: 'OpenAPI discovery',
        status: 'pass',
        detail: `${Object.keys((spec.paths || {}) as Record<string, unknown>).length} API paths discovered`,
      });
    } catch (error) {
      checks.push({
        name: 'OpenAPI discovery',
        status: 'fail',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    try {
      const user = await client.getCurrentUser();
      checks.push({
        name: 'API auth',
        status: 'pass',
        detail: `Authenticated as ${String(user.email || 'unknown user')}`,
      });
    } catch (error) {
      checks.push({
        name: 'API auth',
        status: 'fail',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    try {
      const projects = await client.listProjects();
      const projectExists = projects.some(
        (project) => project.name === config.projectName
      );
      checks.push({
        name: 'Project lookup',
        status: projectExists ? 'pass' : 'fail',
        detail: projectExists
          ? `Project ${config.projectName} exists`
          : `Project ${config.projectName} not found. Available projects: ${projects.map((project) => project.name).join(', ')}`,
      });

      if (projectExists) {
        const inspectedProject = await client.inspectProject(
          config.projectName
        );
        const projectService = inspectedProject.services.find(
          (service) => service.name === config.serviceName
        );

        checks.push({
          name: 'Target service',
          status: projectService ? 'pass' : 'warn',
          detail: projectService
            ? `Found ${config.serviceName} as ${projectService.type || config.serviceType}`
            : `Missing ${config.serviceName} in project ${config.projectName}. Run yarn easypanel:bootstrap when ready.`,
        });

        if (projectService && projectService.type === 'compose') {
          const composeIssues = await client.getComposeIssues({
            projectName: config.projectName,
            serviceName: config.serviceName,
          });
          const issueCount = Array.isArray(composeIssues.issues)
            ? composeIssues.issues.length
            : 0;

          checks.push({
            name: 'Compose issues',
            status: issueCount > 0 ? 'warn' : 'pass',
            detail:
              issueCount > 0
                ? `${issueCount} compose issue(s) reported`
                : 'No compose issues reported by Easypanel',
          });
        }
      }
    } catch (error) {
      checks.push({
        name: 'Project lookup',
        status: 'fail',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    try {
      await client.getDailyDockerCleanup();
      checks.push({
        name: 'Settings access',
        status: 'pass',
        detail: 'Panel settings endpoint is reachable',
      });
    } catch (error) {
      checks.push({
        name: 'Settings access',
        status: 'warn',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    checks.push({
      name: 'Critical config',
      status: 'fail',
      detail: `Missing: ${missingConfig.join(', ')}`,
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ config, checks }, null, 2));
  } else {
    checks.forEach((check) => {
      const marker =
        check.status === 'pass'
          ? colorize('PASS ', 'green')
          : check.status === 'warn'
            ? colorize('WARN ', 'yellow')
            : colorize('FAIL ', 'red');
      console.log(`${marker}${check.name.padEnd(24)} ${check.detail}`);
    });
  }

  return checks.some((check) => check.status === 'fail') ? 1 : 0;
}

async function runStatus(
  client: EasypanelClient,
  config: EasypanelRuntimeConfig,
  jsonOutput: boolean
): Promise<number> {
  header('Easypanel Status', 'Projects and service summary');

  const payload = await client.listProjectsAndServices();
  const filteredServices = payload.services.filter(
    (service) => service.projectName === config.projectName
  );

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          projectName: config.projectName,
          projects: payload.projects,
          services: filteredServices,
        },
        null,
        2
      )
    );
    return 0;
  }

  success(
    `Loaded ${payload.projects.length} projects and ${payload.services.length} services from ${config.apiBaseUrl}`
  );
  info(`Target project: ${config.projectName}`);

  if (!filteredServices.length) {
    warning(`No services found for project ${config.projectName}`);
    return 1;
  }

  const targetService = filteredServices.find(
    (service) => service.name === config.serviceName
  );

  if (!targetService) {
    warning(
      `Configured target service not found: ${config.serviceName}. Run yarn easypanel:bootstrap when you want to create it.`
    );
  } else {
    success(
      `Target service ${config.serviceName} detected as ${targetService.type || config.serviceType}`
    );
  }

  filteredServices.forEach((service) => {
    const state = service.enabled ? 'enabled' : 'disabled';
    const domains =
      service.domains
        ?.map((domain) => domain.host)
        .filter(Boolean)
        .join(', ') || 'no public domains';
    console.log(
      `${service.name.padEnd(24)} ${String(service.type || 'unknown').padEnd(10)} ${state.padEnd(8)} ${domains}`
    );
  });

  return 0;
}

async function runHealth(
  client: EasypanelClient,
  config: EasypanelRuntimeConfig,
  jsonOutput: boolean
): Promise<number> {
  header('Easypanel Health', 'Public URLs and app readiness');

  const results = await resolveHealthUrls(client, config);

  if (jsonOutput) {
    console.log(
      JSON.stringify({ projectName: config.projectName, results }, null, 2)
    );
  } else {
    printHealthResults(results);
  }

  return results.some((result) => result.status === 'unhealthy') ? 1 : 0;
}

function runCron(config: EasypanelRuntimeConfig): number {
  header('Easypanel Cron', 'Recommended portable cron entries');

  const workspace = config.cwd.replace(/\\/g, '/');
  const logDir = `${workspace}/.codex/tmp`;

  console.log('# Linux crontab suggestions');
  console.log(
    `*/10 * * * * cd ${workspace} && yarn easypanel:health >> ${logDir}/easypanel-health.log 2>&1`
  );
  console.log(
    `0 * * * * cd ${workspace} && yarn easypanel:status --json > ${logDir}/easypanel-status.json 2>> ${logDir}/easypanel-status.err.log`
  );
  console.log(
    `15 3 * * * cd ${workspace} && yarn easypanel:doctor >> ${logDir}/easypanel-doctor.log 2>&1`
  );
  console.log('');
  console.log('# Weekly recommendation snapshot');
  console.log(
    `30 3 * * 1 cd ${workspace} && yarn easypanel:recommend >> ${logDir}/easypanel-recommend.log 2>&1`
  );

  return 0;
}

function runRecommend(config: EasypanelRuntimeConfig): number {
  header('Easypanel Recommend', 'Runtime and Strapi recommendations');
  buildRecommendations(config).forEach((entry, index) => {
    console.log(`${index + 1}. ${entry}`);
  });
  return 0;
}

function runValidationAndBuild(): void {
  info('Running production validation');
  execSync('yarn validate:prod', { stdio: 'inherit' });

  info('Building Next.js');
  execSync('cd next && yarn build', { stdio: 'inherit' });

  info('Building Strapi');
  execSync('cd strapi && yarn build', { stdio: 'inherit' });
}

async function syncService(
  client: EasypanelClient,
  payload: EasypanelCreateServicePayload
): Promise<{ serviceName: string; created: boolean }> {
  let exists = true;

  try {
    await client.inspectAppService(payload.projectName, payload.serviceName);
  } catch {
    exists = false;
  }

  if (!exists) {
    await client.createAppService(payload);
    return { serviceName: payload.serviceName, created: true };
  }

  await client.updateAppSourceGithub({
    projectName: payload.projectName,
    serviceName: payload.serviceName,
    owner: payload.source?.owner as string,
    repo: payload.source?.repo as string,
    ref: payload.source?.ref as string,
    path: payload.source?.path as string,
  });
  await client.updateAppBuild({
    projectName: payload.projectName,
    serviceName: payload.serviceName,
    build: payload.build || {},
  });
  await client.updateAppEnv({
    projectName: payload.projectName,
    serviceName: payload.serviceName,
    env: payload.env || '',
    createDotEnv: true,
  });
  await client.updateAppDeploy({
    projectName: payload.projectName,
    serviceName: payload.serviceName,
    deploy: payload.deploy || {},
  });

  if (payload.scripts?.length) {
    await client.updateAppScripts({
      projectName: payload.projectName,
      serviceName: payload.serviceName,
      scripts: payload.scripts,
    });
  }

  return { serviceName: payload.serviceName, created: false };
}

async function syncComposeService(
  client: EasypanelClient,
  config: EasypanelRuntimeConfig
): Promise<{ serviceName: string; created: boolean }> {
  const payload = buildComposePayload(config);
  let exists = true;

  try {
    await client.inspectComposeService(
      payload.projectName,
      payload.serviceName
    );
  } catch {
    exists = false;
  }

  if (!exists) {
    await client.createComposeService(payload);
    return { serviceName: payload.serviceName, created: true };
  }

  await client.updateComposeSourceInline({
    projectName: payload.projectName,
    serviceName: payload.serviceName,
    content: payload.source.content,
  });
  await client.updateComposeEnv({
    projectName: payload.projectName,
    serviceName: payload.serviceName,
    env: payload.env,
    createDotEnv: payload.createDotEnv,
  });

  return { serviceName: payload.serviceName, created: false };
}

async function runBootstrap(
  client: EasypanelClient,
  config: EasypanelRuntimeConfig,
  deployAfterSync: boolean
): Promise<number> {
  header(
    deployAfterSync ? 'Easypanel Bootstrap + Deploy' : 'Easypanel Bootstrap',
    'Create or update the target Easypanel Strapi service'
  );

  runValidationAndBuild();

  const synced =
    config.serviceType === 'compose'
      ? await syncComposeService(client, config)
      : await syncService(client, buildAppPayload(config));

  if (synced.created) {
    success(`Created ${synced.serviceName}`);
  } else {
    success(`Updated ${synced.serviceName}`);
  }

  if (!deployAfterSync) {
    return 0;
  }

  await runDeploy(client, config);

  return 0;
}

async function runDeploy(
  client: EasypanelClient,
  config: EasypanelRuntimeConfig
): Promise<number> {
  header('Easypanel Deploy', 'Trigger deployment for the target service');

  if (config.serviceType === 'compose') {
    await client.deployComposeService({
      projectName: config.projectName,
      serviceName: config.serviceName,
      forceRebuild: true,
    });
  } else {
    await client.deployAppService({
      projectName: config.projectName,
      serviceName: config.serviceName,
      forceRebuild: true,
    });
  }
  success(`Deployment triggered for ${config.serviceName}`);

  return 0;
}

export async function runEasypanelOps(
  argv = process.argv.slice(2)
): Promise<number> {
  const { command, flags } = parseArguments(argv);
  const config = loadPortableConfig();
  const jsonOutput = flags.has('--json');

  if (command === 'bootstrap' || command === 'bootstrap-deploy') {
    const missingConfig = ensureBootstrapConfig(config);
    if (missingConfig.length) {
      header('Easypanel Config Error');
      missingConfig.forEach((entry) => failure(`Missing ${entry}`));
      return 1;
    }
  } else if (command !== 'recommend' && command !== 'cron') {
    const missingConfig = ensureRuntimeConfig(config);
    if (missingConfig.length) {
      header('Easypanel Config Error');
      missingConfig.forEach((entry) => failure(`Missing ${entry}`));
      return 1;
    }
  }

  const client = new EasypanelClient(config);

  switch (command) {
    case 'doctor':
      return runDoctor(client, config, jsonOutput);
    case 'status':
      return runStatus(client, config, jsonOutput);
    case 'health':
      return runHealth(client, config, jsonOutput);
    case 'cron':
      return runCron(config);
    case 'recommend':
      return runRecommend(config);
    case 'bootstrap':
      return runBootstrap(client, config, false);
    case 'deploy':
      return runDeploy(client, config);
    case 'bootstrap-deploy':
      return runBootstrap(client, config, true);
    default:
      failure(`Unknown command: ${command}`);
      return 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runEasypanelOps()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((error) => {
      failure(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
