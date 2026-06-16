import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useTranslation } from '../i18n';

interface LoginWallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginWallModal({ isOpen, onClose }: LoginWallModalProps) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('login_wall.title')}</h2>
            <p className="text-sm text-white/60 mb-7 leading-relaxed">
              {t('login_wall.description')}
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                {t('nav.sign_in')}
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all border border-white/10"
              >
                {t('nav.register')}
              </Link>
            </div>
            <button
              onClick={onClose}
              className="mt-5 text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              {t('login_wall.continue_browsing')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
