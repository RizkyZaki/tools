'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

interface DnsRow {
  server: string;
  status: 'resolved' | 'nxdomain' | 'failed' | 'error';
  answers: string[];
  ttl: number | null;
}

function StatusBadge({ status }: { status: DnsRow['status'] }) {
  const cls = {
    resolved: 'border-green-500/30 bg-green-500/10 text-green-400',
    nxdomain: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    failed:   'border-red-500/30 bg-red-500/10 text-red-400',
    error:    'border-red-500/30 bg-red-500/10 text-red-400',
  }[status];
  const label = {
    resolved: 'Resolved',
    nxdomain: 'NXDOMAIN',
    failed: 'Failed',
    error: 'Error',
  }[status];
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export default function DnsPropagationUI() {
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('A');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<DnsRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const res = await fetch('/api/dns-propagation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const allMatch =
    rows !== null &&
    rows.filter((r) => r.status === 'resolved').length > 1 &&
    new Set(rows.filter((r) => r.status === 'resolved').map((r) => r.answers.join('|'))).size === 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <Input
            label="Domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Record Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none [color-scheme:dark]"
          >
            {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={check} disabled={loading || !domain.trim()}>
            {loading ? 'Checking…' : 'Check Propagation'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-2">
          {['Google', 'Cloudflare', 'Quad9', 'OpenDNS'].map((s) => (
            <div key={s} className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <span className="w-24 text-sm text-slate-400">{s}</span>
              <div className="h-4 flex-1 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {rows && (
        <div className="flex flex-col gap-3">
          {allMatch && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-2.5 text-sm text-green-400">
              <span>✓</span> DNS is fully propagated — all servers return the same records
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {['Server','Status','Records','TTL'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr key={row.server} className={cn('hover:bg-white/[0.02]', row.status === 'resolved' && 'bg-green-500/[0.02]')}>
                    <td className="px-4 py-3 font-medium text-sm text-white">{row.server}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">
                      {row.answers.length > 0
                        ? <ul className="flex flex-col gap-0.5">{row.answers.map((a, i) => <li key={i}>{a}</li>)}</ul>
                        : <span className="text-slate-600">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {row.ttl !== null ? `${row.ttl}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={check} className="text-xs text-slate-500 hover:text-white transition-colors">
              ↺ Refresh
            </button>
          </div>
        </div>
      )}

      {!rows && !loading && !error && (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          Enter a domain and record type to check DNS propagation across global resolvers
        </div>
      )}
    </div>
  );
}
