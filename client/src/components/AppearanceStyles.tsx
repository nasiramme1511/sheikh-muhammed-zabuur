import { useMemo } from 'react';
import { useAppearance } from '../context/AppearanceContext';

export default function AppearanceStyles() {
  const { settings } = useAppearance();

  const css = useMemo(() => {
    const s = settings;
    const shadowVal = 1 + (s.shadowStrength / 100) * 3;
    const behavior = s.backgroundBehavior === 'parallax' ? 'fixed' :
      s.backgroundBehavior === 'zoom' ? 'fixed' : s.backgroundBehavior;
    const attach = s.backgroundBehavior === 'parallax' ? 'fixed' :
      s.backgroundBehavior === 'zoom' ? 'fixed' : 'scroll';

    return `
:root {
  --app-primary: ${s.primaryColor};
  --app-secondary: ${s.secondaryColor};
  --app-accent: ${s.accentColor};
  --app-button: ${s.buttonColor};
  --app-link: ${s.linkColor};
  --app-font-family: ${s.fontFamily === 'Inter' ? "'Inter', sans-serif" :
    s.fontFamily === 'Poppins' ? "'Poppins', sans-serif" :
    s.fontFamily === 'Cairo' ? "'Cairo', sans-serif" :
    s.fontFamily === 'Noto Sans Arabic' ? "'Noto Sans Arabic', sans-serif" :
    s.fontFamily === 'Amiri' ? "'Amiri', serif" : "'Inter', sans-serif"};
  --app-font-size: ${s.fontSize}px;
  --app-heading-weight: ${s.headingWeight};
  --app-body-weight: ${s.bodyWeight};
  --app-bg-image: url("${s.backgroundImage}");
  --app-overlay-color: ${s.overlayColor};
  --app-overlay-opacity: ${s.overlayOpacity};
  --app-overlay-gradient: ${s.overlayGradient ? '1' : '0'};
  --app-blur: ${s.blurStrength}px;
  --app-card-radius: ${s.borderRadius}px;
  --app-card-shadow: 0 4px ${shadowVal * 6}px rgba(0,0,0,${0.08 + s.shadowStrength / 1000});
  --app-card-opacity: ${s.cardOpacity};
  --app-counter-color: ${s.counterColor};
  --app-animation-speed: ${s.animationSpeed}ms;
  --app-glass-effect: ${s.glassEffect ? '1' : '0'};
  --app-hover-animation: ${s.hoverAnimation ? '1' : '0'};
  --app-bg-behavior: ${behavior};
  --app-bg-attach: ${attach};
}
${s.backgroundBehavior === 'zoom' ? `
body.app-zoom-bg {
  animation: appZoomBg ${Math.max(s.animationSpeed / 1000, 10)}s ease-in-out infinite alternate;
}
@keyframes appZoomBg {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}
` : ''}
${!s.glassEffect ? `
.glass-card, .glass, [class*="glass"] {
  background: rgba(0,0,0,${s.cardOpacity}) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
}
` : ''}
${!s.hoverAnimation ? `
.group:hover .group-hover\\:scale-105,
.group:hover .group-hover\\:scale-110,
button:hover, a:hover {
  transform: none !important;
}
` : ''}
`;
  }, [settings]);

  return <style id="appearance-vars">{css}</style>;
}
