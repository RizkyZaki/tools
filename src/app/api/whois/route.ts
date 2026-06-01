import { NextRequest, NextResponse } from 'next/server';

interface RdapEvent { eventAction: string; eventDate: string }
interface RdapEntity { roles: string[]; vcardArray?: unknown[] }
interface RdapNameserver { ldhName: string }

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  if (!domain || typeof domain !== 'string') {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  const clean = domain.trim().replace(/^https?:\/\//, '').split('/')[0].toLowerCase();

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(clean)}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Domain not found in RDAP' }, { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`RDAP returned ${res.status}`);
    }

    const data = await res.json();

    const events: RdapEvent[] = data.events ?? [];
    const registered = events.find((e) => e.eventAction === 'registration')?.eventDate ?? null;
    const expires = events.find((e) =>
      e.eventAction === 'expiration' || e.eventAction === 'expiry'
    )?.eventDate ?? null;
    const lastChanged = events.find((e) => e.eventAction === 'last changed')?.eventDate ?? null;

    const nameservers = ((data.nameservers ?? []) as RdapNameserver[]).map((n) => n.ldhName);
    const status: string[] = data.status ?? [];

    // Extract registrar from entities
    const entities: RdapEntity[] = data.entities ?? [];
    const registrarEntity = entities.find((e) => e.roles?.includes('registrar'));
    let registrar: string | null = null;
    if (registrarEntity?.vcardArray) {
      const vcard = registrarEntity.vcardArray as [string, unknown[]][]; // [version, [...items]]
      const items = vcard[1] as unknown[];
      const fnItem = items.find((item) => Array.isArray(item) && (item as unknown[])[0] === 'fn') as unknown[] | undefined;
      if (fnItem) registrar = fnItem[3] as string;
    }

    return NextResponse.json({
      domain: data.ldhName ?? clean,
      registrar,
      registered,
      expires,
      lastChanged,
      nameservers,
      status,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `WHOIS lookup failed: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
