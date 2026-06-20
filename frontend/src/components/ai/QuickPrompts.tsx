import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface QuickPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  isStreaming: boolean;
}

export default function QuickPrompts({ prompts, onSelect, isStreaming }: QuickPromptsProps) {
  const { t } = useTranslation();
  if (prompts.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
          {t('ai_assistant.suggestions')}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(prompt)}
            disabled={isStreaming}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              bg-white/5 hover:bg-icc-500/15 border border-white/5 hover:border-icc-500/30
              text-white/60 hover:text-icc-300
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
