import { NextResponse } from 'next/server';

const UPSTREAM_URL =
  process.env.OTLP_LOGS_API_URL ??
  'https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs';

// The upstream generates fresh random data per request, so never cache.
export const dynamic = 'force-dynamic';

/**
 * Server-side proxy to the upstream OTLP logs endpoint. Keeping the fetch on the
 * server sidesteps browser CORS, hides the upstream URL from the client, and gives a
 * single seam we can mock in tests.
 */
export async function GET() {
  try {
    const upstream = await fetch(UPSTREAM_URL, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream responded with ${upstream.status}` },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach upstream';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
