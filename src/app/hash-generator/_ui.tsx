'use client';

import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import Textarea from '@/components/ui/textarea';
import CopyButton from '@/components/ui/copy-button';

interface Hashes {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeHashes(text: string): Promise<Hashes> {
  const enc = new TextEncoder().encode(text);
  const [sha1Buf, sha256Buf, sha512Buf] = await Promise.all([
    crypto.subtle.digest('SHA-1', enc),
    crypto.subtle.digest('SHA-256', enc),
    crypto.subtle.digest('SHA-512', enc),
  ]);
  return {
    md5: CryptoJS.MD5(text).toString(),
    sha1: toHex(sha1Buf),
    sha256: toHex(sha256Buf),
    sha512: toHex(sha512Buf),
  };
}

const HASH_ROWS: { key: keyof Hashes; label: string }[] = [
  { key: 'md5', label: 'MD5' },
  { key: 'sha1', label: 'SHA-1' },
  { key: 'sha256', label: 'SHA-256' },
  { key: 'sha512', label: 'SHA-512' },
];

export default function HashGeneratorUI() {
  const [text, setText] = useState('Hello, world!');
  const [hashes, setHashes] = useState<Hashes | null>(null);

  useEffect(() => {
    if (!text) {
      setHashes(null);
      return;
    }
    let cancelled = false;
    computeHashes(text).then((h) => {
      if (!cancelled) setHashes(h);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="flex flex-col gap-6">
      {/* Input — full width */}
      <Textarea
        label="Input Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Type or paste text to hash…"
      />

      {/* Hash outputs */}
      <div className="flex flex-col gap-3">
        {HASH_ROWS.map(({ key, label }) => (
          <HashRow
            key={key}
            label={label}
            value={hashes ? hashes[key] : null}
            empty={!text}
          />
        ))}
      </div>
    </div>
  );
}

function HashRow({
  label,
  value,
  empty,
}: {
  label: string;
  value: string | null;
  empty: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="w-16 shrink-0 font-mono text-xs font-semibold text-slate-400">{label}</span>
      <span className="flex-1 truncate font-mono text-xs text-slate-200">
        {empty ? (
          <span className="text-slate-600">Enter text to generate hash</span>
        ) : value ? (
          value
        ) : (
          <span className="animate-pulse text-slate-600">Computing…</span>
        )}
      </span>
      {value && <CopyButton value={value} />}
    </div>
  );
}
