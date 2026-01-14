import * as Sentry from '@sentry/nextjs';

class IntegrationError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'IntegrationError';
    this.context = context;
  }
}

async function callThirdParty(endpoint) {
  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'nextjs-sentry-demo/1.0',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new IntegrationError('External API returned a non-success status', {
      status: response.status,
      body,
    });
  }

  return response;
}

export default Sentry.wrapApiHandlerWithSentry(async function thirdPartyFailureHandler(_req, res) {
  const endpoint = process.env.THIRD_PARTY_API_URL || 'https://httpstat.us/503';

  try {
    await callThirdParty(endpoint);
    res.status(200).json({ status: 'unexpected-success' });
  } catch (error) {
    const integrationError =
      error instanceof IntegrationError
        ? error
        : new IntegrationError('Third-party request failed unexpectedly', { cause: error });

    Sentry.captureException(integrationError, {
      tags: { scenario: 'integration-failure', surface: 'server' },
      contexts: {
        integration: {
          endpoint,
        },
      },
    });

    res.status(502).json({
      detail: integrationError.message,
      type: integrationError.name,
    });
  }
});
