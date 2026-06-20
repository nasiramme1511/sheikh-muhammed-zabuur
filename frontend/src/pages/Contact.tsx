import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, MessageSquare, Send, ExternalLink, Phone, Navigation, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';
import { siteSettings } from '../lib/api';
import LocationCard from '../components/LocationCard';
import toast from 'react-hot-toast';
import type { SiteSettings } from '../types';

export default function Contact() {
  const { t } = useTranslation();
  useSEO({ title: 'Contact', description: `Get in touch with ${t('app.title')}.` });

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    siteSettings.get().then(res => {
      if (res.data) setSettings(res.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(t('contact.sent_success'));
    setForm({ name: '', email: '', message: '' });
    setLoading(false);
  };

  const contactEmail = settings?.contactEmail || 'info@sheikhmohammedzabuur.com';
  const telegramLink = settings?.telegramLink || 'https://t.me/sheikhmohammedzabuur';
  const address = settings?.address || t('contact.address_value');
  const phone = settings?.phone || '';
  const googleMapEmbed = settings?.googleMapEmbed || '';
  const googleMapLink = settings?.googleMapLink || 'https://maps.google.com/?q=Ethiopia';

  return (
    <div className="pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('footer.contact_us')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.a
            href={`mailto:${contactEmail}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="glass-card-premium p-6 text-center block"
          >
            <div className="w-12 h-12 rounded-2xl bg-icc-500/10 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-icc-400" />
            </div>
            <h3 className="text-white font-medium mb-1">{t('contact.email')}</h3>
            <p className="text-sm text-white/50">{contactEmail}</p>
          </motion.a>

          <motion.a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-premium p-6 text-center block"
          >
            <div className="w-12 h-12 rounded-2xl bg-icc-500/10 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-icc-400" />
            </div>
            <h3 className="text-white font-medium mb-1">{t('contact.telegram')}</h3>
            <p className="text-sm text-white/50">@sheikhmohammedzabuur</p>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-premium p-6 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-icc-500/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-icc-400" />
            </div>
            <h3 className="text-white font-medium mb-1">{t('footer.contact_us')}</h3>
            <p className="text-sm text-white/50">{address}</p>
          </motion.div>
        </div>

        {/* Location Card */}
        <div className="mb-12">
          <LocationCard variant="full" />
        </div>

        {/* Google Maps */}
        {googleMapEmbed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-12"
          >
            <div className="glass-card-premium p-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={googleMapEmbed}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sheikh Mohammed Zabuur Location"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <a
                  href={googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-icc-500 text-white hover:bg-icc-600 transition-all text-sm font-semibold"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </a>
                <a
                  href={`${googleMapLink}?directions=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-12"
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

        {/* Telegram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="glass-card-premium p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-icc-500/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-icc-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join us on Telegram</h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Stay updated with the latest lectures, announcements, and Islamic content delivered straight to your device.
            </p>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icc inline-flex items-center gap-2 px-8 py-3"
            >
              <ExternalLink className="w-4 h-4" />
              Join Telegram Channel
            </a>
          </div>
        </motion.div>

        {/* WhatsApp / Call */}
        {phone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-all text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
            <a
              href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
