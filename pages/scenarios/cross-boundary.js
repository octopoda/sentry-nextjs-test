import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function CrossBoundaryScenario() {
  useEffect(() => {
    const trigger = async () => {
      const response = await fetch('/api/cross-boundary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: {
            items: [],
            shippingCountry: 'AQ',
          },
        }),
      });

      if (!response.ok) {
        const problem = await response.json();
        const error = new Error('Checkout client failed to submit order', {
          cause: new Error(problem.detail ?? 'Unknown upstream error'),
        });

        Sentry.captureException(error, {
          tags: { scenario: 'cross-boundary', surface: 'client' },
          level: 'error',
          extra: {
            serverDetail: problem.detail,
            serverType: problem.type,
          },
        });

        throw error;
      }
    };

    void trigger();
  }, []);

  return (
    <main>
      <h1>Client Visible, Server Root Cause</h1>
      <p>
        The browser attempts to submit an order. The API rejects the payload due to missing line
        items, producing a server-side <code>OrderValidationError</code>. The client catches the HTTP
        failure and rethrows a new error with the server failure attached as <code>cause</code> so you
        can correlate both events in Sentry.
      </p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
