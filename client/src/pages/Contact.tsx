import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Sparkles, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';
import toast from 'react-hot-toast';

const contactMethods = [
  { icon: Mail, labelKey: 'contact.email' as const, value: 'info@shaykhmohammedzabuur.com', href: 'mailto:info@shaykhmohammedzabuur.com' },
  { icon: MessageSquare, labelKey: 'contact.telegram' as const, value: '@Sheikh_Mohammed_Zabuur', href: 'https://t.me/Sheikh_Mohammed_Zabuur' },
  { icon: MapPin, labelKey: 'footer.contact_us' as const, valueKey: 'contact.address_value' as const, href: '#' },
];

export default function Contact() {
  const { t } = useTranslation();
  useSEO({ title: 'Contact', description: `Get in touch with ${t('app.title')}.` });

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(t('contact.sent_success'));
    setForm({ name: '', email: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('footer.contact_us')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('footer.contact_us')}</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, i) => {
            const Icon = method.icon;
            return (
              <motion.a
                key={i}
                href={method.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-premium p-6 text-center block"
              >
                <div className="w-12 h-12 rounded-2xl bg-icc-500/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-icc-400" />
                </div>
                <h3 className="text-white font-medium mb-1">{t(method.labelKey)}</h3>
                <p className="text-sm text-white/50">{'valueKey' in method ? t((method as any).valueKey) : method.value}</p>
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="glass-card-premium p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('auth.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 transition-all text-sm"
                placeholder={t('auth.name_placeholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 transition-all text-sm"
                placeholder={t('auth.email_placeholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('contact.message_label')}</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 transition-all text-sm resize-none"
                placeholder={t('contact.message_placeholder')}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-icc w-full py-3.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  {t('common.loading')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Send className="w-4 h-4" /> {t('contact.send_message')}</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
