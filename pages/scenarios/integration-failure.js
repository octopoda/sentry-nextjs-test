import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function IntegrationFailureScenario() {
  useEffect(() => {
    const trigger = async () => {
      const response = await fetch('/api/third-party-failure');

      if (!response.ok) {
        const problem = await response.json();
        const error = new Error('Marketing integration failed to sync audience');

        Sentry.captureException(error, {
          tags: { scenario: 'integration-failure', surface: 'client' },
          level: 'error',
          extra: problem,
        });

        throw error;
      }
    };

    void trigger();
  }, []);

  return (
    <main>
      <h1>3rd Party Integration Failure</h1>
      <p>
        The server proxies a request to <code>THIRD_PARTY_API_URL</code>. The endpoint is configured
        to return a failure, bubbling a wrapped <code>IntegrationError</code> to Sentry while the
        client records its own failure context.
      </p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
