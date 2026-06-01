'use client';

import { useState, useCallback, useEffect } from 'react';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

interface Opts {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const AMBIGUOUS = new Set(['0', 'O', 'l', '1', 'I']);

function buildCharset(opts: Opts): string {
  const filter = (s: string) =>
    opts.excludeAmbiguous ? s.split('').filter((c) => !AMBIGUOUS.has(c)).join('') : s;
  let cs = '';
  if (opts.uppercase) cs += filter('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (opts.lowercase) cs += filter('abcdefghijklmnopqrstuvwxyz');
  if (opts.numbers) cs += filter('0123456789');
  if (opts.symbols) cs += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  return cs;
}

function generate(opts: Opts): string {
  const cs = buildCharset(opts);
  if (!cs) return '';
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((v) => cs[v % cs.length])
    .join('');
}

function generateMany(opts: Opts, count: number): string[] {
  return Array.from({ length: count }, () => generate(opts));
}

function entropyBits(opts: Opts): number {
  const cs = buildCharset(opts);
  if (!cs) return 0;
  return opts.length * Math.log2(cs.length);
}

type Strength = { label: string; bar: string; text: string; pct: number };

function strength(bits: number): Strength {
  if (bits < 40) return { label: 'Weak', bar: 'bg-red-500', text: 'text-red-400', pct: 20 };
  if (bits < 60) return { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-400', pct: 50 };
  if (bits < 80) return { label: 'Strong', bar: 'bg-yellow-400', text: 'text-yellow-400', pct: 75 };
  return { label: 'Very Strong', bar: 'bg-green-500', text: 'text-green-400', pct: 100 };
}

const DEFAULTS: Opts = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
  excludeAmbiguous: false,
};

export default function PasswordGeneratorUI() {
  const [opts, setOpts] = useState<Opts>(DEFAULTS);
  const [password, setPassword] = useState('');
  const [bulk, setBulk] = useState<string[]>([]);

  const set = <K extends keyof Opts>(key: K, val: Opts[K]) =>
    setOpts((prev) => ({ ...prev, [key]: val }));

  const regen = useCallback(() => setPassword(generate(opts)), [opts]);
  const regenBulk = useCallback(() => setBulk(generateMany(opts, 10)), [opts]);

  useEffect(() => { regen(); }, [opts, regen]);

  const bits = entropyBits(opts);
  const s = strength(bits);
  const csSize = buildCharset(opts).length;
  const atLeastOne = opts.uppercase || opts.lowercase || opts.numbers || opts.symbols;

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      {/* Left — controls */}
      <div className="flex flex-col gap-6">
        {/* Length slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Length</label>
            <span className="font-mono text-sm font-semibold text-white">{opts.length}</span>
          </div>
          <input
            type="range"
            min={8}
            max={128}
            value={opts.length}
            onChange={(e) => set('length', +e.target.value)}
            className="w-full accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-slate-600">
            <span>8</span><span>128</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Character sets</p>
          {(
            [
              ['uppercase', 'Uppercase (A–Z)'],
              ['lowercase', 'Lowercase (a–z)'],
              ['numbers', 'Numbers (0–9)'],
              ['symbols', 'Symbols (!@#$…)'],
              ['excludeAmbiguous', 'Exclude ambiguous (0, O, l, 1, I)'],
            ] as [keyof Opts, string][]
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={opts[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              <span className="text-sm text-slate-300">{label}</span>
            </label>
          ))}
        </div>

        {/* Entropy meter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Entropy</p>
            <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${s.bar}`}
              style={{ width: `${s.pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-600">
            {bits.toFixed(1)} bits · charset size: {csSize}
          </p>
        </div>
      </div>

      {/* Right — output */}
      <div className="flex flex-col gap-4">
        {!atLeastOne ? (
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02]">
            <p className="text-sm text-slate-500">Select at least one character set</p>
          </div>
        ) : (
          <>
            {/* Main password */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 break-all font-mono text-xl font-semibold tracking-widest text-white">
                {password}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={regen}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
                >
                  ↺ Regenerate
                </button>
                <CopyButton value={password} />
              </div>
            </div>

            {/* Bulk */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={regenBulk}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
                >
                  Generate 10
                </button>
                {bulk.length > 0 && (
                  <CopyButton value={bulk.join('\n')} />
                )}
              </div>

              {bulk.length > 0 && (
                <div className={cn('flex flex-col divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10')}>
                  {bulk.map((pw, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 px-4 py-2 hover:bg-white/[0.02]">
                      <span className="flex-1 truncate font-mono text-sm text-slate-200">{pw}</span>
                      <CopyButton value={pw} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
