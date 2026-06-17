import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark' | 'glass-premium' | 'shimmer';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const variantMap = {
  'glass': 'glass',
  'glass-dark': 'glass-card-dark',
  'glass-premium': 'glass-premium',
  'shimmer': 'shimmer-bg',
};

const paddingMap = {
  'none': '',
  'sm': 'p-4',
  'md': 'p-6',
  'lg': 'p-8',
};

export function Card({
  variant = 'glass-premium',
  hover = true,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`${variantMap[variant]} ${paddingMap[padding]} rounded-2xl border border-white/5 ${hover ? 'hover:border-icc-500/30 hover:shadow-lg hover:shadow-icc-500/5 hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
