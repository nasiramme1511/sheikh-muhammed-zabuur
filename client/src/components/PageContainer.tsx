import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={`w-full min-w-0 overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] ${className}`}
    >
      {children}
    </div>
  );
}
