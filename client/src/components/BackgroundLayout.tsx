import { ReactNode } from 'react';
import { useAppearance } from '../context/AppearanceContext';

interface BackgroundLayoutProps {
  children: ReactNode;
}

export default function BackgroundLayout({ children }: BackgroundLayoutProps) {
  const { settings } = useAppearance();

  const bgEnabled = settings.backgroundEnabled;

  const bgStyle = bgEnabled ? {
    backgroundImage: `url("${settings.backgroundImage}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed' as const,
  } : {};

  const overlayOpacity = bgEnabled && settings.enableOverlay ? settings.overlayOpacity : 0;
  const blurStyle = bgEnabled && settings.enableOverlay ? `${settings.blurStrength}px` : '0px';

  return (
    <div className="relative min-h-screen w-full flex flex-col transition-all duration-500" style={bgStyle}>
      {/* Site-wide dark overlay & blur */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-500 z-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          backdropFilter: `blur(${blurStyle}) brightness(${settings.brightness})`,
          WebkitBackdropFilter: `blur(${blurStyle}) brightness(${settings.brightness})`,
        }}
      />
      {/* Content wrapper */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
