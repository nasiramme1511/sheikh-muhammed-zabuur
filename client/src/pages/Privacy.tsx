import { Shield, Eye, Lock, Mail, BookOpen, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';

export default function Privacy() {
  const { t } = useTranslation();
  useSEO({
    title: t('legal.privacy_title'),
    description: t('legal.privacy_intro'),
    ogType: 'website',
    canonical: '/privacy',
    keywords: 'privacy policy, data protection, Islamic learning platform privacy, Sheikh Mohammed Zabuur privacy, data security',
    structuredData: {
      '@type': 'WebPage',
      name: 'Privacy Policy - Sheikh Mohammed Zabuur Iman Chercher College',
      description: 'Privacy policy for Sheikh Mohammed Zabuur Iman Chercher College detailing how user data is collected, used, and protected.',
      publisher: { '@type': 'Organization', name: 'Sheikh Mohammed Zabuur Iman Chercher College' },
      dateModified: '2026-06-01',
      inLanguage: ['en', 'ar', 'am', 'om'],
      isPartOf: { '@type': 'WebSite', name: 'Sheikh Mohammed Zabuur Iman Chercher College', url: 'https://sheikhmohammedzabuur.com' },
    },
  });

  const sections = [
    {
      icon: Eye,
      title: t('legal.privacy_data_heading'),
      content: t('legal.privacy_data'),
      bullets: ['Account Information (name, email)', 'Bookmarks & Favorites', 'Downloads History', 'Learning Progress & Activity', 'Email Subscriptions', 'Communication Records'],
    },
    {
      icon: Lock,
      title: 'Data Security & Protection',
      content: 'Your information is protected using industry-standard security measures. All passwords are encrypted using bcrypt hashing algorithms. Data is transmitted over HTTPS with TLS encryption. We never sell, trade, or share your personal information with third parties for their marketing purposes. Access to personal data is restricted to authorized personnel only.',
      bullets: ['256-bit SSL/TLS encryption for all data transmission', 'Bcrypt password hashing with salt rounds', 'Regular security audits and monitoring', 'Strict access controls for admin personnel', 'GDPR-compliant data handling practices'],
    },
    {
      icon: BookOpen,
      title: t('legal.privacy_usage_heading'),
      content: t('legal.privacy_usage'),
    },
    {
      icon: FileText,
      title: t('legal.privacy_cookies_heading'),
      content: t('legal.privacy_cookies'),
      bullets: ['Essential session cookies for authentication', 'Preference cookies for language and theme', 'Analytics cookies for platform improvement', 'Third-party cookies from embedded content'],
    },
    {
      icon: Mail,
      title: 'Contact & Data Requests',
      content: 'If you have any questions about this privacy policy or wish to exercise your data rights, please reach out through our official channels. We aim to respond to all data-related inquiries within 72 hours.',
      bullets: ['Submit inquiries via the Contact page', 'Email the data protection team directly', 'Request data export through account settings', 'Request account deletion at any time'],
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('legal.privacy_title')}</h1>
          <p className="text-white/50 text-sm">
            {t('legal.last_updated')}: June 2026
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-white/40">
            <span className="text-emerald-400">Effective: June 1, 2026</span>
            <span className="text-white/10">|</span>
            <Link to="/terms" className="hover:text-icc-400 transition-colors">Terms of Service</Link>
            <span className="text-white/10">|</span>
            <Link to="/cookies" className="hover:text-icc-400 transition-colors">Cookie Policy</Link>
          </div>
        </div>

        {/* Intro */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">{t('legal.privacy_intro_heading')}</h2>
          <p className="text-white/70 leading-relaxed">{t('legal.privacy_intro')}</p>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <section.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-2">{section.title}</h2>
                <p className="text-white/70 leading-relaxed mb-4">{section.content}</p>
                {section.bullets && (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-white/60 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Rights */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">{t('legal.privacy_rights_heading')}</h2>
              <p className="text-white/70 leading-relaxed mb-4">{t('legal.privacy_rights')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  Right to Access — Request a copy of your personal data
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  Right to Rectification — Correct inaccurate data
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  Right to Deletion — Request account and data removal
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  Right to Portability — Export your data in a common format
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-white/30 text-xs">
          <p>For any privacy-related concerns, please <Link to="/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors">contact us</Link> or review our <Link to="/faq" className="text-emerald-400 hover:text-emerald-300 transition-colors">FAQ</Link>.</p>
        </div>
      </div>
    </div>
  );
}
