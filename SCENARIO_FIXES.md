# Scenario Fix Guide

Each section below outlines how to reproduce the failure, why it happens, and the recommended fix.

## Client Error – Easy (`pages/scenarios/client-easy.js`)

- **Trigger**: Navigate to `/scenarios/client-easy`.
- **Root Cause**: The hydration effect dereferences `profile.email` without checking for a value,
  causing `TypeError: Cannot read properties of null`.
- **Fix Strategy**: Guard against `null` before normalizing the profile. A minimal fix would be:

  ```js
  if (!profile) {
    return;
  }
  console.log('Normalizing profile email', profile.email.trim().toLowerCase());
  ```

- **Prevention**: Introduce runtime schema validation when ingesting session data.

## Client Error – Complex (`pages/scenarios/client-complex.js`)

- **Trigger**: Navigate to `/scenarios/client-complex` (the effect runs immediately).
- **Root Cause**: The analytics pipeline hydrates an event without verifying `metrics`. The
  downstream normalizer calls `.map` on `undefined`, yielding a deep stack trace chain of
  `AnalyticsConsistencyError`.
- **Fix Strategy**: Validate and default the metrics array before processing:

  ```js
  const hydrateEvent = event => ({
    ...event,
    metrics: Array.isArray(event.metrics) ? event.metrics : [],
  });
  ```

- **Prevention**: Add type-safe parsing (e.g. zod) and unit tests for the analytics transformer.

## Server Error – Easy (`pages/scenarios/server-simple.js`)

- **Trigger**: Navigate to `/scenarios/server-simple`.
- **Root Cause**: `getServerSideProps` requires `FEATURE_FLAG_SYNC_TOKEN`, which is unset. The
  handler throws before rendering.
- **Fix Strategy**: Provide the secret or fail gracefully. For example:

  ```js
  if (!process.env.FEATURE_FLAG_SYNC_TOKEN) {
    return { notFound: true };
  }
  ```

- **Prevention**: Validate required environment variables during boot and use typed config helpers.

## Server Error – Complex (`pages/scenarios/server-complex.js`)

- **Trigger**: Navigate to `/scenarios/server-complex`.
- **Root Cause**: The cached warehouse snapshot lacks an `items` array. The normalization routine
  throws a `WarehouseSnapshotError` while attempting `snapshot.items.flatMap`.
- **Fix Strategy**: Harden the snapshot pipeline by enforcing schema and fallbacks:

  ```js
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  if (items.length === 0) {
    throw new WarehouseSnapshotError('Snapshot missing inventory detail');
  }
  ```

- **Prevention**: Replace the ad-hoc cache with a typed store and add integration tests that load
  representative snapshots.

## Client Visible, Server Root Cause (`pages/scenarios/cross-boundary.js` + `/api/cross-boundary`)

- **Trigger**: Navigate to `/scenarios/cross-boundary`; the page POSTs immediately.
- **Root Cause**: The API rejects the order (empty items, unsupported region) and responds with a
  422. The client wraps the server failure and rethrows, surfacing a client error that ultimately
  stems from `OrderValidationError`.
- **Fix Strategy**: Validate inputs before POSTing and render inline errors instead of rethrowing:

  ```js
  if (cart.items.length === 0) {
    setError('Add at least one item before checkout.');
    return;
  }
  ```

- **Prevention**: Share validation schemas between client and server to avoid divergence.

## 3rd Party Integration Failure (`pages/scenarios/integration-failure.js` + `/api/third-party-failure`)

- **Trigger**: Navigate to `/scenarios/integration-failure`.
- **Root Cause**: The backend proxy calls `THIRD_PARTY_API_URL` which is deliberately configured to
  return a 5xx. The server wraps the failure in an `IntegrationError`, while the client reports that
  the marketing sync failed.
- **Fix Strategy**: Implement retries and granular error handling around the third-party call:

  ```js
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const response = await fetch(endpoint);
    if (response.ok) {
      return response;
    }
    await delay(2 ** attempt * 100);
  }
  throw new IntegrationError('Audience sync timed out after retries');
  ```

- **Prevention**: Monitor third-party SLAs, add circuit breakers, and expose resilient fallbacks to
  the client.
