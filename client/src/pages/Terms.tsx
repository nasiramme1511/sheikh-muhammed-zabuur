import { FileText, Scale, BookOpen, UserCheck, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';

export default function Terms() {
  const { t } = useTranslation();
  useSEO({
    title: t('legal.terms_title'),
    description: t('legal.terms_intro'),
    ogType: 'website',
    canonical: '/terms',
    keywords: 'terms of service, Islamic learning platform terms, user agreement, Sheikh Mohammed Zabuur terms, platform rules',
    structuredData: {
      '@type': 'WebPage',
      name: 'Terms of Service - Sheikh Mohammed Zabuur Iman Chercher College',
      description: 'Terms of service for Sheikh Mohammed Zabuur Iman Chercher College outlining user responsibilities, intellectual property, and platform rules.',
      publisher: { '@type': 'Organization', name: 'Sheikh Mohammed Zabuur Iman Chercher College' },
      dateModified: '2026-06-01',
      inLanguage: ['en', 'ar', 'am', 'om'],
      isPartOf: { '@type': 'WebSite', name: 'Sheikh Mohammed Zabuur Iman Chercher College', url: 'https://shaykhmohammedzabuur.com' },
    },
  });

  const sections = [
    {
      icon: Scale,
      title: t('legal.terms_intro_heading'),
      content: t('legal.terms_intro'),
    },
    {
      icon: UserCheck,
      title: 'User Responsibilities & Conduct',
      content: 'As a user of this platform, you agree to use it responsibly and in accordance with Islamic manners (akhlaq). Violation of these rules may result in restricted access or account termination.',
      bullets: [
        'Respect platform rules and guidelines at all times',
        'No abuse, harassment, or disrespectful behavior toward others',
        'No spam, unsolicited messages, or promotional content',
        'No illegal activity or content that violates applicable laws',
        'No sharing of inappropriate or non-Islamic content',
        'No attempts to circumvent security measures or access restricted areas',
      ],
    },
    {
      icon: BookOpen,
      title: t('legal.terms_content_heading'),
      content: t('legal.terms_content'),
    },
    {
      icon: Shield,
      title: 'Intellectual Property Rights',
      content: 'All content on this platform is protected by copyright and intellectual property laws. Users may access content for personal educational use only. Reproduction, distribution, or commercial exploitation of platform content without explicit written permission is strictly prohibited.',
      bullets: [
        'Books and PDFs remain the property of their respective authors and publishers',
        'Audio lectures are the intellectual property of the respective teachers',
        'Video content may not be redistributed without permission',
        'Platform design, code, and branding are proprietary',
        'User-generated content (bookmarks, notes) remains owned by the user',
        'License granted to platform to display user content for educational purposes',
      ],
    },
    {
      icon: FileText,
      title: t('legal.terms_account_heading'),
      content: t('legal.terms_account'),
    },
    {
      icon: AlertTriangle,
      title: t('legal.terms_liability_heading'),
      content: t('legal.terms_liability'),
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('legal.terms_title')}</h1>
          <p className="text-white/50 text-sm">
            {t('legal.last_updated')}: June 2026
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-white/40">
            <span className="text-emerald-400">Effective: June 1, 2026</span>
            <span className="text-white/10">|</span>
            <Link to="/privacy" className="hover:text-icc-400 transition-colors">Privacy Policy</Link>
            <span className="text-white/10">|</span>
            <Link to="/cookies" className="hover:text-icc-400 transition-colors">Cookie Policy</Link>
          </div>
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
                {section.content && (
                  <p className="text-white/70 leading-relaxed mb-4">{section.content}</p>
                )}
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

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-sm">
            By using Sheikh Mohammed Zabuur Iman Chercher College, you agree to these terms. If you have questions, please <Link to="/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
