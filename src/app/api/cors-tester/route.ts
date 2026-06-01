import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url, origin, method } = await req.json();

  if (!url || !origin || !method) {
    return NextResponse.json({ error: 'url, origin, and method are required' }, { status: 400 });
  }

  let targetUrl: string;
  try {
    targetUrl = new URL(url).toString();
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'OPTIONS',
      cache: 'no-store',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'content-type,authorization',
      },
    });

    const corsHeaders = {
      'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': res.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': res.headers.get('access-control-allow-headers'),
      'access-control-allow-credentials': res.headers.get('access-control-allow-credentials'),
      'access-control-max-age': res.headers.get('access-control-max-age'),
      'access-control-expose-headers': res.headers.get('access-control-expose-headers'),
    };

    const allowOrigin = corsHeaders['access-control-allow-origin'];
    const passed =
      (res.status === 200 || res.status === 204) &&
      allowOrigin !== null &&
      (allowOrigin === '*' || allowOrigin === origin);

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      corsHeaders,
      passed,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Request failed: ${(e as Error).message}` },
      { status: 400 }
    );
  }
}
