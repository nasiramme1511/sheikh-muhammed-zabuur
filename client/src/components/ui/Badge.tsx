import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'icc' | 'gold' | 'default';
  size?: 'sm' | 'md';
  children?: ReactNode;
  className?: string;
}

const variantClasses = {
  icc: 'bg-icc-500/10 text-icc-400 border-icc-500/20',
  gold: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
  default: 'bg-white/5 text-white/60 border-white/10',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({ variant = 'default', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
