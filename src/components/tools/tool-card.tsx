import Link from 'next/link';
import { type Tool, categoryLabels } from '@/lib/tools';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="group block rounded-xl border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] p-5 transition-all duration-200 hover:border-blue-400/50 hover:bg-blue-50/50 dark:hover:bg-[#0d1117]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-white transition-colors duration-150 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {tool.name}
        </h3>
        {tool.isNew && (
          <span className="shrink-0 rounded-full border border-blue-400/40 bg-blue-400/10 px-2 py-0.5 text-[10px] font-medium text-blue-500 dark:text-blue-400">
            New
          </span>
        )}
      </div>

      <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {tool.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-100 dark:bg-[#111] px-2 py-0.5 text-[10px] capitalize text-slate-500">
          {categoryLabels[tool.category]}
        </span>
        {tool.requiresServer && (
          <span className="rounded-md border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-100 dark:bg-[#111] px-2 py-0.5 text-[10px] text-slate-500">
            Server
          </span>
        )}
      </div>
    </Link>
  );
}
