/**
 * Maintenance route - shown when admin is logged in (admin-exclusive mode).
 * Clears customer session securely and returns the maintenance message.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAdminActive } from '@/lib/admin-session';

const COOKIE_NAME = 'customer_session';

export async function GET(request: Request) {
  const cookieStore = await cookies();

  // Securely clear customer session - ensures account holders are logged out
  cookieStore.delete(COOKIE_NAME);

  // If admin is no longer active, redirect back to shop
  const adminActive = await isAdminActive();
  if (!adminActive) {
    const url = new URL(request.url);
    return NextResponse.redirect(new URL('/', url.origin));
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Site Temporarily Unavailable</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
      font-family: system-ui, -apple-system, sans-serif;
      padding: 1rem;
    }
    .container {
      max-width: 28rem;
      width: 100%;
      text-align: center;
    }
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      border-radius: 9999px;
      background: #fef3c7;
      color: #d97706;
      margin-bottom: 1.5rem;
    }
    .icon svg {
      width: 2rem;
      height: 2rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }
    p {
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h1>We're sorry but our website is temporarily down</h1>
    <p>Please try again later.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
