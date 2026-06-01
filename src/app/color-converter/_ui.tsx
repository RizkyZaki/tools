'use client';

import { useState } from 'react';
import CopyButton from '@/components/ui/copy-button';

// ─── Color math ────────────────────────────────────────────────────────────────

function srgbLinear(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function hueChannel(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 0.5) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hf = h / 360;
  return [
    Math.round(hueChannel(p, q, hf + 1 / 3) * 255),
    Math.round(hueChannel(p, q, hf) * 255),
    Math.round(hueChannel(p, q, hf - 1 / 3) * 255),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function rgbToOklch(r: number, g: number, b: number): string {
  const lr = srgbLinear(r), lg = srgbLinear(g), lb = srgbLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

function parseColor(input: string): [number, number, number] | null {
  const s = input.trim().toLowerCase();

  const hexMatch = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  const rgbM =
    s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/) ||
    s.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)$/);
  if (rgbM) return [+rgbM[1], +rgbM[2], +rgbM[3]];

  const hslM =
    s.match(/^hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$/) ||
    s.match(/^hsl\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*\)$/);
  if (hslM) return hslToRgb(+hslM[1], +hslM[2], +hslM[3]);

  return null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const SAMPLES = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#dda0dd', '#f7dc6f'];

export default function ColorConverterUI() {
  const [text, setText] = useState('#ff6b6b');

  const rgb = parseColor(text);
  const valid = rgb !== null;

  const hex = valid ? rgbToHex(...rgb!) : '';
  const [h, s, l] = valid ? rgbToHsl(...rgb!) : [0, 0, 0];
  const [r, g, b] = rgb ?? [0, 0, 0];
  const oklch = valid ? rgbToOklch(r, g, b) : '';
  const pickerValue = hex || '#000000';

  function handlePicker(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  const formats = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: valid ? `rgb(${r}, ${g}, ${b})` : '' },
    { label: 'HSL', value: valid ? `hsl(${h}, ${s}%, ${l}%)` : '' },
    { label: 'OKLCH', value: oklch },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — input */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Color Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="#ff6b6b / rgb(255,107,107) / hsl(0,100%,71%)"
              className={`flex-1 rounded-lg border bg-white/5 px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors duration-150 ${
                text && !valid
                  ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
                  : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30'
              }`}
            />
            <input
              type="color"
              value={pickerValue}
              onChange={handlePicker}
              title="Pick a color"
              className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1"
            />
          </div>
          {text && !valid && (
            <p className="text-xs text-red-400">
              Unrecognized format — try #rrggbb, rgb(r, g, b), or hsl(h, s%, l%)
            </p>
          )}
        </div>

        {/* Sample swatches */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-500">Samples</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((c) => (
              <button
                key={c}
                onClick={() => setText(c)}
                title={c}
                className="h-8 w-8 rounded-lg border-2 border-white/10 hover:border-white/40 transition-colors"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right — preview + outputs */}
      <div className="flex flex-col gap-4">
        {/* Color preview */}
        <div
          className="h-28 rounded-xl border border-white/10 transition-colors duration-200"
          style={{ backgroundColor: valid ? `rgb(${r},${g},${b})` : 'rgba(255,255,255,0.03)' }}
        >
          {!valid && (
            <div className="flex h-full items-center justify-center text-xs text-slate-600">
              Preview
            </div>
          )}
        </div>

        {/* Format outputs */}
        <div className="flex flex-col gap-2">
          {formats.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5"
            >
              <span className="w-12 shrink-0 font-mono text-xs font-semibold text-slate-500">
                {label}
              </span>
              <span className="flex-1 font-mono text-sm text-slate-200">
                {value || <span className="text-slate-600">—</span>}
              </span>
              {value && <CopyButton value={value} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
