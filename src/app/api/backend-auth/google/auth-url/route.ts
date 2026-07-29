import { NextResponse } from 'next/server';

function getBackendBase(): string {
  const raw =
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    'http://localhost:5001';
  return raw.replace(/\/+$/, '');
}

/**
 * Same-origin proxy for Google OAuth URL generation.
 * Avoids browser CORS when the API returns 503/HTML error pages without CORS headers.
 */
export async function GET() {
  const url = `${getBackendBase()}/api/auth/google/auth-url`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            message:
              res.status === 503
                ? 'API is temporarily unavailable (503). Check PM2 (`pm2 logs farmkeeper-api`) and Nginx on the EC2 host.'
                : `Backend error (${res.status}).`,
            ...data,
          },
          { status: res.status >= 500 ? 503 : res.status }
        );
      }
      return NextResponse.json(data, { status: 200 });
    }

    await res.text();
    return NextResponse.json(
      {
        success: false,
        message:
          res.status === 503
            ? 'API is temporarily unavailable. Check that farmkeeper-api is online on EC2.'
            : `Backend returned ${res.status} (non-JSON).`,
      },
      { status: res.status >= 500 ? 503 : 502 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Could not reach the backend API. Confirm NEXT_PUBLIC_BACKEND_URL / BACKEND_URL and that https://api.farmkeeper.co is healthy.',
      },
      { status: 502 }
    );
  }
}
