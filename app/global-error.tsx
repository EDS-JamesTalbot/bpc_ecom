'use client';

/**
 * Catches unhandled errors in the root layout.
 * Check Vercel Dashboard → Project → Logs for the actual error.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#dc2626' }}>Application error</h1>
        <p style={{ marginBottom: '1rem' }}>
          A server-side exception occurred. Check your Vercel deployment logs for details.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Digest: {error.digest ?? 'N/A'}
        </p>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Common causes: missing DATABASE_URL or CLERK keys in Vercel Environment Variables.
          Ensure they are set for <strong>Production</strong> and <strong>Preview</strong>.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1DA1F9',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
