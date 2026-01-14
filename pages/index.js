import Link from 'next/link';

const scenarios = [
  {
    slug: 'client-easy',
    title: 'Client Error – Easy',
    summary: 'Null access in a hydration effect.',
  },
  {
    slug: 'client-complex',
    title: 'Client Error – Complex',
    summary: 'Stateful analytics pipeline with unsafe parsing.',
  },
  {
    slug: 'server-simple',
    title: 'Server Error – Easy',
    summary: 'Guarded configuration lookup missing fallback.',
  },
  {
    slug: 'server-complex',
    title: 'Server Error – Complex',
    summary: 'Chained data hydration and caching failure.',
  },
  {
    slug: 'cross-boundary',
    title: 'Client Visible, Server Root Cause',
    summary: 'Client fetch surfaces server validation bug.',
  },
  {
    slug: 'integration-failure',
    title: '3rd Party Integration Failure',
    summary: 'External API outage bubbled through backend proxy.',
  },
];

export default function Home() {
  return (
    <main>
      <h1>Next.js + Sentry Seer Playground</h1>
      <p>
        Use the scenarios below to trigger a range of intentional bugs. Each scenario is built
        to exercise a different class of failure so you can observe how Sentry captures and
        classifies the events.
      </p>
      <ol>
        {scenarios.map(({ slug, title, summary }) => (
          <li key={slug} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{title}</h2>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>{summary}</p>
            <Link href={`/scenarios/${slug}`}>Go to scenario →</Link>
          </li>
        ))}
      </ol>
      <section>
        <h2>Setup Notes</h2>
        <ul>
          <li>Copy <code>.env.example</code> to <code>.env.local</code> and add your Sentry DSN.</li>
          <li>Run <code>npm install</code> then <code>npm run dev</code> to launch locally.</li>
          <li>
            Trigger each scenario in production build (<code>npm run build && npm run start</code>) to
            mirror deployed behavior once you are satisfied in development.
          </li>
        </ul>
      </section>
    </main>
  );
}
