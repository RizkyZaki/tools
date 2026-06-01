'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type ECLevel = 'L' | 'M' | 'Q' | 'H';

const EC_LABELS: Record<ECLevel, string> = {
  L: 'L — Low (7%)',
  M: 'M — Medium (15%)',
  Q: 'Q — Quartile (25%)',
  H: 'H — High (30%)',
};

export default function QrGeneratorUI() {
  const [text, setText] = useState('https://tools.zach.dev');
  const [size, setSize] = useState(256);
  const [ecLevel, setEcLevel] = useState<ECLevel>('M');
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed || !canvasRef.current) {
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    import('qrcode').then(({ default: QRCode }) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, trimmed, {
        width: size,
        errorCorrectionLevel: ecLevel,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    });

    return () => { cancelled = true; };
  }, [text, size, ecLevel]);

  function download() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Text or URL
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Type text or paste a URL…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none transition-colors duration-150"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-slate-400">Size</label>
            <span className="font-mono text-sm text-white">{size}px</span>
          </div>
          <input
            type="range"
            min={100}
            max={500}
            step={50}
            value={size}
            onChange={(e) => setSize(+e.target.value)}
            className="w-full accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-slate-600">
            <span>100px</span><span>500px</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Error Correction
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['L', 'M', 'Q', 'H'] as ECLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEcLevel(lvl)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs transition-colors duration-150 text-left',
                  ecLevel === lvl
                    ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                )}
              >
                {EC_LABELS[lvl]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white p-4">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="max-w-full"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <button
            onClick={download}
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:border-white/20 hover:text-white transition-colors duration-150 disabled:opacity-40"
          >
            ↓ Download PNG
          </button>
        )}
      </div>
    </div>
  );
}
