import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show on iOS if not standalone after 2 visits
    const visits = parseInt(localStorage.getItem('install_visits') || '0');
    localStorage.setItem('install_visits', String(visits + 1));
    if (isIOS && !isStandalone && visits >= 2) {
      setTimeout(() => setShow(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShow(false);
        localStorage.setItem('install_dismissed', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('install_dismissed', 'true');
  };

  if (isStandalone || localStorage.getItem('install_dismissed') === 'true') return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 lg:bottom-4 right-4 z-50 max-w-xs w-full"
        >
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-dark-900/60 backdrop-blur-xl">
            <button onClick={dismiss} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center shrink-0">
                {isIOS ? <Smartphone className="w-5 h-5 text-icc-400" /> : <Monitor className="w-5 h-5 text-icc-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">Install App</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {isIOS
                    ? 'Tap Share → Add to Home Screen'
                    : 'Install for offline access'}
                </p>
              </div>
            </div>
            {!isIOS && deferredPrompt && (
              <button onClick={handleInstall} className="w-full py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <Download className="w-4 h-4" /> Install
              </button>
            )}
            {isIOS && (
              <button onClick={dismiss} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-all">
                Got it
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
