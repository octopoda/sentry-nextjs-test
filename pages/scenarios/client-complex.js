import { useEffect } from 'react';
import Link from 'next/link';

class AnalyticsConsistencyError extends Error {
  constructor(message, payload) {
    super(message);
    this.name = 'AnalyticsConsistencyError';
    this.payload = payload;
  }
}

const loadRawEvent = () => {
  const cached = sessionStorage.getItem('analytics:event');
  if (!cached) {
    const seed = JSON.stringify({
      metrics: null,
      meta: { source: 'checkout-funnel' },
    });
    sessionStorage.setItem('analytics:event', seed);
    return seed;
  }
  return cached;
};

const decodeEvent = raw => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new AnalyticsConsistencyError('Unable to decode analytics payload', { raw, error });
  }
};

const hydrateEvent = event => {
  if (!event || typeof event !== 'object') {
    throw new AnalyticsConsistencyError('Event payload missing after hydration', { event });
  }

  return {
    ...event,
    metrics: event.metrics ?? undefined,
  };
};

const buildDashboardSummary = event => {
  const totals = event.metrics.map(metric => metric.value).reduce((sum, value) => sum + value, 0);
  return {
    totals,
    average: totals / event.metrics.length,
  };
};

export default function ClientComplexScenario() {
  useEffect(() => {
    const raw = loadRawEvent();
    const event = decodeEvent(raw);
    const hydrated = hydrateEvent(event);
    // This will explode because metrics is null → undefined, so calling .map throws.
    buildDashboardSummary(hydrated);
  }, []);

  return (
    <main>
      <h1>Client Error – Complex</h1>
      <p>
        This reproduces a multi-step analytics pipeline failure. A cached event is hydrated without
        validating the <code>metrics</code> array, leading to a deep stack trace when downstream code
        attempts to iterate over <code>undefined</code>.
      </p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
