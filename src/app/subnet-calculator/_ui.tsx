'use client';

import { useState, useMemo } from 'react';
import CopyButton from '@/components/ui/copy-button';

// ─── Subnet math ──────────────────────────────────────────────────────────────

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function intToHex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(8, '0');
}

function ipToBinary(ip: string): string {
  return ip.split('.').map((o) => parseInt(o).toString(2).padStart(8, '0')).join('.');
}

function getIpClass(first: number): string {
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D — Multicast';
  return 'E — Reserved';
}

interface SubnetResult {
  ip: string;
  prefix: number;
  network: string;
  broadcast: string;
  mask: string;
  maskHex: string;
  wildcard: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipBinary: string;
  maskBinary: string;
}

function calcSubnet(cidr: string): SubnetResult | null {
  const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!match) return null;

  const ip = match[1];
  const prefix = parseInt(match[2]);

  if (prefix < 0 || prefix > 32) return null;
  const octs = ip.split('.').map(Number);
  if (octs.some((o) => o < 0 || o > 255)) return null;

  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | ~maskInt) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  const firstHost = prefix >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1);
  const lastHost = prefix >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1);

  return {
    ip,
    prefix,
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    mask: intToIp(maskInt),
    maskHex: intToHex(maskInt),
    wildcard: intToIp(wildcardInt),
    firstHost,
    lastHost,
    totalHosts,
    usableHosts,
    ipClass: getIpClass(octs[0]),
    ipBinary: ipToBinary(ip),
    maskBinary: ipToBinary(intToIp(maskInt)),
  };
}

function splitSubnets(result: SubnetResult) {
  const splits: { prefix: number; count: number; size: number; first: string; last: string }[] = [];
  const base = result.prefix;
  for (let p = base + 1; p <= Math.min(base + 4, 30); p++) {
    const count = Math.pow(2, p - base);
    const size = Math.pow(2, 32 - p);
    const baseInt = ipToInt(result.network);
    const firstNet = intToIp(baseInt);
    const lastNetInt = (baseInt + size * (count - 1)) >>> 0;
    splits.push({ prefix: p, count, size, first: firstNet, last: intToIp(lastNetInt) });
  }
  return splits;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EXAMPLES = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '192.168.100.0/26'];

export default function SubnetCalculatorUI() {
  const [input, setInput] = useState('192.168.1.0/24');

  const result = useMemo(() => calcSubnet(input), [input]);
  const splits = useMemo(() => (result ? splitSubnets(result) : []), [result]);

  const invalid = input.trim() && !result;

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
          CIDR Notation
        </label>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="192.168.1.0/24"
            className={`flex-1 rounded-xl border bg-white/5 px-4 py-2.5 font-mono text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors duration-150 ${
              invalid ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30'
            }`}
          />
        </div>
        {invalid && <p className="text-xs text-red-400">Invalid CIDR — use format x.x.x.x/prefix (prefix 0–32)</p>}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => setInput(e)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-400 hover:border-white/20 hover:text-white transition-colors duration-150">
              {e}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <>
          {/* Results grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Network Address', value: result.network },
              { label: 'Broadcast Address', value: result.broadcast },
              { label: 'Subnet Mask', value: `${result.mask} (${result.maskHex})` },
              { label: 'Wildcard Mask', value: result.wildcard },
              { label: 'First Usable Host', value: result.firstHost },
              { label: 'Last Usable Host', value: result.lastHost },
              { label: 'Total Hosts', value: result.totalHosts.toLocaleString() },
              { label: 'Usable Hosts', value: result.usableHosts.toLocaleString() },
              { label: 'IP Class', value: `Class ${result.ipClass}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm text-white">{value}</p>
                  <CopyButton value={value} />
                </div>
              </div>
            ))}
          </div>

          {/* Binary representation */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">Binary Representation</p>
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-500">IP</span>
                <span className="text-slate-200">{result.ipBinary}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-500">Mask</span>
                <span className="text-slate-200">{result.maskBinary}</span>
              </div>
            </div>
          </div>

          {/* Subnet split */}
          {splits.length > 0 && result.prefix <= 28 && (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-slate-400">
                Subnet Split (/{result.prefix} → smaller)
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    {['Prefix','Subnets','Hosts each','First Network','Last Network'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {splits.map((s) => (
                    <tr key={s.prefix} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2 font-mono text-xs text-cyan-300">/{s.prefix}</td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-200">{s.count}</td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-200">{(s.size - 2).toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-400">{s.first}/{s.prefix}</td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-400">{s.last}/{s.prefix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!result && !invalid && (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          Enter a CIDR address to calculate subnet details
        </div>
      )}
    </div>
  );
}
