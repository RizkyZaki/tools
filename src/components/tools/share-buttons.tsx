'use client';

import { useState } from 'react';
import { tools } from '@/lib/tools';

const PLATFORMS = [
  {
    name: 'WhatsApp',
    getUrl: (title: string, url: string) =>
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    name: 'X',
    getUrl: (title: string, url: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    getUrl: (_: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    getUrl: (_: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

const baseCls =
  'rounded-lg border border-[#1f1f1f] px-3 py-1.5 text-xs text-slate-500 hover:border-blue-400/30 hover:text-blue-400 transition-colors duration-150';

export default function ShareButtons({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return null;

  const url = `https://tools.zach.dev/${slug}`;
  const title = `${tool.name} — tools.zach.dev`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-700 mr-1">Share:</span>
      {PLATFORMS.map((p) => (
        <a
          key={p.name}
          href={p.getUrl(title, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={baseCls}
        >
          {p.name}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className={
          copied
            ? 'rounded-lg border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-400 transition-colors duration-150'
            : baseCls
        }
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
