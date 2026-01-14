import { useEffect } from 'react';
import Link from 'next/link';

export default function ClientEasyScenario() {
  useEffect(() => {
    const profile = null;
    // This will throw "Cannot read properties of null".
    // The error mimics forgetting a null check on hydrated user data.
    // eslint-disable-next-line no-console
    console.log('Normalizing profile email', profile.email.trim().toLowerCase());
  }, []);

  return (
    <main>
      <h1>Client Error – Easy</h1>
      <p>
        This page simulates a missing null check when normalizing a profile record pulled from
        client state. The <code>useEffect</code> runs immediately and crashes by dereferencing a
        null value.
      </p>
      <p>
        Navigate back once the error has been captured to continue exploring other scenarios.
      </p>
      <Link href="/">← Back to index</Link>
    </main>
  );
}
