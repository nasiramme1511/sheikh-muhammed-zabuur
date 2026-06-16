import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'icc' | 'gold' | 'default';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const variantClasses = {
  icc: 'badge-icc',
  gold: 'badge-gold',
  default: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({ variant = 'default', size = 'md', children, className = '', icon }: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
}
