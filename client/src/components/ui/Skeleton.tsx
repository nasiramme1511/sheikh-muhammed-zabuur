interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({ className = '', variant = 'text', width, height, count = 1 }: SkeletonProps) {
  const baseClass = 'shimmer-bg rounded-lg';
  const variantClasses = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rect: 'rounded-xl',
    card: 'h-48 rounded-2xl',
  };

  const style = {
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} ${variantClasses[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
}
