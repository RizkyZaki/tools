'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

interface WhoisResult {
  domain: string;
  registrar: string | null;
  registered: string | null;
  expires: string | null;
  lastChanged: string | null;
  nameservers: string[];
  status: string[];
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function WhoisUI() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
          />
        </div>
        <Button onClick={lookup} disabled={loading || !domain.trim()}>
          {loading ? 'Looking up…' : 'Lookup'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <WhoisRow label="Domain" value={result.domain} />
            <WhoisRow label="Registrar" value={result.registrar ?? '—'} />
            <WhoisRow label="Registered" value={fmtDate(result.registered)} />
            <WhoisRow label="Expires" value={fmtDate(result.expires)} />
            {result.lastChanged && (
              <WhoisRow label="Last Changed" value={fmtDate(result.lastChanged)} />
            )}
          </div>

          {result.nameservers.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Nameservers
              </p>
              <ul className="flex flex-col gap-1">
                {result.nameservers.map((ns) => (
                  <li key={ns} className="font-mono text-sm text-slate-200">{ns}</li>
                ))}
              </ul>
            </div>
          )}

          {result.status.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Status
              </p>
              <div className="flex flex-wrap gap-2">
                {result.status.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          Enter a domain name to look up WHOIS information via RDAP
        </div>
      )}
    </div>
  );
}

function WhoisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}
