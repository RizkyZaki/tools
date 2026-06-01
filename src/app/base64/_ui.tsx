'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import CopyButton from '@/components/ui/copy-button';

type Tab = 'text' | 'file' | 'image';
type TextMode = 'encode' | 'decode';

function encodeText(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
}

function decodeText(b64: string): { value: string; error: boolean } {
  try {
    return { value: decodeURIComponent(escape(atob(b64.trim()))), error: false };
  } catch {
    return { value: '', error: true };
  }
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Base64UI() {
  const [tab, setTab] = useState<Tab>('text');

  // ── Text tab state ──
  const [textMode, setTextMode] = useState<TextMode>('encode');
  const [textInput, setTextInput] = useState('Hello, world!');

  // ── File tab state ──
  const [fileResult, setFileResult] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Image tab state ──
  const [imgInput, setImgInput] = useState('');
  const [imgError, setImgError] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (e) => setFileResult(e.target?.result as string ?? '');
    reader.readAsDataURL(file);
  }

  // Text tab output
  const textEncoded = encodeText(textInput);
  const { value: textDecoded, error: decodeError } = decodeText(textInput);
  const textOutput = textMode === 'encode' ? textEncoded : textDecoded;

  // Image tab
  const imgSrc = imgInput.trim()
    ? imgInput.trim().startsWith('data:')
      ? imgInput.trim()
      : `data:image/png;base64,${imgInput.trim().replace(/\s/g, '')}`
    : '';

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/10">
        {(['text', 'file', 'image'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-5 py-2 text-sm font-medium capitalize transition-colors duration-150',
              tab === t
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Text tab ── */}
      {tab === 'text' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Input</label>
              <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
                {(['encode', 'decode'] as TextMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTextMode(m)}
                    className={cn(
                      'px-3 py-1.5 capitalize transition-colors duration-150',
                      textMode === m ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              placeholder={textMode === 'encode' ? 'Type text to encode…' : 'Paste Base64 to decode…'}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y transition-colors duration-150"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                {textMode === 'encode' ? 'Encoded' : 'Decoded'}
              </span>
              {textOutput && <CopyButton value={textOutput} />}
            </div>
            {textMode === 'decode' && decodeError ? (
              <div className="flex min-h-36 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5">
                <p className="text-sm text-red-400">Invalid Base64 input</p>
              </div>
            ) : (
              <div className="min-h-36 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <pre className="whitespace-pre-wrap break-all font-mono text-sm text-slate-200">
                  {textOutput || <span className="text-slate-600">Output will appear here</span>}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── File tab ── */}
      {tab === 'file' && (
        <div className="flex flex-col gap-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-150',
              dragging
                ? 'border-cyan-400/50 bg-cyan-400/5'
                : 'border-white/15 hover:border-white/30 hover:bg-white/[0.02]'
            )}
          >
            <span className="text-2xl opacity-40">📁</span>
            <p className="text-sm text-slate-400">
              {dragging ? 'Drop to encode' : 'Click or drag & drop any file'}
            </p>
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {fileResult && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-medium text-white">{fileInfo?.name}</span>
                  <span>Original: {fmtBytes(fileInfo?.size ?? 0)}</span>
                  <span>Base64: {fmtBytes(fileResult.length)}</span>
                </div>
                <CopyButton value={fileResult} />
              </div>
              <textarea
                readOnly
                value={fileResult}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-slate-300 resize-none"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Image tab ── */}
      {tab === 'image' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Base64 Image (data URL or raw)
            </label>
            <textarea
              value={imgInput}
              onChange={(e) => { setImgInput(e.target.value); setImgError(false); }}
              rows={8}
              placeholder="Paste a data:image/... URL or raw base64 string…"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Preview</span>
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-4">
              {imgSrc ? (
                imgError ? (
                  <p className="text-sm text-red-400">Invalid image or Base64 data</p>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt="Preview"
                    className="max-h-64 max-w-full rounded object-contain"
                    onError={() => setImgError(true)}
                  />
                )
              ) : (
                <p className="text-sm text-slate-600">Image preview will appear here</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
