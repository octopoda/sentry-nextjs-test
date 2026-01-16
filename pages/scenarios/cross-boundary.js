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
            items: [
              { id: '001', name: 'Product A', quantity: 1, price: 29.99 },
            ],
            shippingCountry: 'US',
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
      <h1>Successful Order Submission</h1>
      <p>
        The browser submits a valid order with line items to a supported shipping country.
        The API validates and accepts the order successfully.
      </p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
