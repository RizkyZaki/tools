'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CorsResult {
  status: number;
  statusText: string;
  corsHeaders: Record<string, string | null>;
  passed: boolean;
}

const HEADER_DOCS: Record<string, { label: string; hint: string }> = {
  'access-control-allow-origin': {
    label: 'Allow-Origin',
    hint: 'Set to * or your specific origin to allow cross-origin requests',
  },
  'access-control-allow-methods': {
    label: 'Allow-Methods',
    hint: 'Specify allowed HTTP methods, e.g. GET, POST, PUT, DELETE',
  },
  'access-control-allow-headers': {
    label: 'Allow-Headers',
    hint: 'List headers the browser may send, e.g. Content-Type, Authorization',
  },
  'access-control-allow-credentials': {
    label: 'Allow-Credentials',
    hint: 'Set to true if cookies/auth headers should be included',
  },
  'access-control-max-age': {
    label: 'Max-Age',
    hint: 'Seconds the preflight response can be cached (reduces OPTIONS requests)',
  },
  'access-control-expose-headers': {
    label: 'Expose-Headers',
    hint: 'Headers the browser is allowed to access in the response',
  },
};

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function CorsTesterUI() {
  const [targetUrl, setTargetUrl] = useState('');
  const [origin, setOrigin] = useState('https://example.com');
  const [method, setMethod] = useState('GET');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function test() {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/cors-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim(), origin: origin.trim(), method }),
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
      {/* Inputs */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <Input
          label="Target URL"
          placeholder="https://api.example.com/endpoint"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
        <Input
          label="Origin"
          placeholder="https://myapp.com"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none [color-scheme:dark]"
          >
            {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <Button onClick={test} disabled={loading || !targetUrl.trim()} className="self-start">
        {loading ? 'Sending preflight…' : 'Test CORS'}
      </Button>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          {/* Overall result */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3',
              result.passed
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10'
            )}
          >
            <span
              className={`text-sm font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}
            >
              {result.passed ? '✓ CORS Allowed' : '✗ CORS Blocked'}
            </span>
            <span className="text-xs text-slate-400">
              Preflight returned {result.status} {result.statusText}
            </span>
          </div>

          {/* Header breakdown */}
          <div className="flex flex-col divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
            {Object.entries(result.corsHeaders).map(([key, value]) => {
              const meta = HEADER_DOCS[key];
              const present = value !== null;
              return (
                <div key={key} className="flex gap-4 px-4 py-3 hover:bg-white/[0.02]">
                  <div className="mt-0.5">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        present ? 'bg-green-400' : 'bg-slate-600'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-cyan-300">{key}</p>
                    {present ? (
                      <p className="mt-0.5 font-mono text-xs text-slate-200 break-all">{value}</p>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-600">Not set</p>
                    )}
                    {!present && meta?.hint && (
                      <p className="mt-1 text-xs text-slate-500">Tip: {meta.hint}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          Enter a URL, origin, and method — then click Test CORS to simulate a preflight request
        </div>
      )}
    </div>
  );
}
