let activeLocks = 0;

function getScrollbarWidth(): number {
  if (typeof document === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  activeLocks++;
  if (activeLocks === 1) {
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('body-scroll-locked');
  }
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  activeLocks = Math.max(0, activeLocks - 1);
  if (activeLocks === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('body-scroll-locked');
  }
}
