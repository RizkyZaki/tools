import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-700 outline-none resize-y transition-colors duration-150 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20',
          error && 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
