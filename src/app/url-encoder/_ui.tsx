'use client';

import { useState } from 'react';
import Textarea from '@/components/ui/textarea';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

type Tab = 'encode' | 'query';

interface QueryParam {
  key: string;
  raw: string;
  decoded: string;
}

function parseQuery(input: string): QueryParam[] {
  try {
    let qs = input.trim();
    // Strip full URL down to query string
    if (qs.startsWith('http://') || qs.startsWith('https://')) {
      qs = new URL(qs).search.replace(/^\?/, '');
    } else {
      qs = qs.replace(/^\?/, '');
    }
    const params = new URLSearchParams(qs);
    return Array.from(params.entries()).map(([key, raw]) => ({
      key,
      raw,
      decoded: (() => { try { return decodeURIComponent(raw); } catch { return raw; } })(),
    }));
  } catch {
    return [];
  }
}

function safeEncode(s: string): string {
  try { return encodeURIComponent(s); } catch { return s; }
}

function safeDecode(s: string): { value: string; error: boolean } {
  try { return { value: decodeURIComponent(s), error: false }; }
  catch { return { value: s, error: true }; }
}

export default function UrlEncoderUI() {
  const [tab, setTab] = useState<Tab>('encode');
  const [encodeInput, setEncodeInput] = useState('Hello World! foo=bar&baz=qux');
  const [queryInput, setQueryInput] = useState('https://example.com/search?q=hello+world&lang=id&page=1');

  const encoded = safeEncode(encodeInput);
  const { value: decoded, error: decodeError } = safeDecode(encodeInput);

  const queryParams = parseQuery(queryInput);

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-white/10">
        {(['encode', 'query'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-5 py-2 text-sm font-medium transition-colors duration-150',
              tab === t
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            {t === 'encode' ? 'Encode / Decode' : 'Query Parser'}
          </button>
        ))}
      </div>

      {tab === 'encode' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left */}
          <Textarea
            label="Input"
            value={encodeInput}
            onChange={(e) => setEncodeInput(e.target.value)}
            rows={8}
            placeholder="Type or paste text / URL…"
          />

          {/* Right */}
          <div className="flex flex-col gap-4">
            <ResultBlock label="Encoded (encodeURIComponent)" value={encoded} />
            <ResultBlock
              label="Decoded (decodeURIComponent)"
              value={decoded}
              error={decodeError ? 'Input contains invalid percent-encoding' : undefined}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <Textarea
              label="URL or Query String"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={5}
              placeholder="https://example.com?foo=bar&baz=qux"
            />
            <p className="text-xs text-slate-600">
              Paste a full URL or just the query string (with or without ?)
            </p>
          </div>

          {/* Right — table */}
          <div>
            {queryParams.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-slate-500">Key</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-slate-500">Value</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-slate-500">Decoded</th>
                      <th className="w-10 px-2 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {queryParams.map((p, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-mono text-xs text-cyan-300">{p.key}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-400 break-all">{p.raw}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-200 break-all">{p.decoded}</td>
                        <td className="px-2 py-2.5">
                          <CopyButton value={p.decoded} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-32 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-sm text-slate-600">
                {queryInput ? 'No query parameters found' : 'Paste a URL to parse its query string'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultBlock({
  label,
  value,
  error,
}: {
  label: string;
  value: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</span>
        {value && !error && <CopyButton value={value} />}
      </div>
      <div className="min-h-16 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : (
          <p className="break-all font-mono text-sm text-slate-200">{value}</p>
        )}
      </div>
    </div>
  );
}
