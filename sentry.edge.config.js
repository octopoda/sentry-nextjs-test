import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_EDGE_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
