'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ToolCard from '@/components/tools/tool-card';
import { tools, type ToolCategory, categoryLabels } from '@/lib/tools';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 8;
const ALL_CATEGORIES = 'all';
type CategoryFilter = ToolCategory | typeof ALL_CATEGORIES;

const categoryOrder: CategoryFilter[] = [
  ALL_CATEGORIES,
  'developer',
  'converter',
  'generator',
  'security',
  'network',
  'text',
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#0a0a0a] p-5 animate-pulse">
      <div className="mb-3 h-4 w-2/3 rounded bg-neutral-200 dark:bg-[#1f1f1f]" />
      <div className="mb-2 h-3 w-full rounded bg-neutral-200 dark:bg-[#1f1f1f]" />
      <div className="mb-4 h-3 w-4/5 rounded bg-neutral-200 dark:bg-[#1f1f1f]" />
      <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-[#1f1f1f]" />
    </div>
  );
}

function ToolsContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') ?? ALL_CATEGORIES) as CategoryFilter;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(initialCategory);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORIES || tool.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.includes(q))
      );
    });
  }, [search, activeCategory]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, activeCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setIsLoading(false);
    }, 400);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  function clearFilters() {
    setSearch('');
    setActiveCategory(ALL_CATEGORIES);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="border-b border-neutral-200 dark:border-[#1f1f1f] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="font-bold text-5xl md:text-7xl text-center bg-linear-to-t from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent select-none">
            Developer Tools
          </h1>
          <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
            {tools.length} tools for your workflow — all free, no sign-up required.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Search + category filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative sm:w-72">
              <input
                placeholder="Search tools…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-colors duration-150 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {categoryOrder.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-150',
                    activeCategory === cat
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400'
                      : 'border-neutral-200 dark:border-[#1f1f1f] bg-transparent text-slate-500 hover:border-neutral-300 dark:hover:border-[#2d2d2d] hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  {cat === ALL_CATEGORIES ? 'All' : categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Tools grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
              <p className="text-slate-400 dark:text-slate-500">No tools match &ldquo;{search}&rdquo;.</p>
              <button onClick={clearFilters} className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>

              <div ref={sentinelRef} className="mt-8 flex justify-center">
                {!hasMore && !isLoading && (
                  <p className="text-xs text-slate-400 dark:text-slate-700">All tools loaded</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <ToolsContent />
    </Suspense>
  );
}
