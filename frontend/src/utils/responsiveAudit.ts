export function runResponsiveAudit() {
  if (typeof window === 'undefined') return;
  
  // Only execute in development environments
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isDev) return;

  const runCheck = () => {
    const vw = window.innerWidth;
    const elements = document.querySelectorAll('*');

    elements.forEach((node) => {
      const el = node as HTMLElement;
      
      // Check scroll width overflow
      if (el.scrollWidth > vw && !el.classList.contains('overflow-x-auto') && !el.classList.contains('scroll-hidden')) {
        console.warn('[Responsive Audit] Element causing horizontal scroll:', el, `(scrollWidth: ${el.scrollWidth}px vs viewport: ${vw}px)`);
      }

      // Check bounding rect width
      const rect = el.getBoundingClientRect();
      if (rect.width > vw) {
        console.warn('[Responsive Audit] Element boundary wider than viewport:', el, `(width: ${rect.width}px)`);
      }

      // Check images missing max-width or width rules
      if (el.tagName === 'IMG') {
        const style = window.getComputedStyle(el);
        const hasMaxWidth = style.maxWidth && style.maxWidth !== 'none';
        const hasResponsiveWidth = style.width && (style.width.includes('%') || style.width === 'auto');
        if (!hasMaxWidth && !hasResponsiveWidth && el.offsetWidth > vw) {
          console.warn('[Responsive Audit] Unresponsive image element found:', el);
        }
      }

      // Check for fixed large pixel widths in style/className
      if (el.style.width && el.style.width.includes('px')) {
        const val = parseInt(el.style.width, 10);
        if (val > 320) {
          console.warn('[Responsive Audit] Inline fixed width width > 320px found:', el, el.style.width);
        }
      }
    });
  };

  // Run checks on load, resize, and periodically in background
  window.addEventListener('load', runCheck);
  window.addEventListener('resize', runCheck);
  
  // Periodic audit
  const interval = setInterval(runCheck, 5000);
  return () => {
    window.removeEventListener('load', runCheck);
    window.removeEventListener('resize', runCheck);
    clearInterval(interval);
  };
}
