const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

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
            <GithubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/rizkyzaki/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 z-10 cursor-pointer flex justify-center items-center rounded-full border border-neutral-200 dark:border-[#1f1f1f] text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-[#2d2d2d] transition-colors duration-150"
          >
            <LinkedinIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
