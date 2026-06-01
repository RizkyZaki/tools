'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import CopyButton from '@/components/ui/copy-button';

interface HeaderResult {
  status: number;
  statusText: string;
  redirected: boolean;
  finalUrl: string;
  headers: Record<string, string>;
}

const SECURITY_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'x-xss-protection',
];

const GROUPS: Record<string, string[]> = {
  Security: SECURITY_HEADERS,
  Cache: ['cache-control', 'etag', 'last-modified', 'expires', 'age', 'vary'],
  CORS: [
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'access-control-allow-credentials',
  ],
  Content: ['content-type', 'content-length', 'content-encoding', 'transfer-encoding'],
};

function groupHeaders(headers: Record<string, string>) {
  const seen = new Set<string>();
  const grouped: Record<string, Record<string, string>> = {};

  for (const [group, keys] of Object.entries(GROUPS)) {
    const matched: Record<string, string> = {};
    for (const k of keys) {
      if (headers[k] !== undefined) {
        matched[k] = headers[k];
        seen.add(k);
      }
    }
    if (Object.keys(matched).length > 0) grouped[group] = matched;
  }

  const other: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!seen.has(k)) other[k] = v;
  }
  if (Object.keys(other).length > 0) grouped['Other'] = other;

  return grouped;
}

function StatusBadge({ code }: { code: number }) {
  const cls =
    code < 300
      ? 'border-green-500/30 bg-green-500/10 text-green-400'
      : code < 400
      ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
      : 'border-red-500/30 bg-red-500/10 text-red-400';
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{code}</span>
  );
}

export default function HttpHeadersUI() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function inspect() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/http-headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
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

  const missing = result
    ? SECURITY_HEADERS.filter((h) => !result.headers[h])
    : [];

  const grouped = result ? groupHeaders(result.headers) : {};

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && inspect()}
          />
        </div>
        <Button onClick={inspect} disabled={loading || !url.trim()}>
          {loading ? 'Fetching…' : 'Inspect'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-5">
          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <StatusBadge code={result.status} />
            <span className="text-slate-400">{result.statusText}</span>
            {result.redirected && (
              <span className="text-xs text-slate-500">→ {result.finalUrl}</span>
            )}
          </div>

          {/* Missing security headers */}
          {missing.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="mb-2 text-xs font-semibold text-amber-400">Missing security headers:</p>
              <ul className="flex flex-col gap-1">
                {missing.map((h) => (
                  <li key={h} className="font-mono text-xs text-amber-300/80">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grouped header table */}
          {Object.entries(grouped).map(([group, hdrs]) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {group}
              </p>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-white/5">
                    {Object.entries(hdrs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-white/[0.02]">
                        <td className="w-1/3 px-4 py-2.5 font-mono text-xs text-cyan-300 align-top">
                          {key}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-300 break-all">
                          {value}
                        </td>
                        <td className="w-10 px-2 py-2.5 align-top">
                          <CopyButton value={value} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          Enter a URL and click Inspect to see HTTP response headers
        </div>
      )}
    </div>
  );
}
