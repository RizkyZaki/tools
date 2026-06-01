'use client';

import { useState, useMemo } from 'react';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

type Mode = 'remove' | 'highlight' | 'only-dupes';

interface Opts {
  caseSensitive: boolean;
  trim: boolean;
  keepBlank: boolean;
  mode: Mode;
}

interface ProcessResult {
  output: string;
  totalIn: number;
  totalOut: number;
  dupesFound: number;
  highlightedLines: { text: string; isDupe: boolean }[];
}

function normalize(line: string, opts: Opts): string {
  let s = opts.trim ? line.trim() : line;
  if (!opts.caseSensitive) s = s.toLowerCase();
  return s;
}

function process(input: string, opts: Opts): ProcessResult {
  const lines = input.split('\n');
  const totalIn = lines.length;
  const seen = new Map<string, number>(); // key → first occurrence count
  const counts = new Map<string, number>();

  // First pass: count occurrences
  for (const line of lines) {
    const key = normalize(line, opts);
    if (!opts.keepBlank && key === '') continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Second pass: apply mode
  const resultLines: string[] = [];
  const highlightedLines: { text: string; isDupe: boolean }[] = [];
  let dupesFound = 0;

  for (const line of lines) {
    const key = normalize(line, opts);
    const isBlank = key === '';

    if (!opts.keepBlank && isBlank) continue;

    const count = counts.get(key) ?? 1;
    const isDupe = count > 1;

    if (isDupe) dupesFound++;

    if (opts.mode === 'remove') {
      if (!seen.has(key)) {
        seen.set(key, 1);
        resultLines.push(line);
        highlightedLines.push({ text: line, isDupe: false });
      }
    } else if (opts.mode === 'highlight') {
      const already = seen.has(key);
      if (!already) seen.set(key, 1);
      resultLines.push(line);
      highlightedLines.push({ text: line, isDupe: already });
    } else {
      // only-dupes: show each duplicate line once
      if (isDupe && !seen.has(key)) {
        seen.set(key, 1);
        resultLines.push(line);
        highlightedLines.push({ text: line, isDupe: true });
      }
    }
  }

  // de-duplicate the dupesFound count (each occurrence beyond first)
  dupesFound = 0;
  for (const [, cnt] of counts) {
    if (cnt > 1) dupesFound += cnt - 1;
  }

  return {
    output: resultLines.join('\n'),
    totalIn,
    totalOut: resultLines.length,
    dupesFound,
    highlightedLines,
  };
}

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'remove', label: 'Remove duplicates' },
  { value: 'highlight', label: 'Highlight duplicates' },
  { value: 'only-dupes', label: 'Show only duplicates' },
];

export default function DuplicateLineRemoverUI() {
  const [input, setInput] = useState('apple\nbanana\napple\ncherry\nbanana\ndate\napple');
  const [opts, setOpts] = useState<Opts>({
    caseSensitive: false,
    trim: true,
    keepBlank: false,
    mode: 'remove',
  });

  const result = useMemo(() => process(input, opts), [input, opts]);

  function toggle<K extends keyof Opts>(key: K, val: Opts[K]) {
    setOpts((prev) => ({ ...prev, [key]: val }));
  }

  function swap() {
    setInput(result.output);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Mode</label>
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-0.5">
            {MODE_OPTIONS.map(({ value, label }) => (
              <button key={value} onClick={() => toggle('mode', value)}
                className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  opts.mode === value ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          {([
            ['caseSensitive', 'Case sensitive'],
            ['trim', 'Trim whitespace'],
            ['keepBlank', 'Keep blank lines'],
          ] as [keyof Opts, string][]).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox"
                checked={opts[key] as boolean}
                onChange={(e) => toggle(key, e.target.checked)}
                className="h-4 w-4 accent-cyan-400" />
              <span className="text-sm text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stats */}
      {input && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-400">
            {result.totalIn} lines in
          </span>
          <span>→</span>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-400">
            {result.totalOut} lines out
          </span>
          {result.dupesFound > 0 && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-400">
              {result.dupesFound} duplicate occurrence{result.dupesFound !== 1 ? 's' : ''} removed
            </span>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Input</label>
            <button onClick={() => setInput('')}
              className="text-xs text-slate-500 hover:text-white transition-colors">Clear</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            placeholder="Paste lines here…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Output</label>
            <div className="flex items-center gap-2">
              <button onClick={swap}
                className="text-xs text-slate-500 hover:text-white transition-colors">⇅ Swap</button>
              {result.output && <CopyButton value={result.output} />}
            </div>
          </div>

          {opts.mode === 'highlight' ? (
            <div className="min-h-64 overflow-auto rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm leading-6">
              {result.highlightedLines.map((l, i) => (
                <div key={i}
                  className={cn('whitespace-pre-wrap break-all',
                    l.isDupe ? 'text-amber-400 bg-amber-400/10 rounded' : 'text-slate-200')}>
                  {l.text || ' '}
                </div>
              ))}
            </div>
          ) : (
            <textarea
              readOnly
              value={result.output}
              rows={16}
              placeholder="Output will appear here…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 resize-y"
            />
          )}
        </div>
      </div>
    </div>
  );
}
