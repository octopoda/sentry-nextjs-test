# Next.js Sentry Seer Playground

This sample app demonstrates how the Sentry JavaScript SDK for Next.js captures a variety of
intentional failures. Use it to evaluate Seer by triggering the provided scenarios and reviewing the
generated guidance in Sentry.

## Quick Start

1. Duplicate `.env.example` to `.env.local` and add your Sentry DSN values.
2. Install dependencies with `npm install`.
3. Start the dev server using `npm run dev` and open `http://localhost:3000`.
4. Visit each scenario page and observe the events in Sentry.

> For a production-like run, build with `npm run build` and then launch `npm run start`.

## Environment Variables

- `NEXT_PUBLIC_SENTRY_DSN`: Required on the client; without this, no events are sent.
- `SENTRY_DSN`: Optional server-only override (defaults to the client DSN when omitted).
- `FEATURE_FLAG_SYNC_TOKEN`: Optional secret; leaving it empty triggers the server easy scenario.
- `WAREHOUSE_SNAPSHOT`: Provide a valid JSON payload to resolve the complex server failure.
- `THIRD_PARTY_API_URL`: Override to point at a different integration endpoint.
- `SENTRY_RELEASE_WEBHOOK`: Built-in webhook URL for release/deploy notifications.
- `SENTRY_DEPLOY_TOKEN`: Alternative API token for releases if you do not use the webhook.
- `SENTRY_ORG_SLUG` / `SENTRY_PROJECT_SLUG`: Required with `SENTRY_DEPLOY_TOKEN` to target the right project.
- `DEPLOYMENT_URL`, `DEPLOYMENT_NAME`, `RELEASE_VERSION`: Optional metadata used when notifying deploys.

## Scenarios

The landing page lists six scenarios covering client, server, cross-boundary, and third-party
integration failures. Refer to `SCENARIO_FIXES.md` for reproduction steps and remediation guidance
for each bug.

## Deployment Tracking

- Populate either `SENTRY_RELEASE_WEBHOOK` **or** the trio `SENTRY_DEPLOY_TOKEN`,
  `SENTRY_ORG_SLUG`, and `SENTRY_PROJECT_SLUG` in your `.env.local`.
- After a successful build or deployment, run `npm run deploy:notify` to register the release and
  deploy with Sentry. The script automatically picks up optional metadata (`RELEASE_VERSION`,
  `DEPLOYMENT_NAME`, etc.) and falls back to sensible defaults when omitted.
