import { cn } from '@/lib/utils';
import type { ToolCategory } from '@/lib/tools';

type BadgeVariant = 'category' | 'new' | 'server' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  category?: ToolCategory;
  className?: string;
}

const categoryColors: Record<ToolCategory, string> = {
  developer: 'border-blue-400/20 bg-blue-400/10 text-blue-400',
  network:   'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
  converter: 'border-amber-400/20 bg-amber-400/10 text-amber-400',
  generator: 'border-purple-400/20 bg-purple-400/10 text-purple-400',
  security:  'border-red-400/20 bg-red-400/10 text-red-400',
  text:      'border-slate-400/20 bg-slate-400/10 text-slate-400',
};

const variantClasses: Record<BadgeVariant, string> = {
  new:     'border-blue-400/40 bg-blue-400/10 text-blue-400',
  server:  'border-purple-400/20 bg-purple-400/10 text-purple-400',
  default: 'border-[#1f1f1f] bg-[#111] text-slate-500',
  category: '',
};

export default function Badge({ children, variant = 'default', category, className }: BadgeProps) {
  const colorClass =
    variant === 'category' && category ? categoryColors[category] : variantClasses[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}
