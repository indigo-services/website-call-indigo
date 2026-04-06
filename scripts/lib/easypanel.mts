import * as fs from 'fs';
import * as path from 'path';

export interface LoadedEnvFiles {
  files: string[];
  values: Record<string, string>;
}

export interface EasypanelRuntimeConfig {
  cwd: string;
  loadedFiles: string[];
  values: Record<string, string>;
  apiToken: string;
  apiBaseUrl: string;
  projectName: string;
  nextServiceName: string;
  serviceName: string;
  serviceType: 'app' | 'compose';
  strapiContainerName: string;
  githubOwner: string;
  githubRepo: string;
  githubRef: string;
  nextPath: string;
  strapiPath: string;
  nextDomain: string;
  strapiDomain: string;
  adminPath: string;
  strapiHealthPath: string;
  websiteUrl: string;
  apiUrl: string;
  legacyApiKeyInUse: boolean;
  tlsVerificationDisabled: boolean;
}

export interface EasypanelDomain {
  host: string;
  https?: boolean;
  port?: number;
  path?: string;
  internalProtocol?: 'http' | 'https';
}

export interface EasypanelServiceSummary {
  projectName: string;
  name: string;
  type?: string;
  enabled?: boolean;
  domains?: EasypanelDomain[];
  source?: Record<string, unknown> | null;
  build?: Record<string, unknown> | null;
  env?: string | null;
  deploy?: Record<string, unknown> | null;
  ports?: Array<Record<string, unknown>>;
}

export interface EasypanelProjectInspection {
  project: {
    name: string;
    createdAt?: string;
  };
  services: EasypanelServiceSummary[];
}

export interface EasypanelComposeServiceInspection {
  projectName: string;
  name: string;
  type: 'compose';
  enabled?: boolean;
  env?: string;
  createDotEnv?: boolean;
  deploymentUrl?: string;
}

export interface EasypanelCreateServicePayload {
  projectName: string;
  serviceName: string;
  source?: Record<string, unknown>;
  build?: Record<string, unknown>;
  env?: string;
  deploy?: Record<string, unknown>;
  domains?: EasypanelDomain[];
  scripts?: Array<{ name: string; script: string }>;
}

const DEFAULT_API_URL = 'https://vps10.riolabs.ai/api';
const DEFAULT_SERVICE = 'indigo-studio';
const DEFAULT_STRAPI_CONTAINER = 'indigo-studio';
const DEFAULT_ADMIN_PATH = '/admin';

function stripWrappingQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, '');
}

export function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values: Record<string, string> = {};
  const content = fs.readFileSync(filePath, 'utf-8');

  content.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex <= 0) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    values[key] = stripWrappingQuotes(rawValue);
  });

  return values;
}

export function loadEnvFiles(
  cwd: string,
  relativePaths: string[]
): LoadedEnvFiles {
  const values: Record<string, string> = {};
  const files: string[] = [];

  relativePaths.forEach((relativePath) => {
    const absolutePath = path.join(cwd, relativePath);
    if (!fs.existsSync(absolutePath)) {
      return;
    }

    Object.assign(values, parseEnvFile(absolutePath));
    files.push(relativePath);
  });

  return { files, values };
}

function pickFirst(values: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = values[key];
    if (value && value.trim() && !isPlaceholderValue(value.trim())) {
      return value.trim();
    }
  }

  return '';
}

function parseRepositoryInfo(values: Record<string, string>): {
  owner: string;
  repo: string;
} {
  const directRepository = pickFirst(
    values,
    'EASYPANEL_GITHUB_REPOSITORY',
    'GITHUB_REPOSITORY'
  );

  if (directRepository.includes('/')) {
    const [owner, repo] = directRepository.split('/', 2);
    return { owner, repo };
  }

  return {
    owner: pickFirst(
      values,
      'EASYPANEL_GITHUB_OWNER',
      'GITHUB_OWNER',
      'GITHUB_ORG'
    ),
    repo: pickFirst(values, 'EASYPANEL_GITHUB_REPO') || directRepository,
  };
}

export function loadPortableConfig(
  cwd: string = process.cwd()
): EasypanelRuntimeConfig {
  const loaded = loadEnvFiles(cwd, [
    '.env.production',
    '.env.production.local',
    '.env.easypanel',
    '.env.easypanel.local',
    '.env.local',
    '.env',
  ]);
  const mergedValues: Record<string, string> = {
    ...loaded.values,
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    ),
  };

  const repository = parseRepositoryInfo(mergedValues);
  const legacyApiKeyInUse = Boolean(
    mergedValues['EASYPANEL-API'] && !mergedValues.EASYPANEL_API
  );

  const nextDomain = pickFirst(mergedValues, 'EASYPANEL_NEXT_DOMAIN');
  const strapiDomain = pickFirst(mergedValues, 'EASYPANEL_STRAPI_DOMAIN');
  const websiteUrl =
    pickFirst(mergedValues, 'WEBSITE_URL') ||
    (nextDomain ? `https://${nextDomain}` : '');
  const apiUrl =
    pickFirst(
      mergedValues,
      'STRAPI_URL',
      'NEXT_PUBLIC_API_URL',
      'URL',
      'PUBLIC_URL'
    ) || (strapiDomain ? `https://${strapiDomain}` : '');

  return {
    cwd,
    loadedFiles: loaded.files,
    values: mergedValues,
    apiToken: pickFirst(mergedValues, 'EASYPANEL_API', 'EASYPANEL-API'),
    apiBaseUrl: pickFirst(mergedValues, 'EASYPANEL_API_URL') || DEFAULT_API_URL,
    projectName:
      pickFirst(
        mergedValues,
        'EASYPANEL_PROJECT_NAME',
        'EASYPANEL_PROJECT_ID'
      ) || 'riostack',
    nextServiceName: pickFirst(mergedValues, 'EASYPANEL_NEXT_SERVICE'),
    serviceName:
      pickFirst(
        mergedValues,
        'EASYPANEL_SERVICE_NAME',
        'EASYPANEL_STRAPI_SERVICE'
      ) || DEFAULT_SERVICE,
    serviceType:
      (pickFirst(mergedValues, 'EASYPANEL_SERVICE_TYPE') as
        | 'app'
        | 'compose') || 'compose',
    strapiContainerName:
      pickFirst(mergedValues, 'EASYPANEL_STRAPI_CONTAINER') ||
      DEFAULT_STRAPI_CONTAINER,
    githubOwner: repository.owner,
    githubRepo: repository.repo,
    githubRef:
      pickFirst(mergedValues, 'EASYPANEL_GITHUB_REF', 'GITHUB_BRANCH') ||
      'main',
    nextPath: pickFirst(mergedValues, 'EASYPANEL_NEXT_PATH') || '/next',
    strapiPath: pickFirst(mergedValues, 'EASYPANEL_STRAPI_PATH') || '/strapi',
    nextDomain,
    strapiDomain,
    adminPath:
      pickFirst(mergedValues, 'ADMIN_PATH', 'EASYPANEL_ADMIN_PATH') ||
      DEFAULT_ADMIN_PATH,
    strapiHealthPath:
      pickFirst(mergedValues, 'EASYPANEL_STRAPI_HEALTH_PATH') || '/',
    websiteUrl,
    apiUrl,
    legacyApiKeyInUse,
    tlsVerificationDisabled: process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0',
  };
}

export function serializeEnv(values: Record<string, string>): string {
  return Object.entries(values)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && `${value}`.trim() !== ''
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

export function loadNextServiceEnv(cwd: string): Record<string, string> {
  return loadEnvFiles(cwd, ['.env.production', '.env.production.local']).values;
}

export function loadStrapiServiceEnv(cwd: string): Record<string, string> {
  const loaded = loadEnvFiles(cwd, [
    'strapi/easypanel.env',
    '.env.easypanel',
    '.env.easypanel.local',
  ]);

  return Object.fromEntries(
    Object.entries(loaded.values).filter(([key]) => {
      return !key.startsWith('EASYPANEL_') && key !== 'EASYPANEL-API';
    })
  );
}

export function maskSecret(value: string, visibleChars = 4): string {
  if (!value) {
    return '';
  }

  if (value.length <= visibleChars * 2) {
    return `${value.slice(0, 1)}***${value.slice(-1)}`;
  }

  return `${value.slice(0, visibleChars)}...${value.slice(-visibleChars)}`;
}

export function toAbsoluteUrl(host: string): string {
  if (!host) {
    return '';
  }

  return /^https?:\/\//i.test(host) ? host : `https://${host}`;
}

export function isLocalUrl(value: string): boolean {
  if (!value) {
    return false;
  }

  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

export function isPlaceholderValue(value: string): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith('replace-with-') ||
    normalized.includes('changemetorandomstring') ||
    normalized.includes('comma-separated-random-values') ||
    normalized.includes('your-') ||
    normalized.includes('.example.com') ||
    normalized === 'example' ||
    normalized.includes('<your-') ||
    normalized.includes('placeholder')
  );
}

function unwrapTrpcResponse<T>(payload: unknown): T {
  const typedPayload = payload as {
    error?: { message?: string };
    result?: { data?: { json?: T } };
  };

  if (typedPayload?.error?.message) {
    throw new Error(typedPayload.error.message);
  }

  return typedPayload?.result?.data?.json as T;
}

export class EasypanelClient {
  constructor(private readonly config: EasypanelRuntimeConfig) {}

  private buildTrpcUrl(operation: string, input?: unknown): string {
    const baseUrl = this.config.apiBaseUrl.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/trpc/${operation}`;

    if (input === undefined) {
      return endpoint;
    }

    const encodedInput = encodeURIComponent(JSON.stringify({ json: input }));
    return `${endpoint}?input=${encodedInput}`;
  }

  private async requestJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} for ${url}: ${bodyText.slice(0, 400)}`
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Expected JSON from ${url}, received ${contentType || 'unknown content type'}`
      );
    }

    return JSON.parse(bodyText) as T;
  }

  async getOpenApiSpec(): Promise<Record<string, unknown>> {
    const baseUrl = this.config.apiBaseUrl.replace(/\/+$/, '');
    return this.requestJson<Record<string, unknown>>(
      `${baseUrl}/openapi.json`,
      {
        method: 'GET',
      }
    );
  }

  async trpcGet<T>(operation: string, input?: unknown): Promise<T> {
    const payload = await this.requestJson<unknown>(
      this.buildTrpcUrl(operation, input),
      { method: 'GET' }
    );
    return unwrapTrpcResponse<T>(payload);
  }

  async trpcPost<T>(operation: string, input?: unknown): Promise<T> {
    const payload = await this.requestJson<unknown>(
      this.buildTrpcUrl(operation),
      {
        method: 'POST',
        body: JSON.stringify({ json: input || {} }),
      }
    );
    return unwrapTrpcResponse<T>(payload);
  }

  async getCurrentUser(): Promise<Record<string, unknown>> {
    return this.trpcGet<Record<string, unknown>>('auth.getUser');
  }

  async listProjects(): Promise<Array<{ name: string; createdAt?: string }>> {
    return this.trpcGet<Array<{ name: string; createdAt?: string }>>(
      'projects.listProjects'
    );
  }

  async listProjectsAndServices(): Promise<{
    projects: Array<{ name: string; createdAt?: string }>;
    services: EasypanelServiceSummary[];
  }> {
    return this.trpcGet<{
      projects: Array<{ name: string; createdAt?: string }>;
      services: EasypanelServiceSummary[];
    }>('projects.listProjectsAndServices');
  }

  async inspectProject(
    projectName: string
  ): Promise<EasypanelProjectInspection> {
    return this.trpcGet<EasypanelProjectInspection>('projects.inspectProject', {
      projectName,
    });
  }

  async inspectAppService(
    projectName: string,
    serviceName: string
  ): Promise<EasypanelServiceSummary> {
    return this.trpcGet<EasypanelServiceSummary>(
      'services.app.inspectService',
      {
        projectName,
        serviceName,
      }
    );
  }

  async getDailyDockerCleanup(): Promise<unknown> {
    return this.trpcGet<unknown>('settings.getDailyDockerCleanup');
  }

  async getComposeIssues(payload: {
    projectName: string;
    serviceName: string;
  }): Promise<{ issues: unknown[]; stderr?: string }> {
    return this.trpcGet<{ issues: unknown[]; stderr?: string }>(
      'services.compose.getIssues',
      payload
    );
  }

  async inspectComposeService(
    projectName: string,
    serviceName: string
  ): Promise<EasypanelComposeServiceInspection> {
    return this.trpcGet<EasypanelComposeServiceInspection>(
      'services.compose.inspectService',
      {
        projectName,
        serviceName,
      }
    );
  }

  async createAppService(
    payload: EasypanelCreateServicePayload
  ): Promise<EasypanelServiceSummary> {
    return this.trpcPost<EasypanelServiceSummary>(
      'services.app.createService',
      payload
    );
  }

  async updateAppSourceGithub(payload: {
    projectName: string;
    serviceName: string;
    owner: string;
    repo: string;
    ref: string;
    path: string;
  }): Promise<unknown> {
    return this.trpcPost('services.app.updateSourceGithub', payload);
  }

  async updateAppBuild(payload: {
    projectName: string;
    serviceName: string;
    build: Record<string, unknown>;
  }): Promise<unknown> {
    return this.trpcPost('services.app.updateBuild', payload);
  }

  async updateAppEnv(payload: {
    projectName: string;
    serviceName: string;
    env: string;
    createDotEnv?: boolean;
  }): Promise<unknown> {
    return this.trpcPost('services.app.updateEnv', payload);
  }

  async updateAppDeploy(payload: {
    projectName: string;
    serviceName: string;
    deploy: Record<string, unknown>;
  }): Promise<unknown> {
    return this.trpcPost('services.app.updateDeploy', payload);
  }

  async updateAppScripts(payload: {
    projectName: string;
    serviceName: string;
    scripts: Array<{ name: string; script: string }>;
  }): Promise<unknown> {
    return this.trpcPost('services.app.updateScripts', payload);
  }

  async deployAppService(payload: {
    projectName: string;
    serviceName: string;
    forceRebuild?: boolean;
  }): Promise<unknown> {
    return this.trpcPost('services.app.deployService', payload);
  }

  async updateComposeEnv(payload: {
    projectName: string;
    serviceName: string;
    env: string;
    createDotEnv?: boolean;
  }): Promise<unknown> {
    return this.trpcPost('services.compose.updateEnv', payload);
  }

  async updateComposeSourceInline(payload: {
    projectName: string;
    serviceName: string;
    content: string;
  }): Promise<unknown> {
    return this.trpcPost('services.compose.updateSourceInline', payload);
  }

  async createComposeService(payload: {
    projectName: string;
    serviceName: string;
    source?: Record<string, unknown>;
    env?: string;
    createDotEnv?: boolean;
    domains?: EasypanelDomain[];
  }): Promise<EasypanelComposeServiceInspection> {
    return this.trpcPost<EasypanelComposeServiceInspection>(
      'services.compose.createService',
      payload
    );
  }

  async deployComposeService(payload: {
    projectName: string;
    serviceName: string;
    forceRebuild?: boolean;
  }): Promise<unknown> {
    return this.trpcPost('services.compose.deployService', payload);
  }
}
