'use client';

import { useState } from 'react';
import Textarea from '@/components/ui/textarea';
import CopyButton from '@/components/ui/copy-button';

function splitWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')       // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser → XML Parser
    .replace(/[-_]+/g, ' ')                      // snake/kebab → space
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()
    .split(' ')
    .filter(Boolean);
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Conversion {
  label: string;
  format: string;
  fn: (words: string[]) => string;
}

const CONVERSIONS: Conversion[] = [
  {
    label: 'camelCase',
    format: 'camelCase',
    fn: (w) => w.map((word, i) => (i === 0 ? word : cap(word))).join(''),
  },
  {
    label: 'PascalCase',
    format: 'PascalCase',
    fn: (w) => w.map(cap).join(''),
  },
  {
    label: 'snake_case',
    format: 'snake_case',
    fn: (w) => w.join('_'),
  },
  {
    label: 'kebab-case',
    format: 'kebab-case',
    fn: (w) => w.join('-'),
  },
  {
    label: 'SCREAMING_SNAKE',
    format: 'SCREAMING_SNAKE_CASE',
    fn: (w) => w.join('_').toUpperCase(),
  },
  {
    label: 'Title Case',
    format: 'Title Case',
    fn: (w) => w.map(cap).join(' '),
  },
];

export default function CaseConverterUI() {
  const [input, setInput] = useState('the quick brown fox');

  const words = splitWords(input);
  const hasInput = words.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Input — full width */}
      <Textarea
        label="Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder="Type or paste text… (handles camelCase, PascalCase, snake_case, kebab-case, spaces)"
      />

      {/* Output grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONVERSIONS.map(({ label, format, fn }) => {
          const result = hasInput ? fn(words) : '';
          return (
            <div
              key={format}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  {label}
                </span>
                {result && <CopyButton value={result} />}
              </div>
              <p className="font-mono text-sm text-white break-all">
                {result || <span className="text-slate-600">—</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
