'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

interface CertResult {
  domain: string;
  commonName: string;
  issuer: string;
  notBefore: string;
  notAfter: string;
  daysLeft: number;
  totalCerts: number;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ExpiryBadge({ days }: { days: number }) {
  const cls =
    days < 0
      ? 'border-red-500/30 bg-red-500/10 text-red-400'
      : days < 30
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      : 'border-green-500/30 bg-green-500/10 text-green-400';
  const label =
    days < 0 ? 'Expired' : days < 30 ? `Expiring soon (${days}d)` : `Valid (${days}d left)`;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

export default function SslCheckerUI() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ssl-checker', {
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
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        </div>
        <Button onClick={check} disabled={loading || !domain.trim()}>
          {loading ? 'Checking…' : 'Check'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Domain" value={result.domain} />
          <InfoCard label="Common Name" value={result.commonName} />
          <InfoCard
            label="Validity"
            value={
              <div className="flex flex-col gap-1">
                <ExpiryBadge days={result.daysLeft} />
                <span className="text-xs text-slate-500">
                  {fmtDate(result.notBefore)} → {fmtDate(result.notAfter)}
                </span>
              </div>
            }
          />
          <InfoCard label="Issuer" value={result.issuer} mono />
          <InfoCard
            label="Certificates found"
            value={`${result.totalCerts} records on crt.sh`}
          />
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          Enter a domain (without https://) to check its SSL certificate
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
      <div className={`text-sm text-white ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </div>
    </div>
  );
}
