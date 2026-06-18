import React, { useState, useEffect } from 'react';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  fallbackSrc?: string;
}

export default function ResponsiveImage({
  src,
  alt,
  aspectRatio = 'aspect-auto',
  className = '',
  fallbackSrc = '/logo.svg',
  loading = 'lazy',
  ...props
}: ResponsiveImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatio} ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        className="w-full h-full object-cover block"
        {...props}
      />
    </div>
  );
}
