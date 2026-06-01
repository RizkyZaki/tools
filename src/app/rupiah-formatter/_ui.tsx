'use client';

import { useState } from 'react';
import CopyButton from '@/components/ui/copy-button';

// ─── Terbilang ────────────────────────────────────────────────────────────────

const ONES = [
  '', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan',
  'sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas',
  'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas',
];

const TENS = [
  '', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh',
  'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh',
];

function toWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) {
    const r = n % 10;
    return TENS[Math.floor(n / 10)] + (r ? ' ' + ONES[r] : '');
  }
  if (n < 1_000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h === 1 ? 'seratus' : ONES[h] + ' ratus') + (r ? ' ' + toWords(r) : '');
  }
  if (n < 1_000_000) {
    const t = Math.floor(n / 1_000);
    const r = n % 1_000;
    return (t === 1 ? 'seribu' : toWords(t) + ' ribu') + (r ? ' ' + toWords(r) : '');
  }
  if (n < 1_000_000_000) {
    const m = Math.floor(n / 1_000_000);
    const r = n % 1_000_000;
    return toWords(m) + ' juta' + (r ? ' ' + toWords(r) : '');
  }
  if (n < 1_000_000_000_000) {
    const b = Math.floor(n / 1_000_000_000);
    const r = n % 1_000_000_000;
    return toWords(b) + ' miliar' + (r ? ' ' + toWords(r) : '');
  }
  const t = Math.floor(n / 1_000_000_000_000);
  const r = n % 1_000_000_000_000;
  return toWords(t) + ' triliun' + (r ? ' ' + toWords(r) : '');
}

function terbilang(n: number): string {
  if (!Number.isFinite(n)) return '';
  if (n === 0) return 'nol rupiah';
  const prefix = n < 0 ? 'minus ' : '';
  return prefix + toWords(Math.abs(Math.round(n))).trim() + ' rupiah';
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RupiahFormatterUI() {
  const [raw, setRaw] = useState('1250000');

  const num = Number(raw.replace(/[^\d.-]/g, ''));
  const valid = raw !== '' && Number.isFinite(num);

  const rupiah = valid ? formatRupiah(num) : '';
  const words = valid ? terbilang(num) : '';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — input */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Nominal
          </label>
          <input
            type="number"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="1250000"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-lg text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors duration-150"
          />
          <p className="text-xs text-slate-600">Ketik angka tanpa titik atau koma</p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {[100_000, 500_000, 1_000_000, 10_000_000, 100_000_000].map((v) => (
            <button
              key={v}
              onClick={() => setRaw(String(v))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
            >
              {formatRupiah(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Right — outputs */}
      <div className="flex flex-col gap-4">
        <OutputCard
          label="Format Rupiah"
          value={rupiah}
          empty="Masukkan nominal di sebelah kiri"
        />
        <OutputCard
          label="Terbilang"
          value={words}
          empty=""
          mono={false}
          capitalize
        />
      </div>
    </div>
  );
}

function OutputCard({
  label,
  value,
  empty,
  mono = true,
  capitalize = false,
}: {
  label: string;
  value: string;
  empty: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  const display = capitalize && value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</span>
        {value && <CopyButton value={display} />}
      </div>
      {display ? (
        <p className={`text-lg leading-relaxed text-white ${mono ? 'font-mono' : ''}`}>
          {display}
        </p>
      ) : (
        <p className="text-sm text-slate-600">{empty}</p>
      )}
    </div>
  );
}
