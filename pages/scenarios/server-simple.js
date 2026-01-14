import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export const getServerSideProps = Sentry.wrapGetServerSidePropsWithSentry(async () => {
  if (!process.env.FEATURE_FLAG_SYNC_TOKEN) {
    throw new Error(
      'Server configuration missing FEATURE_FLAG_SYNC_TOKEN. Sync job cannot proceed.'
    );
  }

  return {
    props: {
      status: 'ok',
    },
  };
});

export default function ServerSimpleScenario() {
  return (
    <main>
      <h1>Server Error – Easy</h1>
      <p>
        The server-side render checks for <code>FEATURE_FLAG_SYNC_TOKEN</code> but the variable is not
        defined, so the request throws before a page is rendered.
      </p>
      <p>Set the variable or guard the access to resolve the issue.</p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
