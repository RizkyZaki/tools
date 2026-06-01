'use client';

import { useState, useMemo } from 'react';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

// ─── Cron math ────────────────────────────────────────────────────────────────

function matchField(expr: string, val: number): boolean {
  if (expr === '*') return true;
  for (const part of expr.split(',')) {
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2));
      if (!isNaN(step) && val % step === 0) return true;
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (val >= a && val <= b) return true;
    } else {
      if (parseInt(part) === val) return true;
    }
  }
  return false;
}

function cronMatches(date: Date, expr: string): boolean {
  const [minE, hourE, domE, monthE, dowE] = expr.split(' ');
  return (
    matchField(minE, date.getMinutes()) &&
    matchField(hourE, date.getHours()) &&
    matchField(domE, date.getDate()) &&
    matchField(monthE, date.getMonth() + 1) &&
    matchField(dowE, date.getDay())
  );
}

function getNextRuns(expr: string, count = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const results: Date[] = [];
  const start = new Date();
  start.setSeconds(0, 0);
  start.setTime(start.getTime() + 60_000);

  let cur = new Date(start);
  let i = 0;
  while (results.length < count && i < 150_000) {
    if (cronMatches(cur, expr)) results.push(new Date(cur));
    cur = new Date(cur.getTime() + 60_000);
    i++;
  }
  return results;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW_LABELS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function describeField(expr: string, unit: string, labels?: string[]): string {
  if (expr === '*') return `every ${unit}`;
  if (expr.startsWith('*/')) return `every ${expr.slice(2)} ${unit}(s)`;
  const list = expr.split(',').map((p) => {
    if (p.includes('-')) {
      const [a, b] = p.split('-');
      return `${labels ? labels[+a - (labels.length === 12 ? 1 : 0)] : a}–${labels ? labels[+b - (labels.length === 12 ? 1 : 0)] : b}`;
    }
    const n = parseInt(p);
    return labels
      ? (labels.length === 12 ? labels[n - 1] : labels[n]) ?? p
      : p;
  });
  return list.join(', ');
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid expression (need 5 fields)';
  const [min, hour, dom, month, dow] = parts;

  let time = '';
  if (min === '*' && hour === '*') time = 'every minute';
  else if (min.startsWith('*/') && hour === '*') time = `every ${min.slice(2)} minute(s)`;
  else if (hour === '*') time = `at minute ${min} of every hour`;
  else {
    const h = hour.split(',')[0].split('-')[0];
    const m = min === '*' ? '00' : min.split(',')[0].padStart(2, '0');
    const hPad = h.padStart(2, '0');
    time = hour === min && hour === '*' ? 'every minute' : `at ${hPad}:${m}`;
    if (hour.includes(',') || hour.includes('-') || hour.startsWith('*/'))
      time = `at minute ${min} of ${describeField(hour, 'hour')}`;
    if (min.includes(',') || min.includes('-') || min.startsWith('*/'))
      time = `${describeField(min, 'minute')} past ${describeField(hour, 'hour')}`;
  }

  const parts2: string[] = [time];
  if (dom !== '*') parts2.push(`on day ${describeField(dom, 'day')}`);
  if (month !== '*') parts2.push(`in ${describeField(month, 'month', MONTH_LABELS)}`);
  if (dow !== '*') parts2.push(`on ${describeField(dow, 'day', DOW_LABELS)}`);

  return parts2.join(', ');
}

// ─── Field state ──────────────────────────────────────────────────────────────

type FieldMode = 'every' | 'step' | 'specific';

interface FieldState {
  mode: FieldMode;
  step: string;
  text: string;       // for minute/hour/dom free-text
  selected: number[]; // for month/dow pills
}

function fieldToExpr(f: FieldState): string {
  if (f.mode === 'every') return '*';
  if (f.mode === 'step') return `*/${f.step || '1'}`;
  // specific
  if (f.selected.length > 0) return f.selected.sort((a,b)=>a-b).join(',');
  return f.text || '*';
}

const DEFAULT: FieldState = { mode: 'every', step: '1', text: '', selected: [] };

function makeField(f: Partial<FieldState> = {}): FieldState {
  return { ...DEFAULT, ...f };
}

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = 'builder' | 'expression';

const PRESETS = [
  { label: 'Every minute',     expr: '* * * * *' },
  { label: 'Every hour',       expr: '0 * * * *' },
  { label: 'Daily at midnight',expr: '0 0 * * *' },
  { label: 'Daily at noon',    expr: '0 12 * * *' },
  { label: 'Weekdays at 9am',  expr: '0 9 * * 1-5' },
  { label: 'Every Sunday',     expr: '0 0 * * 0' },
  { label: 'Monthly 1st',      expr: '0 0 1 * *' },
  { label: 'Every 15 min',     expr: '*/15 * * * *' },
];

export default function CronGeneratorUI() {
  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  const [rawExpr, setRawExpr] = useState('0 9 * * 1-5');

  // Builder state
  const [minute, setMinute] = useState<FieldState>(makeField({ mode: 'specific', text: '0' }));
  const [hour, setHour]     = useState<FieldState>(makeField({ mode: 'specific', text: '9' }));
  const [dom, setDom]       = useState<FieldState>(makeField());
  const [month, setMonth]   = useState<FieldState>(makeField());
  const [dow, setDow]       = useState<FieldState>(makeField({ mode: 'specific', selected: [1,2,3,4,5] }));

  const builderExpr = `${fieldToExpr(minute)} ${fieldToExpr(hour)} ${fieldToExpr(dom)} ${fieldToExpr(month)} ${fieldToExpr(dow)}`;
  const expr = viewMode === 'builder' ? builderExpr : rawExpr;

  const description = useMemo(() => describeCron(expr), [expr]);
  const nextRuns = useMemo(() => getNextRuns(expr), [expr]);

  function applyPreset(e: string) {
    const [min, hr, d, mo, dw] = e.split(' ');
    setMinute(makeField({ mode: min === '*' ? 'every' : min.startsWith('*/') ? 'step' : 'specific', step: min.startsWith('*/') ? min.slice(2) : '1', text: min === '*' || min.startsWith('*/') ? '' : min }));
    setHour(makeField({ mode: hr === '*' ? 'every' : hr.startsWith('*/') ? 'step' : 'specific', step: hr.startsWith('*/') ? hr.slice(2) : '1', text: hr === '*' || hr.startsWith('*/') ? '' : hr }));
    setDom(makeField({ mode: d === '*' ? 'every' : 'specific', text: d === '*' ? '' : d }));
    setMonth(makeField());
    // DOW with range support e.g. 1-5
    if (dw === '*') {
      setDow(makeField());
    } else if (dw.includes('-')) {
      const [a, b] = dw.split('-').map(Number);
      const sel = Array.from({ length: b - a + 1 }, (_, i) => a + i);
      setDow(makeField({ mode: 'specific', selected: sel }));
    } else {
      setDow(makeField({ mode: 'specific', selected: dw.split(',').map(Number) }));
    }
    setViewMode('builder');
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {(['builder', 'expression'] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={cn('rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition-colors duration-150',
                viewMode === m ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white')}>
              {m === 'builder' ? 'Visual Builder' : 'Expression'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left */}
        <div className="flex flex-col gap-4">
          {viewMode === 'builder' ? (
            <>
              <CronField label="Minute" hint="0–59" state={minute} onChange={setMinute}
                type="text" placeholder="e.g. 0, */5, 0,30" />
              <CronField label="Hour" hint="0–23" state={hour} onChange={setHour}
                type="text" placeholder="e.g. 9, 9-17, */6" />
              <CronField label="Day of Month" hint="1–31" state={dom} onChange={setDom}
                type="text" placeholder="e.g. 1, 15, 1,15" />
              <CronField label="Month" hint="1–12" state={month} onChange={setMonth}
                type="pills" labels={MONTH_LABELS} offset={1} />
              <CronField label="Day of Week" hint="0=Sun" state={dow} onChange={setDow}
                type="pills" labels={DOW_LABELS} offset={0} />
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Cron Expression
              </label>
              <input
                value={rawExpr}
                onChange={(e) => setRawExpr(e.target.value)}
                placeholder="* * * * *"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          )}

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.expr} onClick={() => { applyPreset(p.expr); setRawExpr(p.expr); }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — output */}
        <div className="flex flex-col gap-4">
          {/* Expression display */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">Expression</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-xl font-semibold text-cyan-300">{expr}</code>
              <CopyButton value={expr} />
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">Description</p>
            <p className="text-sm text-white">{description}</p>
          </div>

          {/* Next runs */}
          {nextRuns.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">Next 5 Runs</p>
              <div className="flex flex-col gap-1.5">
                {nextRuns.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600">#{i+1}</span>
                    <span className="font-mono text-slate-200">
                      {d.toLocaleString('id-ID', { weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nextRuns.length === 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
              No matching times found — check your expression
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CronField sub-component ──────────────────────────────────────────────────

interface CronFieldProps {
  label: string;
  hint: string;
  state: FieldState;
  onChange: (s: FieldState) => void;
  type: 'text' | 'pills';
  placeholder?: string;
  labels?: string[];
  offset?: number;
}

function CronField({ label, hint, state, onChange, type, placeholder, labels = [], offset = 0 }: CronFieldProps) {
  function toggle(val: number) {
    const sel = new Set(state.selected);
    sel.has(val) ? sel.delete(val) : sel.add(val);
    onChange({ ...state, mode: 'specific', selected: Array.from(sel) });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="text-xs text-slate-600">{hint}</span>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
          {(['every', 'step', 'specific'] as FieldMode[]).map((m) => (
            <button key={m} onClick={() => onChange({ ...state, mode: m })}
              className={cn('rounded px-2 py-0.5 capitalize transition-colors duration-150',
                state.mode === m ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white')}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {state.mode === 'step' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Every</span>
          <input type="number" min={1} value={state.step}
            onChange={(e) => onChange({ ...state, step: e.target.value })}
            className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-sm text-white focus:border-cyan-500/50 focus:outline-none" />
          <span className="text-xs text-slate-500 lowercase">{label}(s)</span>
          <code className="ml-auto text-xs text-slate-400">*/{state.step || '1'}</code>
        </div>
      )}

      {state.mode === 'specific' && type === 'text' && (
        <input
          value={state.text}
          onChange={(e) => onChange({ ...state, text: e.target.value })}
          placeholder={placeholder}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
        />
      )}

      {state.mode === 'specific' && type === 'pills' && (
        <div className="flex flex-wrap gap-1">
          {labels.map((lbl, i) => {
            const val = i + offset;
            const active = state.selected.includes(val);
            return (
              <button key={val} onClick={() => toggle(val)}
                className={cn('rounded px-2 py-0.5 text-xs transition-colors duration-150',
                  active ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                         : 'border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white')}>
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
