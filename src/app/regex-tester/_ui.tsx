'use client';

import { useState, useMemo } from 'react';
import Textarea from '@/components/ui/textarea';
import Input from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Flag = 'g' | 'i' | 'm' | 's';

const FLAG_META: { flag: Flag; title: string }[] = [
  { flag: 'g', title: 'Global — find all matches' },
  { flag: 'i', title: 'Case insensitive' },
  { flag: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { flag: 's', title: 'Dotall — . matches newlines' },
];

interface Part {
  text: string;
  matched: boolean;
  id: number;
}

interface MatchResult {
  parts: Part[];
  matches: RegExpMatchArray[];
  error: string | null;
}

function runRegex(text: string, pattern: string, flags: Set<Flag>): MatchResult {
  if (!pattern) {
    return { parts: [{ text, matched: false, id: 0 }], matches: [], error: null };
  }
  try {
    const flagStr = Array.from(flags).join('');
    // matchAll needs 'g'; add it internally if not set
    const internalFlags = flagStr.includes('g') ? flagStr : 'g' + flagStr;
    const regex = new RegExp(pattern, internalFlags);
    const allMatches = [...text.matchAll(regex)];
    const matches = flags.has('g') ? allMatches : allMatches.slice(0, 1);

    const parts: Part[] = [];
    let lastIdx = 0;
    let id = 0;

    for (const m of matches) {
      if (m.index! > lastIdx) {
        parts.push({ text: text.slice(lastIdx, m.index), matched: false, id: id++ });
      }
      parts.push({ text: m[0], matched: true, id: id++ });
      lastIdx = m.index! + m[0].length;
      // avoid infinite loop on zero-length matches
      if (m[0].length === 0) break;
    }
    if (lastIdx < text.length) {
      parts.push({ text: text.slice(lastIdx), matched: false, id: id++ });
    }

    return { parts, matches, error: null };
  } catch (e) {
    return { parts: [{ text, matched: false, id: 0 }], matches: [], error: (e as Error).message };
  }
}

export default function RegexTesterUI() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.');
  const [pattern, setPattern] = useState('\\b\\w{4}\\b');
  const [flags, setFlags] = useState<Set<Flag>>(new Set(['g', 'i']));

  function toggleFlag(f: Flag) {
    setFlags((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  }

  const { parts, matches, error } = useMemo(
    () => runRegex(text, pattern, flags),
    [text, pattern, flags]
  );

  const flagStr = Array.from(flags).join('');
  const hasGroups = matches.some((m) => m.length > 1);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — inputs */}
      <div className="flex flex-col gap-4">
        <Textarea
          label="Test Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste text to test against…"
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Regex Pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            error={error ?? undefined}
            placeholder="e.g. \b\w+\b"
            className="font-mono"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500">Flags:</span>
            {FLAG_META.map(({ flag, title }) => (
              <button
                key={flag}
                title={title}
                onClick={() => toggleFlag(flag)}
                className={cn(
                  'rounded border px-2.5 py-1 font-mono text-xs transition-colors duration-150',
                  flags.has(flag)
                    ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                )}
              >
                {flag}
              </button>
            ))}
            <code className="ml-auto text-xs text-slate-600">
              /{pattern || '…'}/{flagStr}
            </code>
          </div>
        </div>
      </div>

      {/* Right — output */}
      <div className="flex flex-col gap-4">
        {/* Highlighted text */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Output
            </span>
            {matches.length > 0 && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
          <pre className="min-h-32 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-sm leading-relaxed text-slate-300">
            {parts.map((p) =>
              p.matched ? (
                <mark
                  key={p.id}
                  className="rounded bg-amber-400/25 px-0.5 text-amber-200 not-italic"
                >
                  {p.text}
                </mark>
              ) : (
                <span key={p.id}>{p.text}</span>
              )
            )}
            {!text && <span className="text-slate-600">Highlighted matches will appear here…</span>}
          </pre>
        </div>

        {/* Match list */}
        {matches.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
              Match List
            </p>
            <div className="flex max-h-44 flex-col gap-0.5 overflow-y-auto">
              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded px-2 py-1 text-xs hover:bg-white/5"
                >
                  <span className="w-5 shrink-0 text-slate-600">#{i + 1}</span>
                  <span className="flex-1 truncate font-mono text-amber-300">
                    {m[0] || '(empty)'}
                  </span>
                  <span className="shrink-0 text-slate-600">@{m.index}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capture groups */}
        {hasGroups && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
              Capture Groups
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-2 pr-4 text-left font-medium text-slate-500">#</th>
                    {matches[0].slice(1).map((_, gi) => (
                      <th key={gi} className="pb-2 pr-4 text-left font-medium text-slate-500">
                        Group {gi + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-1.5 pr-4 text-slate-500">{i + 1}</td>
                      {m.slice(1).map((g, gi) => (
                        <td key={gi} className="py-1.5 pr-4 font-mono text-slate-300">
                          {g ?? <span className="italic text-slate-600">undefined</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!pattern && !error && (
          <p className="text-center text-xs text-slate-600">Enter a pattern above to start matching</p>
        )}
      </div>
    </div>
  );
}
