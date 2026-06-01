import { NextRequest, NextResponse } from 'next/server';

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DohResponse {
  Status: number;
  Answer?: DnsAnswer[];
}

const SERVERS = [
  { name: 'Google',     url: 'https://dns.google/resolve' },
  { name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'Quad9',      url: 'https://dns.quad9.net/dns-query' },
  { name: 'OpenDNS',   url: 'https://doh.opendns.com/dns-query' },
];

export async function POST(req: NextRequest) {
  const { domain, type } = await req.json();

  if (!domain || !type) {
    return NextResponse.json({ error: 'domain and type are required' }, { status: 400 });
  }

  const clean = domain.trim().replace(/^https?:\/\//, '').split('/')[0];

  const results = await Promise.allSettled(
    SERVERS.map(async (server) => {
      const res = await fetch(`${server.url}?name=${encodeURIComponent(clean)}&type=${type}`, {
        headers: { Accept: 'application/dns-json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json() as DohResponse;
      return {
        status: data.Status === 0 ? 'resolved' : data.Status === 3 ? 'nxdomain' : 'failed',
        answers: (data.Answer ?? []).map((a) => a.data),
        ttl: data.Answer?.[0]?.TTL ?? null,
      };
    })
  );

  return NextResponse.json(
    results.map((r, i) => ({
      server: SERVERS[i].name,
      ...(r.status === 'fulfilled'
        ? r.value
        : { status: 'error', answers: [], ttl: null }),
    }))
  );
}
