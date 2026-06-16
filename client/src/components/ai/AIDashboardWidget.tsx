import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { useAIChat } from '../../context/AIChatContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../i18n';

const quickActions = [
  { icon: BookOpen, labelKey: 'ai_assistant.quick_continue' as const, promptKey: 'ai_assistant.learn_continue' as const },
  { icon: Lightbulb, labelKey: 'ai_assistant.quick_reminder' as const, promptKey: 'ai_assistant.reminder_prompt' as const },
  { icon: Sparkles, labelKey: 'ai_assistant.quick_recommend' as const, promptKey: 'ai_assistant.recommend_prompt' as const },
];

export default function AIDashboardWidget() {
  const { t } = useTranslation();
  const { sendMessage, isStreaming, openChat } = useAIChat();
  const { language } = useLanguage();
  const [input, setInput] = useState('');

  const handleQuickAction = async (prompt: string) => {
    openChat();
    setTimeout(() => sendMessage(prompt), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    openChat();
    setTimeout(() => sendMessage(msg), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card-premium p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-icc-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('ai_assistant.title')}</h3>
            <p className="text-[11px] text-white/40">{t('ai_assistant.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={openChat}
          className="text-xs text-icc-400 hover:text-icc-300 flex items-center gap-1 transition-colors"
        >
          {t('ai_assistant.open_chat')} <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.labelKey}
              onClick={() => handleQuickAction(t(action.promptKey))}
              disabled={isStreaming}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-icc-500/10 border border-white/5 hover:border-icc-500/20 transition-all group disabled:opacity-40"
            >
              <Icon className="w-4 h-4 text-icc-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-white/50 group-hover:text-white/80 text-center leading-tight">
                {t(action.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ai_assistant.ask_anything')}
          className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-icc-500/40 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-icc-500/20 flex items-center justify-center disabled:opacity-30"
        >
          <Send className="w-3.5 h-3.5 text-icc-400" />
        </button>
      </form>
    </motion.div>
  );
}
