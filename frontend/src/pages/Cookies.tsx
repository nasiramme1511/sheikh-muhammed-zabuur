import { Cookie, Settings, BarChart3, Shield, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';

export default function Cookies() {
  const { t } = useTranslation();
  useSEO({
    title: t('legal.cookies_title'),
    description: t('legal.cookies_intro_heading'),
    ogType: 'website',
    canonical: '/cookies',
    keywords: 'cookie policy, cookies, browser cookies, Islamic learning platform cookies, privacy preferences, cookie settings',
    structuredData: {
      '@type': 'WebPage',
      name: 'Cookie Policy - Sheikh Mohammed Zabuur',
      description: 'Cookie policy for Sheikh Mohammed Zabuur explaining how cookies are used and managed.',
      publisher: { '@type': 'Organization', name: 'Sheikh Mohammed Zabuur' },
      dateModified: '2026-06-01',
      inLanguage: ['en', 'ar', 'am', 'om'],
      isPartOf: { '@type': 'WebSite', name: 'Sheikh Mohammed Zabuur', url: 'https://sheikhmohammedzabuur.com' },
    },
  });

  const sections = [
    {
      icon: Settings,
      title: t('cookies.essential_title'),
      content: t('cookies.essential_content'),
      bullets: [
        t('cookies.essential_bullet_1'),
        t('cookies.essential_bullet_2'),
        t('cookies.essential_bullet_3'),
        t('cookies.essential_bullet_4'),
        t('cookies.essential_bullet_5'),
      ],
    },
    {
      icon: BarChart3,
      title: t('cookies.analytics_title'),
      content: t('cookies.analytics_content'),
      bullets: [
        t('cookies.analytics_bullet_1'),
        t('cookies.analytics_bullet_2'),
        t('cookies.analytics_bullet_3'),
        t('cookies.analytics_bullet_4'),
        t('cookies.analytics_bullet_5'),
      ],
    },
    {
      icon: Info,
      title: t('cookies.preference_title'),
      content: t('cookies.preference_content'),
      bullets: [
        t('cookies.preference_bullet_1'),
        t('cookies.preference_bullet_2'),
        t('cookies.preference_bullet_3'),
        t('cookies.preference_bullet_4'),
        t('cookies.preference_bullet_5'),
      ],
    },
    {
      icon: Shield,
      title: t('cookies.third_party_title'),
      content: t('cookies.third_party_content'),
      bullets: [
        t('cookies.third_party_bullet_1'),
        t('cookies.third_party_bullet_2'),
        t('cookies.third_party_bullet_3'),
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-icc-500/20 to-icc-600/20 border border-icc-500/20 flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-icc-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('legal.cookies_title')}</h1>
          <p className="text-white/50 text-sm">
            {t('legal.last_updated')}: June 2026
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-white/40">
            <span className="text-icc-400">{t('cookies.effective_date')}</span>
            <span className="text-white/10">|</span>
            <Link to="/privacy" className="hover:text-icc-400 transition-colors">{t('cookies.privacy_policy')}</Link>
            <span className="text-white/10">|</span>
            <Link to="/terms" className="hover:text-icc-400 transition-colors">{t('cookies.terms_of_service')}</Link>
          </div>
        </div>

        {/* Intro */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">{t('legal.cookies_intro_heading')}</h2>
          <p className="text-white/70 leading-relaxed">{t('legal.cookies_intro')}</p>
        </div>

        {/* Table: Cookie Overview */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">{t('cookies.overview_title')}</h2>
          <table className="w-full text-sm text-white/70">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 font-medium text-white">{t('cookies.overview_type')}</th>
                <th className="text-left py-2 pr-4 font-medium text-white">{t('cookies.overview_purpose')}</th>
                <th className="text-left py-2 font-medium text-white">{t('cookies.overview_duration')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">{t('cookies.overview_essential')}</td>
                <td className="py-2 pr-4">{t('cookies.overview_essential_purpose')}</td>
                <td className="py-2">{t('cookies.overview_essential_duration')}</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">{t('cookies.overview_analytics')}</td>
                <td className="py-2 pr-4">{t('cookies.overview_analytics_purpose')}</td>
                <td className="py-2">{t('cookies.overview_analytics_duration')}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">{t('cookies.overview_third_party')}</td>
                <td className="py-2 pr-4">{t('cookies.overview_third_party_purpose')}</td>
                <td className="py-2">{t('cookies.overview_third_party_duration')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center shrink-0">
                <section.icon className="w-6 h-6 text-icc-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-2">{section.title}</h2>
                <p className="text-white/70 leading-relaxed mb-4">{section.content}</p>
                {section.bullets && (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-white/60 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-icc-500/60 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* User Control */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6 text-icc-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">{t('legal.cookies_control_heading')}</h2>
              <p className="text-white/70 leading-relaxed mb-4">{t('legal.cookies_control')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-icc-500/60 shrink-0" />
                  <strong className="text-white/80">{t('cookies.chrome')}</strong>
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-icc-500/60 shrink-0" />
                  <strong className="text-white/80">{t('cookies.firefox')}</strong>
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-icc-500/60 shrink-0" />
                  <strong className="text-white/80">{t('cookies.safari')}</strong>
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-icc-500/60 shrink-0" />
                  <strong className="text-white/80">{t('cookies.edge')}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-white/30 text-xs">
          <p>{t('cookies.contact_footer')}<Link to="/contact" className="text-icc-400 hover:text-icc-300 transition-colors">{t('cookies.contact_us')}</Link>.</p>
        </div>
      </div>
    </div>
  );
}
