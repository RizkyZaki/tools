'use client';

import { useState, useEffect, useRef } from 'react';
import CopyButton from '@/components/ui/copy-button';

const INITIAL = `# Hello, Markdown!

Write **Markdown** on the left and see the *live preview* on the right.

## Features

- Bold, italic, headings
- Code blocks and inline \`code\`
- Links and [images](https://example.com)
- Tables and blockquotes

## Code Example

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('world'));
\`\`\`

> "Any sufficiently advanced technology is indistinguishable from magic."
> — Arthur C. Clarke

| Language | Stars |
|----------|-------|
| TypeScript | ⭐⭐⭐⭐⭐ |
| Rust | ⭐⭐⭐⭐⭐ |
| Python | ⭐⭐⭐⭐ |
`;

interface ToolbarAction {
  label: string;
  title: string;
  before: string;
  after: string;
  block?: boolean;
}

const TOOLBAR: ToolbarAction[] = [
  { label: 'B', title: 'Bold', before: '**', after: '**' },
  { label: 'I', title: 'Italic', before: '*', after: '*' },
  { label: 'H2', title: 'Heading', before: '## ', after: '' },
  { label: '`', title: 'Inline code', before: '`', after: '`' },
  { label: '```', title: 'Code block', before: '```\n', after: '\n```' },
  { label: '🔗', title: 'Link', before: '[', after: '](url)' },
  { label: '—', title: 'List item', before: '- ', after: '' },
  { label: '>', title: 'Blockquote', before: '> ', after: '' },
];

export default function MarkdownPreviewUI() {
  const [markdown, setMarkdown] = useState(INITIAL);
  const [html, setHtml] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    async function render() {
      if (typeof window === 'undefined') return;
      const { marked } = await import('marked');
      const { default: DOMPurify } = await import('dompurify');
      const raw = marked.parse(markdown) as string;
      if (active) setHtml(DOMPurify.sanitize(raw));
    }
    render();
    return () => { active = false; };
  }, [markdown]);

  function insertSnippet(before: string, after: string) {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = markdown.slice(s, e);
    const next = markdown.slice(0, s) + before + sel + after + markdown.slice(e);
    setMarkdown(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, e + before.length);
    });
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-white/10 bg-white/[0.02] px-3 py-2">
        {TOOLBAR.map(({ label, title, before, after }) => (
          <button
            key={title}
            title={title}
            onMouseDown={(e) => { e.preventDefault(); insertSnippet(before, after); }}
            className="rounded px-2 py-1 font-mono text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-150"
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <CopyButton value={html} />
          <span className="text-xs text-slate-600">Copy HTML</span>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid min-h-[500px] divide-x divide-white/10 overflow-hidden rounded-b-xl border border-white/10 lg:grid-cols-2">
        <textarea
          ref={taRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="h-full min-h-[500px] resize-none bg-white/[0.02] px-4 py-4 font-mono text-sm text-slate-200 focus:outline-none"
          spellCheck={false}
        />
        <div
          data-prose
          className="overflow-y-auto px-6 py-4 text-sm text-slate-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
