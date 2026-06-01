import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ShareButtons from '@/components/tools/share-buttons';
import { tools, categoryLabels } from '@/lib/tools';

interface ToolLayoutProps {
  slug: string;
  children: React.ReactNode;
}

export default function ToolLayout({ slug, children }: ToolLayoutProps) {
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center text-slate-500">
          Tool not found.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
            <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors duration-150">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/?category=${tool.category}`}
              className="capitalize hover:text-slate-600 dark:hover:text-slate-400 transition-colors duration-150"
            >
              {categoryLabels[tool.category]}
            </Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-400">{tool.name}</span>
          </nav>

          {/* Tool header */}
          <div className="mb-8">
            <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">{tool.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
            <div className="mt-4">
              <ShareButtons slug={slug} />
            </div>
          </div>

          {/* Tool content */}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
