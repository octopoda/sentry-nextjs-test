import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

class WarehouseSnapshotError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'WarehouseSnapshotError';
    this.context = context;
  }
}

const loadSnapshotBlob = () => {
  return process.env.WAREHOUSE_SNAPSHOT || '{"warehouse":"phx"}';
};

const parseSnapshot = blob => {
  try {
    return JSON.parse(blob);
  } catch (error) {
    throw new WarehouseSnapshotError('Snapshot JSON is malformed', { blob, error });
  }
};

const normalizeItems = snapshot => {
  if (!snapshot.items) {
    throw new WarehouseSnapshotError('Snapshot missing items array', { snapshot });
  }
  return snapshot.items.flatMap(bucket => bucket.skus);
};

const calculateSkuAvailability = items => {
  return items.reduce((acc, item) => {
    if (!item.sku || typeof item.available !== 'number') {
      throw new WarehouseSnapshotError('SKU entry is malformed', { item });
    }
    acc[item.sku] = item.available;
    return acc;
  }, {});
};

export const getServerSideProps = Sentry.wrapGetServerSidePropsWithSentry(async () => {
  const blob = loadSnapshotBlob();
  const snapshot = parseSnapshot(blob);
  const items = normalizeItems(snapshot);
  const availability = calculateSkuAvailability(items);

  return {
    props: {
      availability,
    },
  };
});

export default function ServerComplexScenario() {
  return (
    <main>
      <h1>Server Error – Complex</h1>
      <p>
        This request rehydrates a cached warehouse snapshot. The mocked snapshot is missing an
        <code>items</code> collection, so the normalization logic throws deep into the call stack.
      </p>
      <p>
        Provide a valid <code>WAREHOUSE_SNAPSHOT</code> JSON payload or harden the pipeline to fix
        the issue.
      </p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
