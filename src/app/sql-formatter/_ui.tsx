'use client';

import { useState } from 'react';
import { format } from 'sql-formatter';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

// ─── SQL Keywords for highlighting ────────────────────────────────────────────

const KEYWORDS = new Set([
  'SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS',
  'ON','AND','OR','NOT','IN','IS','NULL','LIKE','BETWEEN','GROUP','BY','ORDER',
  'HAVING','UNION','ALL','DISTINCT','AS','INTO','VALUES','SET','INSERT','UPDATE',
  'DELETE','CREATE','ALTER','DROP','TABLE','INDEX','VIEW','DATABASE','SCHEMA',
  'WITH','LIMIT','OFFSET','ASC','DESC','CASE','WHEN','THEN','ELSE','END',
  'EXISTS','ANY','SOME','PRIMARY','FOREIGN','KEY','REFERENCES','UNIQUE',
  'DEFAULT','CONSTRAINT','CHECK','IF','RETURNING','TOP','FETCH','NEXT','ROWS',
  'ONLY','OVER','PARTITION','WINDOW','ROW_NUMBER','RANK','DENSE_RANK','LAG',
  'LEAD','FIRST_VALUE','LAST_VALUE','COUNT','SUM','AVG','MIN','MAX',
  'COALESCE','NULLIF','CAST','CONVERT','ISNULL','NVL','DECODE',
  'INT','INTEGER','BIGINT','SMALLINT','TINYINT','FLOAT','DOUBLE','DECIMAL',
  'NUMERIC','CHAR','VARCHAR','TEXT','NVARCHAR','NCHAR','DATE','DATETIME',
  'TIMESTAMP','BOOLEAN','BOOL','BINARY','VARBINARY','UUID','SERIAL','AUTO_INCREMENT',
  'NOT','NULL','IDENTITY','TRUNCATE','EXEC','EXECUTE','CALL','PROCEDURE',
  'FUNCTION','BEGIN','COMMIT','ROLLBACK','TRANSACTION','SAVEPOINT',
]);

function escHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightSQL(sql: string): string {
  let out = '';
  let i = 0;
  const n = sql.length;

  while (i < n) {
    // Line comment
    if (sql[i] === '-' && sql[i+1] === '-') {
      const end = sql.indexOf('\n', i);
      const slice = end === -1 ? sql.slice(i) : sql.slice(i, end);
      out += `<span class="sql-comment">${escHtml(slice)}</span>`;
      i += slice.length;
    }
    // Block comment
    else if (sql[i] === '/' && sql[i+1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      const slice = end === -1 ? sql.slice(i) : sql.slice(i, end + 2);
      out += `<span class="sql-comment">${escHtml(slice)}</span>`;
      i += slice.length;
    }
    // Single-quoted string
    else if (sql[i] === "'") {
      let j = i + 1;
      while (j < n) {
        if (sql[j] === '\\') j += 2;
        else if (sql[j] === "'" && sql[j+1] === "'") j += 2; // SQL escape
        else if (sql[j] === "'") { j++; break; }
        else j++;
      }
      out += `<span class="sql-string">${escHtml(sql.slice(i, j))}</span>`;
      i = j;
    }
    // Backtick identifier
    else if (sql[i] === '`') {
      let j = i + 1;
      while (j < n && sql[j] !== '`') j++;
      if (j < n) j++;
      out += `<span class="sql-ident">${escHtml(sql.slice(i, j))}</span>`;
      i = j;
    }
    // Double-quoted identifier
    else if (sql[i] === '"') {
      let j = i + 1;
      while (j < n && sql[j] !== '"') j++;
      if (j < n) j++;
      out += `<span class="sql-ident">${escHtml(sql.slice(i, j))}</span>`;
      i = j;
    }
    // Number
    else if (/\d/.test(sql[i]) && (i === 0 || !/\w/.test(sql[i-1]))) {
      let j = i;
      while (j < n && /[\d.eExX]/.test(sql[j])) j++;
      out += `<span class="sql-number">${escHtml(sql.slice(i, j))}</span>`;
      i = j;
    }
    // Word
    else if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i;
      while (j < n && /[\w]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      if (KEYWORDS.has(word.toUpperCase())) {
        out += `<span class="sql-keyword">${escHtml(word)}</span>`;
      } else {
        out += escHtml(word);
      }
      i = j;
    }
    else {
      out += escHtml(sql[i]);
      i++;
    }
  }
  return out;
}

// ─── Dialects ─────────────────────────────────────────────────────────────────

const DIALECTS = [
  { label: 'Generic SQL', value: 'sql' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'SQLite', value: 'sqlite' },
  { label: 'T-SQL', value: 'tsql' },
] as const;

type Dialect = (typeof DIALECTS)[number]['value'];

const SAMPLE = `SELECT u.id, u.name, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2024-01-01' GROUP BY u.id, u.name HAVING COUNT(o.id) > 5 ORDER BY order_count DESC LIMIT 20;`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SqlFormatterUI() {
  const [input, setInput] = useState(SAMPLE);
  const [dialect, setDialect] = useState<Dialect>('sql');
  const [formatted, setFormatted] = useState('');
  const [error, setError] = useState<string | null>(null);

  function doFormat() {
    if (!input.trim()) return;
    try {
      const result = format(input, {
        language: dialect,
        tabWidth: 2,
        keywordCase: 'upper',
      });
      setFormatted(result);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setFormatted('');
    }
  }

  function doMinify() {
    if (!input.trim()) return;
    const result = input.replace(/\s+/g, ' ').trim();
    setFormatted(result);
    setError(null);
  }

  const highlighted = formatted ? highlightSQL(formatted) : '';

  return (
    <div className="flex flex-col gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={dialect}
          onChange={(e) => setDialect(e.target.value as Dialect)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none [color-scheme:dark]"
        >
          {DIALECTS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <button
          onClick={doFormat}
          className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 transition-colors duration-150"
        >
          Format
        </button>
        <button
          onClick={doMinify}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:border-white/20 hover:text-white transition-colors duration-150"
        >
          Minify
        </button>
        <button
          onClick={() => { setInput(''); setFormatted(''); setError(null); }}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150"
        >
          Clear
        </button>
        {formatted && (
          <div className="ml-auto">
            <CopyButton value={formatted} />
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">SQL Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            placeholder="Paste your SQL query here…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y transition-colors duration-150"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Formatted Output</label>
          {error ? (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : formatted ? (
            <pre
              className="overflow-auto rounded-xl border border-white/10 bg-[#0d1b2e] px-4 py-3 font-mono text-sm leading-6 text-slate-300"
              style={{ minHeight: '300px' }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02]">
              <p className="text-sm text-slate-600">Click Format or Minify to see output</p>
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for SQL syntax highlighting */}
      <style>{`
        .sql-keyword { color: #60a5fa; font-weight: 600; }
        .sql-string  { color: #4ade80; }
        .sql-comment { color: #64748b; font-style: italic; }
        .sql-number  { color: #fbbf24; }
        .sql-ident   { color: #f9a8d4; }
      `}</style>
    </div>
  );
}
