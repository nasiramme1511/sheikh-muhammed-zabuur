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
      name: 'Cookie Policy - Sheikh Mohammed Zabuur Iman Chercher College',
      description: 'Cookie policy for Sheikh Mohammed Zabuur Iman Chercher College explaining how cookies are used and managed.',
      publisher: { '@type': 'Organization', name: 'Sheikh Mohammed Zabuur Iman Chercher College' },
      dateModified: '2026-06-01',
      inLanguage: ['en', 'ar', 'am', 'om'],
      isPartOf: { '@type': 'WebSite', name: 'Sheikh Mohammed Zabuur Iman Chercher College', url: 'https://shaykhmohammedzabuur.com' },
    },
  });

  const sections = [
    {
      icon: Settings,
      title: 'Essential Cookies',
      content: 'These cookies are strictly necessary for the platform to function properly. They enable core features such as secure login authentication, language preferences, theme selection (dark/light mode), and bookmark storage. Without these cookies, essential platform services cannot be provided.',
      bullets: ['Authentication and session management', 'Language and region preferences', 'Theme and display preferences', 'Bookmark and progress storage', 'Security and anti-fraud protection'],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Performance Cookies',
      content: 'These cookies help us understand how users interact with the platform, allowing us to continuously improve the learning experience. All data collected is anonymized and aggregated. We use this information to identify popular content, detect issues, and optimize platform performance.',
      bullets: ['Learning progress and engagement tracking', 'Usage statistics and behavioral patterns', 'Content popularity and effectiveness analysis', 'Feature usage and performance monitoring', 'Error detection and debugging'],
    },
    {
      icon: Info,
      title: 'Preference Cookies',
      content: 'These cookies remember your choices to provide a personalized experience. They store your selected language, preferred theme mode, accessibility settings, and content display preferences so you don\'t have to reconfigure them on each visit.',
      bullets: ['Selected language (English, Arabic, Amharic, Oromo)', 'Dark/light theme preference', 'Audio playback speed and volume', 'Last-visited page and scroll position', 'Content display and layout preferences'],
    },
    {
      icon: Shield,
      title: 'Third-Party Cookies',
      content: 'Some content on our platform, such as embedded YouTube videos, may set their own cookies. We do not control these cookies. You should review the privacy policies of these third-party services for more information about their data practices.',
      bullets: ['YouTube embedded video player cookies', 'Google Fonts performance cookies', 'External link tracking (if applicable)'],
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('legal.cookies_title')}</h1>
          <p className="text-white/50 text-sm">
            {t('legal.last_updated')}: June 2026
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-white/40">
            <span className="text-emerald-400">Effective: June 1, 2026</span>
            <span className="text-white/10">|</span>
            <Link to="/privacy" className="hover:text-icc-400 transition-colors">Privacy Policy</Link>
            <span className="text-white/10">|</span>
            <Link to="/terms" className="hover:text-icc-400 transition-colors">Terms of Service</Link>
          </div>
        </div>

        {/* Intro */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">{t('legal.cookies_intro_heading')}</h2>
          <p className="text-white/70 leading-relaxed">{t('legal.cookies_intro')}</p>
        </div>

        {/* Table: Cookie Overview */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8 mb-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Cookie Overview</h2>
          <table className="w-full text-sm text-white/70">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 font-medium text-white">Type</th>
                <th className="text-left py-2 pr-4 font-medium text-white">Purpose</th>
                <th className="text-left py-2 font-medium text-white">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Essential</td>
                <td className="py-2 pr-4">Authentication, preferences</td>
                <td className="py-2">Session / 1 year</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Analytics</td>
                <td className="py-2 pr-4">Usage tracking, optimization</td>
                <td className="py-2">30 days</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Third-Party</td>
                <td className="py-2 pr-4">Embedded content</td>
                <td className="py-2">Varies</td>
              </tr>
            </tbody>
          </table>
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

        {/* User Control */}
        <div className="glass-card-dark rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">{t('legal.cookies_control_heading')}</h2>
              <p className="text-white/70 leading-relaxed mb-4">{t('legal.cookies_control')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  <strong className="text-white/80">Chrome:</strong> Settings → Privacy and Security → Cookies
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  <strong className="text-white/80">Firefox:</strong> Options → Privacy & Security → Cookies
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  <strong className="text-white/80">Safari:</strong> Preferences → Privacy → Cookies
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  <strong className="text-white/80">Edge:</strong> Settings → Site Permissions → Cookies
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-white/30 text-xs">
          <p>For questions about our cookie usage, please <Link to="/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors">contact us</Link>.</p>
        </div>
      </div>
    </div>
  );
}
