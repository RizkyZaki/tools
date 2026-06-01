import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-white dark:bg-black border-t border-neutral-200 dark:border-[#1f1f1f] pt-16 pb-10 overflow-hidden">
      {/* Grid background — same as my portfolio */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#afafaf2e_1px,transparent_1px),linear-gradient(to_bottom,#afafaf2e_1px,transparent_1px)] bg-size-[80px_80px] mask-[radial-gradient(ellipse_90%_60%_at_50%_95%,#000_70%,transparent_110%)] opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto sm:px-10 px-5 flex flex-col items-center gap-8">
        <h2 className="font-bold text-4xl md:text-6xl text-center bg-linear-to-t from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent select-none">
          Developer Tools
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
          Free, fast developer tools — no sign-up required. Built with love by{' '}
          <a
            href="https://zxch.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
          >
            Zach
          </a>
          .
        </p>
      </div>

      <div className="relative flex mt-16 flex-row justify-between items-center max-w-7xl mx-auto sm:px-10 px-5">
        <p className="md:text-base text-sm text-slate-500 dark:text-slate-600">
          Copyright &copy; {new Date().getFullYear()} Zach
        </p>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/RizkyZaki"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 z-10 cursor-pointer flex justify-center items-center rounded-full border border-neutral-200 dark:border-[#1f1f1f] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#2d2d2d] transition-colors duration-150"
          >
            <Github size={15} />
          </a>
          <a
            href="https://www.linkedin.com/in/rizkyzaki/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 z-10 cursor-pointer flex justify-center items-center rounded-full border border-neutral-200 dark:border-[#1f1f1f] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#2d2d2d] transition-colors duration-150"
          >
            <Linkedin size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
