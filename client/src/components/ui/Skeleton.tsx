interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const variantClasses = {
  text: 'h-4 rounded-lg',
  circle: 'rounded-full',
  rect: 'rounded-xl',
  card: 'rounded-2xl h-40',
};

export function Skeleton({ variant = 'text', width, height, count = 1, className = '' }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`animate-pulse bg-white/5 border border-white/5 ${variantClasses[variant]} ${className}`}
          style={{
            width: width || (variant === 'circle' ? '40px' : '100%'),
            height: height || (variant === 'circle' ? '40px' : variant === 'text' ? '16px' : variant === 'card' ? '160px' : '80px'),
          }}
        />
      ))}
    </>
  );
}
