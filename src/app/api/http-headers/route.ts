import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let targetUrl: string;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    targetUrl = parsed.toString();
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    let res = await fetch(targetUrl, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
    });

    // Some servers reject HEAD — fall back to GET
    if (res.status === 405) {
      res = await fetch(targetUrl, { method: 'GET', redirect: 'follow', cache: 'no-store' });
    }

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      redirected: res.redirected,
      finalUrl: res.url,
      headers,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to fetch: ${(e as Error).message}` },
      { status: 400 }
    );
  }
}
