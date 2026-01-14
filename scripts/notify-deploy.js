#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenvPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
} else {
  require('dotenv').config();
}

const fetchImpl = globalThis.fetch;

if (typeof fetchImpl !== 'function') {
  throw new Error('Global fetch API not found. Please use Node.js 18 or newer.');
}

const fetch = fetchImpl;

const releaseVersion =
  process.env.RELEASE_VERSION || `nextjs-sentry-demo@${new Date().toISOString()}`;
const environment =
  process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_APP_ENV || 'development';
const projectSlug = process.env.SENTRY_PROJECT_SLUG;
const orgSlug = process.env.SENTRY_ORG_SLUG;
const webhookUrl = process.env.SENTRY_RELEASE_WEBHOOK;
const deployToken = process.env.SENTRY_DEPLOY_TOKEN;
const releaseUrl = process.env.DEPLOYMENT_URL;
const deployName = process.env.DEPLOYMENT_NAME || `Deploy ${new Date().toISOString()}`;
const commitSha =
  process.env.GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_SHA;

const releasePayload = {
  version: releaseVersion,
  environment,
  projects: projectSlug ? [projectSlug] : undefined,
  url: releaseUrl,
  commit: commitSha,
  deploy: {
    environment,
    name: deployName,
    url: releaseUrl,
  },
};

async function notifyViaWebhook(url) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(releasePayload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Sentry release webhook failed with status ${response.status}: ${text || response.statusText}`
    );
  }

  console.log('Sentry release webhook notified successfully.');
}

async function ensureRelease(apiBase, token, org, project) {
  const response = await fetch(`${apiBase}/organizations/${org}/releases/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: releaseVersion,
      projects: [project],
      url: releaseUrl,
      commit: commitSha,
    }),
  });

  if (response.status === 208 || response.status === 409) {
    console.log('Release already exists, continuing.');
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to create Sentry release (status ${response.status}): ${text || response.statusText}`
    );
  }

  console.log('Sentry release created.');
}

async function notifyViaApi(token, org, project) {
  const apiBase = process.env.SENTRY_API_BASE_URL || 'https://sentry.io/api/0';

  await ensureRelease(apiBase, token, org, project);

  const response = await fetch(
    `${apiBase}/organizations/${org}/releases/${encodeURIComponent(releaseVersion)}/deploys/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        environment,
        name: deployName,
        url: releaseUrl,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to register Sentry deploy (status ${response.status}): ${text || response.statusText}`
    );
  }

  console.log('Sentry deploy registered successfully.');
}

async function main() {
  if (webhookUrl) {
    await notifyViaWebhook(webhookUrl.trim());
    return;
  }

  if (deployToken && orgSlug && projectSlug) {
    await notifyViaApi(deployToken.trim(), orgSlug.trim(), projectSlug.trim());
    return;
  }

  console.error(
    'Missing deployment configuration. Provide either SENTRY_RELEASE_WEBHOOK or the trio of '\
` +
      'SENTRY_DEPLOY_TOKEN, SENTRY_ORG_SLUG, and SENTRY_PROJECT_SLUG.'
  );
  process.exit(1);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
