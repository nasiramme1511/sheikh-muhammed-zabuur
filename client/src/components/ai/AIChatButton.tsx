import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useAIChat } from '../../context/AIChatContext';
import { useTranslation } from '../../i18n';

export default function AIChatButton() {
  const { t } = useTranslation();
  const { isOpen, toggleChat, isStreaming } = useAIChat();

  return (
    <div className="fixed bottom-6 right-4 z-[99] flex flex-col items-end gap-3">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="mb-1"
          >
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-900 animate-pulse" />
              <div className="px-3 py-2 rounded-xl bg-dark-800/90 backdrop-blur-xl border border-white/10 shadow-xl whitespace-nowrap">
                <p className="text-xs font-medium text-icc-400">
                  <span className="text-emerald-400">{t('ai_assistant.title')}</span>
                </p>
              </div>
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-dark-800/90 border-r border-b border-white/10 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-shadow"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={
          isOpen
            ? { rotate: 0 }
            : {
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.4)',
                  '0 0 0 12px rgba(16, 185, 129, 0)',
                  '0 0 0 0 rgba(16, 185, 129, 0)',
                ],
              }
        }
        transition={
          isOpen
            ? { type: 'spring', stiffness: 300, damping: 20 }
            : {
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
        }
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #10B981, #059669)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}

        <div
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(220,38,38,0))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0))',
            filter: 'blur(12px)',
            zIndex: -1,
          }}
        />
      </motion.button>
    </div>
  );
}
