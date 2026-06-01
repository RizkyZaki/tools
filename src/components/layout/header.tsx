import Link from 'next/link';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-20 border-b backdrop-blur-md bg-white/60 dark:bg-black/60 border-neutral-200 dark:border-white/10">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 max-xl:px-10 max-xs:px-5">
        {/* Logo */}
        <Link href="/">
          <h1 className="font-bold text-4xl text-black dark:text-white hover:opacity-80 transition-opacity">
            Zach<span className="text-blue-500 dark:text-blue-400">.</span>
          </h1>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-150 hover:scale-110 transform"
          >
            All Tools
          </Link>
          <a
            href="https://zxch.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-150 hover:scale-110 transform"
          >
            zxch.my.id ↗
          </a>
        </nav>

        {/* Right side: theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
