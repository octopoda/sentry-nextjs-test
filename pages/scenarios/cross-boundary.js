import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function CrossBoundaryScenario() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const trigger = async () => {
      const cart = {
        items: [],
        shippingCountry: 'AQ',
      };

      // Validate inputs before POSTing to avoid unnecessary server errors
      if (!cart.items || cart.items.length === 0) {
        setError('Add at least one item before checkout.');
        return;
      }

      if (cart.shippingCountry === 'AQ') {
        setError('Shipping not supported for Antarctica. Please select a different region.');
        return;
      }

      const response = await fetch('/api/cross-boundary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: cart,
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
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <Link href="/">← Back to index</Link>
    </main>
  );
}
