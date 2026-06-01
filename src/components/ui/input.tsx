import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export default function Input({ label, error, suffix, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={cn(
            'w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition-colors duration-150 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20',
            suffix ? 'pr-10' : undefined,
            error && 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
