'use client';

import { useState } from 'react';
import Textarea from '@/components/ui/textarea';
import CopyButton from '@/components/ui/copy-button';

function b64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

interface Parsed {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function parseJwt(token: string): Parsed {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT — must have exactly 3 dot-separated parts');
  }
  const [h, p, sig] = parts;
  try {
    const header = JSON.parse(b64urlDecode(h));
    const payload = JSON.parse(b64urlDecode(p));
    return { header, payload, signature: sig };
  } catch {
    throw new Error('Failed to decode — check that the token is a valid JWT');
  }
}

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export default function JwtDebuggerUI() {
  const [token, setToken] = useState('');
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    setToken(value);
    if (!value.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      setParsed(parseJwt(value));
      setError(null);
    } catch (e) {
      setParsed(null);
      setError((e as Error).message);
    }
  }

  const exp = typeof parsed?.payload?.exp === 'number' ? parsed.payload.exp : null;
  const now = Math.floor(Date.now() / 1000);
  const isExpired = exp !== null && exp < now;
  const expiryLabel = exp !== null ? new Date(exp * 1000).toLocaleString('id-ID') : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — input */}
      <div className="flex flex-col gap-4">
        <Textarea
          label="JWT Token"
          value={token}
          onChange={(e) => handleChange(e.target.value)}
          rows={10}
          placeholder="Paste your JWT token here…"
          error={error ?? undefined}
          className="font-mono text-xs break-all"
        />

        <button
          onClick={() => handleChange(SAMPLE)}
          className="self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
        >
          Load sample token
        </button>

        {/* Expiry badge */}
        {exp !== null && (
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              isExpired
                ? 'border-red-500/30 bg-red-500/10'
                : 'border-green-500/30 bg-green-500/10'
            }`}
          >
            <span
              className={`text-sm font-semibold ${isExpired ? 'text-red-400' : 'text-green-400'}`}
            >
              {isExpired ? 'Expired' : 'Valid'}
            </span>
            <span
              className={`text-xs ${isExpired ? 'text-red-400/70' : 'text-green-400/70'}`}
            >
              {isExpired ? 'Expired on' : 'Expires on'}: {expiryLabel}
            </span>
          </div>
        )}
      </div>

      {/* Right — decoded sections */}
      <div className="flex flex-col gap-4">
        {parsed ? (
          <>
            <JwtSection label="Header" data={parsed.header} />
            <JwtSection label="Payload" data={parsed.payload} />
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Signature
                </span>
                <CopyButton value={parsed.signature} />
              </div>
              <p className="break-all font-mono text-xs text-slate-400">{parsed.signature}</p>
            </div>
          </>
        ) : (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02]">
            <p className="text-sm text-slate-600">Decoded output will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JwtSection({
  label,
  data,
}: {
  label: string;
  data: Record<string, unknown>;
}) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <CopyButton value={json} />
      </div>
      <pre className="max-h-44 overflow-auto font-mono text-xs text-slate-300">{json}</pre>
    </div>
  );
}
