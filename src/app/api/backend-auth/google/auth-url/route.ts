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
 * Avoids browser CORS when the Render backend returns 503/HTML error pages without CORS headers.
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
                ? 'API is temporarily unavailable (503). On Render: wait for cold start, check logs, or upgrade from free tier sleep.'
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
            ? 'API is temporarily unavailable. Render may be starting up or the service is down—check Render dashboard / logs.'
            : `Backend returned ${res.status} (non-JSON).`,
      },
      { status: res.status >= 500 ? 503 : 502 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Could not reach the backend API. Confirm NEXT_PUBLIC_BACKEND_URL / BACKEND_URL and that Render is running.',
      },
      { status: 502 }
    );
  }
}
