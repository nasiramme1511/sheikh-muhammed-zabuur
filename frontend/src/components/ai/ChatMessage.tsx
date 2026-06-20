import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../context/AIChatContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../i18n';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
}

export default function ChatMessage({ message, isLast }: ChatMessageProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { dir } = useLanguage();
  const isUser = message.role === 'user';
  const isError = message.content.startsWith('\u26A0\uFE0F');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content.replace(/^\u26A0\uFE0F /, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const renderContent = (text: string) => {
    const cleanText = text.replace(/^\u26A0\uFE0F /, '');
    const lines = cleanText.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-base font-bold text-white mt-3 mb-1.5">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-sm font-semibold text-white/90 mt-2 mb-1">
            {line.slice(4)}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="text-sm text-white/80 ml-4 list-disc">
            {line.slice(2)}
          </li>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="text-sm font-bold text-white mt-1">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      const withBold = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-white font-semibold">$1</strong>'
      );
      return (
        <p
          key={i}
          className="text-sm text-white/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: withBold }}
        />
      );
    });
  };

  return (
    <motion.div
      initial={isLast ? { opacity: 0, y: 12 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-3 px-4 py-3 ${
        isUser ? '' : 'bg-white/[0.02]'
      }`}
      dir={dir}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-gold-500 to-amber-600 shadow-gold-500/20'
            : 'bg-gradient-to-br from-icc-500 to-icc-600 shadow-icc-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0 group">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold ${isUser ? 'text-gold-400' : 'text-icc-400'}`}>
            {isUser ? t('ai_assistant.you') : t('ai_assistant.title')}
          </span>
          <span className="text-[10px] text-white/30">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={`space-y-0.5 ${isError ? 'text-red-400' : ''}`}>
          {renderContent(message.content)}
        </div>

        {!isUser && !isError && (
          <button
            onClick={handleCopy}
            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-icc-400" />
                <span className="text-icc-400">{t('ai_assistant.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{t('ai_assistant.copy')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
