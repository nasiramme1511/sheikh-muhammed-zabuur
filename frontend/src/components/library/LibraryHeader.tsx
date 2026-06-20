import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LibraryHeaderProps {
  badge: string;
  heading: string;
  description: string;
}

export default function LibraryHeader({ badge, heading, description }: LibraryHeaderProps) {
  return (
    <div className="text-center mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {badge}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
      >
        {heading}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/60 max-w-2xl mx-auto text-base"
      >
        {description}
      </motion.p>
    </div>
  );
}