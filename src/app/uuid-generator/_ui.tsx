'use client';

import { useState, useCallback } from 'react';
import { v1 as uuidV1, v7 as uuidV7 } from 'uuid';
import { ulid } from 'ulid';
import { nanoid, customAlphabet } from 'nanoid';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

type UuidVersion = 'v1' | 'v4' | 'v7';

function genUuid(version: UuidVersion): string {
  if (version === 'v1') return uuidV1();
  if (version === 'v7') return uuidV7();
  return crypto.randomUUID();
}

const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export default function UuidGeneratorUI() {
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, () => genUuid('v4')));

  // ULID
  const [ulids, setUlids] = useState<string[]>([]);

  // Nanoid
  const [nanoidAlphabet, setNanoidAlphabet] = useState(DEFAULT_ALPHABET);
  const [nanoidLen, setNanoidLen] = useState(21);
  const [nanoids, setNanoids] = useState<string[]>([]);

  const generate = useCallback(() => {
    const n = Math.min(Math.max(1, count), 100);
    setIds(Array.from({ length: n }, () => genUuid(version)));
  }, [version, count]);

  function genUlids() {
    setUlids(Array.from({ length: 5 }, () => ulid()));
  }

  function genNanoids() {
    const alpha = nanoidAlphabet.trim() || DEFAULT_ALPHABET;
    const gen = alpha === DEFAULT_ALPHABET ? nanoid : customAlphabet(alpha, nanoidLen);
    setNanoids(Array.from({ length: 5 }, () =>
      alpha === DEFAULT_ALPHABET ? nanoid(nanoidLen) : gen()
    ));
  }

  return (
    <div className="flex flex-col gap-8">
      {/* UUID section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Version pills */}
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {(['v1', 'v4', 'v7'] as UuidVersion[]).map((v) => (
              <button
                key={v}
                onClick={() => { setVersion(v); }}
                className={cn(
                  'rounded-lg px-4 py-1.5 font-mono text-xs font-semibold transition-colors duration-150',
                  version === v ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Count:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, +e.target.value)))}
              className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-sm text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          <button
            onClick={generate}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 hover:border-white/20 hover:text-white transition-colors duration-150"
          >
            ↺ Generate
          </button>

          {ids.length > 0 && <CopyButton value={ids.join('\n')} />}
        </div>

        <div className="flex flex-col divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
          {ids.map((id, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-white/[0.02]">
              <span className="flex-1 truncate font-mono text-sm text-slate-200">{id}</span>
              <CopyButton value={id} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-600">
            {version === 'v1' && 'v1 — time-based, exposes MAC address'}
            {version === 'v4' && 'v4 — random, cryptographically secure via crypto.randomUUID()'}
            {version === 'v7' && 'v7 — Unix timestamp-ordered, sortable'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ULID section */}
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">ULID</h3>
              <p className="text-xs text-slate-500">Universally Unique Lexicographically Sortable Identifier</p>
            </div>
            <div className="flex items-center gap-2">
              {ulids.length > 0 && <CopyButton value={ulids.join('\n')} />}
              <button
                onClick={genUlids}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-white/20 hover:text-white transition-colors duration-150"
              >
                Generate
              </button>
            </div>
          </div>
          {ulids.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {ulids.map((id, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="font-mono text-xs text-slate-200">{id}</span>
                  <CopyButton value={id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">Click Generate to create ULIDs</p>
          )}
        </div>

        {/* Nanoid section */}
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Nanoid</h3>
              <p className="text-xs text-slate-500">Tiny, URL-safe unique string ID</p>
            </div>
            <div className="flex items-center gap-2">
              {nanoids.length > 0 && <CopyButton value={nanoids.join('\n')} />}
              <button
                onClick={genNanoids}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-white/20 hover:text-white transition-colors duration-150"
              >
                Generate
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-slate-500">Alphabet</label>
              <input
                value={nanoidAlphabet}
                onChange={(e) => setNanoidAlphabet(e.target.value)}
                className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 w-16">
              <label className="text-xs text-slate-500">Length</label>
              <input
                type="number"
                min={4}
                max={64}
                value={nanoidLen}
                onChange={(e) => setNanoidLen(Math.min(64, Math.max(4, +e.target.value)))}
                className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-center font-mono text-xs text-white focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>
          {nanoids.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {nanoids.map((id, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="font-mono text-xs text-slate-200 break-all">{id}</span>
                  <CopyButton value={id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">Click Generate to create nanoids</p>
          )}
        </div>
      </div>
    </div>
  );
}
