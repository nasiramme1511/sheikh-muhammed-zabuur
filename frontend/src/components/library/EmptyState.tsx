import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  animation?: 'rotate' | 'bounce' | 'spin3d';
  title: string;
  description: string;
  showClear: boolean;
  clearLabel: string;
  onClear: () => void;
}

function getAnimation(anim: string) {
  switch (anim) {
    case 'rotate':
      return { rotate: [0, 10, -10, 0] };
    case 'bounce':
      return { y: [0, -8, 0] };
    case 'spin3d':
      return { rotateY: [0, 180, 360] };
    default:
      return {};
  }
}

function getTransition(anim: string) {
  switch (anim) {
    case 'rotate':
      return { duration: 4, repeat: Infinity, ease: 'easeInOut' };
    case 'bounce':
      return { duration: 3, repeat: Infinity, ease: 'easeInOut' };
    case 'spin3d':
      return { duration: 6, repeat: Infinity, ease: 'linear' };
    default:
      return {};
  }
}

export default function EmptyState({ icon, animation = 'rotate', title, description, showClear, clearLabel, onClear }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-icc-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-icc-500/10 to-icc-600/10 border border-icc-500/10 flex items-center justify-center"
        >
          <motion.div
            animate={getAnimation(animation)}
            transition={getTransition(animation)}
            style={animation === 'spin3d' ? { transformStyle: 'preserve-3d' } : undefined}
          >
            {icon}
          </motion.div>
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white/80 mb-3"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/40 max-w-md mx-auto mb-8 leading-relaxed"
        >
          {description}
        </motion.p>
        {showClear && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={onClear}
              className="px-5 py-2.5 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-400 hover:bg-icc-500/20 transition-all text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <Filter className="w-4 h-4" />
              {clearLabel}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}