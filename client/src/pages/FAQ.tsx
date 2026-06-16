import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../i18n';
import { useSEO } from '../seo/metadata';

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [
  { q: 'faq.q_what_is' as TranslationKey, a: 'faq.a_what_is' as TranslationKey },
  { q: 'faq.q_free' as TranslationKey, a: 'faq.a_free' as TranslationKey },
  { q: 'faq.q_account' as TranslationKey, a: 'faq.a_account' as TranslationKey },
  { q: 'faq.q_subjects' as TranslationKey, a: 'faq.a_subjects' as TranslationKey },
  { q: 'faq.q_teachers' as TranslationKey, a: 'faq.a_teachers' as TranslationKey },
  { q: 'faq.q_start' as TranslationKey, a: 'faq.a_start' as TranslationKey },
  { q: 'faq.q_languages' as TranslationKey, a: 'faq.a_languages' as TranslationKey },
  { q: 'faq.q_download' as TranslationKey, a: 'faq.a_download' as TranslationKey },
  { q: 'faq.q_mobile' as TranslationKey, a: 'faq.a_mobile' as TranslationKey },
  { q: 'faq.q_support' as TranslationKey, a: 'faq.a_support' as TranslationKey },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`glass rounded-2xl border transition-all duration-300 ${open ? 'border-icc-500/30 bg-icc-500/5' : 'border-white/5 bg-white/[0.02]'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();
  useSEO({ title: 'FAQ', description: `Frequently asked questions about ${t('app.title')} platform.` });

  return (
    <div className="pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-icc-500/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('faq.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('faq.title')}</h1>
          <p className="text-lg text-white/60">{t('faq.subtitle')}</p>
        </motion.div>

        <div className="space-y-3">
          {faqKeys.map((faq, i) => (
            <FAQItem key={i} question={t(faq.q)} answer={t(faq.a)} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
