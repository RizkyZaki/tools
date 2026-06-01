'use client';

import { useState } from 'react';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

type Mode = 'unix-to-date' | 'date-to-unix';

const ZONES = [
  { label: 'WIB', tz: 'Asia/Jakarta' },
  { label: 'WITA', tz: 'Asia/Makassar' },
  { label: 'WIT', tz: 'Asia/Jayapura' },
  { label: 'UTC', tz: 'UTC' },
  { label: 'Lokal', tz: undefined as string | undefined },
];

function formatInZone(date: Date, tz: string | undefined): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function tsToDate(ts: number): Date {
  // auto-detect: if > 10^10 treat as milliseconds
  return new Date(ts > 9_999_999_999 ? ts : ts * 1000);
}

function localDatetimeValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function TimestampConverterUI() {
  const [mode, setMode] = useState<Mode>('unix-to-date');
  const [tsInput, setTsInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dtInput, setDtInput] = useState(localDatetimeValue());

  // ── Mode 1: unix → date ────────────────────────────────────────────
  const tsNum = Number(tsInput);
  const tsDate = !isNaN(tsNum) && tsInput !== '' ? tsToDate(tsNum) : null;

  // ── Mode 2: date → unix ────────────────────────────────────────────
  const dtDate = dtInput ? new Date(dtInput) : null;
  const dtUnixSec = dtDate && !isNaN(dtDate.getTime()) ? Math.floor(dtDate.getTime() / 1000) : null;
  const dtUnixMs = dtDate && !isNaN(dtDate.getTime()) ? dtDate.getTime() : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-1 self-start rounded-xl border border-white/10 bg-white/5 p-1">
        {(['unix-to-date', 'date-to-unix'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-xs font-medium transition-colors duration-150',
              mode === m
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            )}
          >
            {m === 'unix-to-date' ? 'Unix → Datetime' : 'Datetime → Unix'}
          </button>
        ))}
      </div>

      {mode === 'unix-to-date' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Unix Timestamp
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                  placeholder="1716998400"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors duration-150"
                />
                <button
                  onClick={() => setTsInput(String(Math.floor(Date.now() / 1000)))}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
                >
                  Now
                </button>
              </div>
              <p className="text-xs text-slate-600">
                {tsNum > 9_999_999_999 ? 'Detected: milliseconds' : 'Detected: seconds'}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-2">
            {tsDate ? (
              ZONES.map(({ label, tz }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
                  <span className="w-12 shrink-0 font-mono text-xs font-medium text-slate-500">
                    {label}
                  </span>
                  <span className="flex-1 text-sm text-slate-200">
                    {formatInZone(tsDate, tz)}
                  </span>
                  <CopyButton value={formatInZone(tsDate, tz)} />
                </div>
              ))
            ) : (
              <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
                Enter a timestamp to convert
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Datetime
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dtInput}
                  onChange={(e) => setDtInput(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors duration-150 [color-scheme:dark]"
                />
                <button
                  onClick={() => setDtInput(localDatetimeValue())}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
                >
                  Now
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-3">
            {dtUnixSec !== null ? (
              <>
                <UnixRow label="Seconds (s)" value={String(dtUnixSec)} />
                <UnixRow label="Milliseconds (ms)" value={String(dtUnixMs)} />
                <UnixRow
                  label="ISO 8601"
                  value={dtDate ? new Date(dtDate.getTime()).toISOString() : ''}
                />
              </>
            ) : (
              <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
                Select a date and time to convert
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UnixRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
      <span className="shrink-0 text-xs text-slate-500">{label}</span>
      <span className="mx-4 flex-1 truncate text-right font-mono text-sm text-slate-200">{value}</span>
      <CopyButton value={value} />
    </div>
  );
}
