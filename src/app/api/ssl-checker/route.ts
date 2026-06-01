import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  if (!domain || typeof domain !== 'string') {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  const clean = domain.trim().replace(/^https?:\/\//, '').split('/')[0].split('?')[0];

  if (!clean) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://crt.sh/?q=${encodeURIComponent(clean)}&output=json`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`crt.sh returned ${res.status}`);
    }

    const certs = await res.json() as Array<{
      issuer_name: string;
      common_name: string;
      not_before: string;
      not_after: string;
      entry_type: string;
      id: number;
    }>;

    if (!Array.isArray(certs) || certs.length === 0) {
      return NextResponse.json({ error: 'No certificates found for this domain' }, { status: 404 });
    }

    // Sort by not_after descending, get most recent valid cert
    const sorted = [...certs].sort(
      (a, b) => new Date(b.not_after).getTime() - new Date(a.not_after).getTime()
    );
    const latest = sorted[0];

    const notAfter = new Date(latest.not_after);
    const now = new Date();
    const daysLeft = Math.floor((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      domain: clean,
      commonName: latest.common_name,
      issuer: latest.issuer_name,
      notBefore: latest.not_before,
      notAfter: latest.not_after,
      daysLeft,
      totalCerts: certs.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Lookup failed: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
