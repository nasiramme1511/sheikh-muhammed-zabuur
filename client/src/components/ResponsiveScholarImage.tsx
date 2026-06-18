import { useState } from 'react';
import { useTranslation } from '../i18n';
import { UserRound } from 'lucide-react';

interface ResponsiveScholarImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
}

export default function ResponsiveScholarImage({
  src,
  alt,
  className = '',
  width,
  height,
  fallback,
  srcSet,
  loading = 'lazy',
}: ResponsiveScholarImageProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return fallback ?? (
      <div
        className={`flex items-center justify-center bg-white/5 ${className}`}
        style={width && height ? { width, height } : undefined}
      >
        <UserRound className="w-1/2 h-1/2 text-white/30" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || t('common.sheikh_name')}
      className={`object-cover ${className}`}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      srcSet={srcSet}
      onError={() => setImgError(true)}
    />
  );
}
