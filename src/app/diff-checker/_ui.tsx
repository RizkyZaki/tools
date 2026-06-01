'use client';

import { useState, useMemo } from 'react';
import { diffLines } from 'diff';
import type { Change } from 'diff';
import Textarea from '@/components/ui/textarea';

export default function DiffCheckerUI() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

  const changes = useMemo(
    () => (original || modified ? diffLines(original, modified) : []),
    [original, modified]
  );

  const added = changes
    .filter((c) => c.added)
    .reduce((n, c) => n + (c.count ?? 0), 0);
  const removed = changes
    .filter((c) => c.removed)
    .reduce((n, c) => n + (c.count ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Two inputs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea
          label="Original"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          rows={10}
          placeholder="Paste the original text…"
        />
        <Textarea
          label="Modified"
          value={modified}
          onChange={(e) => setModified(e.target.value)}
          rows={10}
          placeholder="Paste the modified text…"
        />
      </div>

      {/* Summary bar */}
      {(original || modified) && (
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-green-400">
            +{added} added
          </span>
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-400">
            −{removed} removed
          </span>
          {added === 0 && removed === 0 && (
            <span className="text-slate-500">No differences found</span>
          )}
        </div>
      )}

      {/* Diff output */}
      {changes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="border-b border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-medium uppercase tracking-widest text-slate-400">
            Diff
          </div>
          <div className="divide-y divide-white/5 font-mono text-xs leading-6">
            {changes.map((change, i) => (
              <DiffBlock key={i} change={change} />
            ))}
          </div>
        </div>
      )}

      {!original && !modified && (
        <div className="flex min-h-24 items-center justify-center text-sm text-slate-600">
          Paste text in both panels to see the diff
        </div>
      )}
    </div>
  );
}

function DiffBlock({ change }: { change: Change }) {
  const lines = change.value.replace(/\n$/, '').split('\n');
  const prefix = change.added ? '+' : change.removed ? '−' : ' ';
  const rowClass = change.added
    ? 'bg-green-500/10 text-green-300 border-l-2 border-green-500'
    : change.removed
    ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500'
    : 'text-slate-500';

  return (
    <>
      {lines.map((line, i) => (
        <div key={i} className={`flex gap-3 px-4 py-0.5 ${rowClass}`}>
          <span className="w-3 shrink-0 select-none opacity-60">{prefix}</span>
          <span className="whitespace-pre-wrap break-all">{line}</span>
        </div>
      ))}
    </>
  );
}
