'use client';

import { useState, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import CopyButton from '@/components/ui/copy-button';

type Tab = 'csv-to-json' | 'json-to-csv';

// ─── CSV parser ─────────────────────────────────────────────────────────────

function parseLine(line: string, delim: string): string[] {
  const fields: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === delim && !inQ) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function detectDelim(first: string): string {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of first) {
    if (ch in counts) counts[ch as keyof typeof counts]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[]; delim: string } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [], delim: ',' };
  const delim = detectDelim(lines[0]);
  const headers = parseLine(lines[0], delim);
  const rows = lines.slice(1).filter(Boolean).map((l) => {
    const vals = parseLine(l, delim);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
  return { headers, rows, delim };
}

function csvEscape(v: string): string {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function jsonToCSV(arr: Record<string, unknown>[]): string {
  if (!arr.length) return '';
  const headers = Object.keys(arr[0]);
  const rows = arr.map((r) => headers.map((h) => csvEscape(r[h] as string)).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function downloadBlob(content: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

const SAMPLE_CSV = `name,age,city
Alice,30,Jakarta
Bob,25,Surabaya
Charlie,35,Bandung`;

const SAMPLE_JSON = `[
  {"name":"Alice","age":30,"city":"Jakarta"},
  {"name":"Bob","age":25,"city":"Surabaya"}
]`;

export default function CsvJsonUI() {
  const [tab, setTab] = useState<Tab>('csv-to-json');
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const csvFileRef = useRef<HTMLInputElement>(null);

  // CSV → JSON
  const { headers, rows, delim } = useMemo(() => parseCSV(csvInput), [csvInput]);
  const jsonOutput = useMemo(() => JSON.stringify(rows, null, 2), [rows]);

  // JSON → CSV
  const { csvOutput, jsonParseError } = useMemo(() => {
    if (!jsonInput.trim()) return { csvOutput: '', jsonParseError: null };
    try {
      const arr = JSON.parse(jsonInput);
      if (!Array.isArray(arr)) return { csvOutput: '', jsonParseError: 'Input must be a JSON array' };
      return { csvOutput: jsonToCSV(arr as Record<string, unknown>[]), jsonParseError: null };
    } catch (e) {
      return { csvOutput: '', jsonParseError: (e as Error).message };
    }
  }, [jsonInput]);

  function handleCsvFile(file: File | undefined) {
    if (!file) return;
    file.text().then(setCsvInput);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/10">
        {(['csv-to-json', 'json-to-csv'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-5 py-2 text-sm font-medium transition-colors duration-150',
              tab === t ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            {t === 'csv-to-json' ? 'CSV → JSON' : 'JSON → CSV'}
          </button>
        ))}
      </div>

      {/* CSV → JSON */}
      {tab === 'csv-to-json' && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">CSV Input</label>
                <button
                  onClick={() => csvFileRef.current?.click()}
                  className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Upload .csv
                </button>
                <input ref={csvFileRef} type="file" accept=".csv,text/csv" className="hidden"
                  onChange={(e) => handleCsvFile(e.target.files?.[0])} />
                {delim !== ',' && (
                  <span className="text-xs text-slate-600">
                    Delimiter: {delim === '\t' ? 'tab' : delim}
                  </span>
                )}
              </div>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y"
              />
              <p className="text-xs text-slate-600">{rows.length} rows · {headers.length} columns</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">JSON Output</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadBlob(jsonOutput, 'output.json', 'application/json')}
                    className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Download
                  </button>
                  <CopyButton value={jsonOutput} />
                </div>
              </div>
              <textarea readOnly value={jsonOutput} rows={10}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-slate-200 resize-none" />
            </div>
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    {headers.map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      {headers.map((h) => (
                        <td key={h} className="px-4 py-2 text-slate-300">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="border-t border-white/10 px-4 py-2 text-xs text-slate-600">
                  Showing 10 of {rows.length} rows
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSON → CSV */}
      {tab === 'json-to-csv' && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-400">JSON Array Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y"
              />
              {jsonParseError && <p className="text-xs text-red-400">{jsonParseError}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">CSV Output</label>
                {csvOutput && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadBlob(csvOutput, 'output.csv', 'text/csv')}
                      className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Download
                    </button>
                    <CopyButton value={csvOutput} />
                  </div>
                )}
              </div>
              <textarea readOnly value={csvOutput} rows={10}
                placeholder="CSV output will appear here…"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 resize-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
