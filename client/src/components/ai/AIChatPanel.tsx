import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { useAIChat } from '../../context/AIChatContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../i18n';
import ChatMessage from './ChatMessage';
import AITypingIndicator from './AITypingIndicator';
import QuickPrompts from './QuickPrompts';

export default function AIChatPanel() {
  const {
    isOpen,
    closeChat,
    messages,
    isStreaming,
    sendMessage,
    regenerate,
    clearChat,
    suggestions,
  } = useAIChat();
  const { t } = useTranslation();
  const { language, dir } = useLanguage();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput('');
    sendMessage(prompt);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const isEmpty = messages.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-4 z-[100] w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-120px)]
            rounded-2xl overflow-hidden
            bg-dark-800/95 backdrop-blur-2xl
            border border-white/10 shadow-2xl shadow-dark-900/60
            flex flex-col"
          dir={dir}
        >
          <div className="relative px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-icc-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-icc-500/20">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  <span className="text-emerald-400">{t('ai_assistant.title')}</span>
                </h3>
                <p className="text-[10px] text-white/40">{isStreaming ? t('ai_assistant.thinking') : t('ai_assistant.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title={t('ai_assistant.clear_chat')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-icc-500/50 to-transparent" />
          </div>

          <div className="flex-1 overflow-y-auto scroll-hidden">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-icc-500/20 to-emerald-600/20 flex items-center justify-center border border-icc-500/10">
                    <Sparkles className="w-10 h-10 text-icc-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-dark-800 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {language === 'ar' ? 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ' : 'Assalamu Alaykum \uD83D\uDC4B'}
                </h4>
                <p className="text-sm text-white/50 leading-relaxed max-w-[260px] mb-3">
                  {t('ai_assistant.empty_desc')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Aqeedah
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Tafsir
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Hadith
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Fiqh
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Seerah
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Tajweed
                  </span>
                </div>
                <div className="w-full">
                  <QuickPrompts
                    prompts={suggestions.length > 0 ? suggestions : [
                      t('ai_assistant.prompt_where_start'),
                      t('ai_assistant.prompt_best_lessons'),
                      t('ai_assistant.prompt_tafsir'),
                      t('ai_assistant.prompt_aqeedah'),
                    ]}
                    onSelect={handleQuickPrompt}
                    isStreaming={isStreaming}
                  />
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLast={i === messages.length - 1}
                  />
                ))}
                {isStreaming && <AITypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {!isEmpty && !isStreaming && messages[messages.length - 1]?.role === 'assistant' && (
            <div className="px-4 py-1.5 border-t border-white/5">
              <button
                onClick={regenerate}
                className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-icc-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {t('ai_assistant.regenerate')}
              </button>
            </div>
          )}

          {!isEmpty && suggestions.length > 0 && !isStreaming && (
            <QuickPrompts
              prompts={suggestions.slice(0, 4)}
              onSelect={handleQuickPrompt}
              isStreaming={isStreaming}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="px-3 py-3 border-t border-white/5 bg-dark-900/50 shrink-0"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai_assistant.input_placeholder')}
                  rows={1}
                  className="w-full px-3 py-2.5 pr-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-icc-500/40 focus:ring-1 focus:ring-icc-500/20 transition-all resize-none scroll-hidden"
                  disabled={isStreaming}
                  dir={dir === 'rtl' ? 'rtl' : 'ltr'}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-emerald-600 flex items-center justify-center shrink-0
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-icc-500/20 transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
