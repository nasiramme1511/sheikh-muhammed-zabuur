import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Send, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { newsletter } from '../../lib/api';

export default function NewsletterSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await newsletter.subscribe(email.trim());
      setStatus('success');
      setMessage(res.data.message);
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Something went wrong. Please try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-icc-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-gold-500/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-icc-500/50 to-transparent" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-8 right-8 w-16 h-16"
          >
            <Sparkles className="w-full h-full text-icc-500/10" />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Mail className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('newsletter.badge')}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t('newsletter.title')} <span className="text-gradient-icc">{t('newsletter.title_highlight')}</span>
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            {t('newsletter.subtitle')}
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                required
                disabled={status === 'loading'}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="btn-icc px-6 py-3.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subscribing...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('newsletter.subscribe')}
                </>
              )}
            </button>
          </form>

          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-emerald-400 mt-4"
            >
              <CheckCircle className="w-4 h-4" /> {message || t('newsletter.success')}
            </motion.p>
          )}

          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-red-400 mt-4"
            >
              <AlertCircle className="w-4 h-4" /> {message}
            </motion.p>
          )}

          {status === 'idle' && (
            <p className="text-xs text-white/30 mt-4">
              {t('newsletter.no_spam')}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
