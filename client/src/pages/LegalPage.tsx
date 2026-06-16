import { Link } from 'react-router-dom';
import { Shield, FileText, Cookie, ArrowLeft } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../i18n';
import { useSEO } from '../seo/metadata';

interface Props {
  slug: string;
}

const pages: Record<string, { icon: typeof Shield; titleKey: TranslationKey; lastUpdated: string }> = {
  privacy: { icon: Shield, titleKey: 'legal.privacy_title' as TranslationKey, lastUpdated: 'May 28, 2026' },
  terms: { icon: FileText, titleKey: 'legal.terms_title' as TranslationKey, lastUpdated: 'May 28, 2026' },
  cookies: { icon: Cookie, titleKey: 'legal.cookies_title' as TranslationKey, lastUpdated: 'May 28, 2026' },
};

const privacySections: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { titleKey: 'legal.privacy_intro_heading' as TranslationKey, bodyKey: 'legal.privacy_intro' as TranslationKey },
  { titleKey: 'legal.privacy_data_heading' as TranslationKey, bodyKey: 'legal.privacy_data' as TranslationKey },
  { titleKey: 'legal.privacy_usage_heading' as TranslationKey, bodyKey: 'legal.privacy_usage' as TranslationKey },
  { titleKey: 'legal.privacy_cookies_heading' as TranslationKey, bodyKey: 'legal.privacy_cookies' as TranslationKey },
  { titleKey: 'legal.privacy_rights_heading' as TranslationKey, bodyKey: 'legal.privacy_rights' as TranslationKey },
];

const termsSections: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { titleKey: 'legal.terms_intro_heading' as TranslationKey, bodyKey: 'legal.terms_intro' as TranslationKey },
  { titleKey: 'legal.terms_account_heading' as TranslationKey, bodyKey: 'legal.terms_account' as TranslationKey },
  { titleKey: 'legal.terms_content_heading' as TranslationKey, bodyKey: 'legal.terms_content' as TranslationKey },
  { titleKey: 'legal.terms_conduct_heading' as TranslationKey, bodyKey: 'legal.terms_conduct' as TranslationKey },
  { titleKey: 'legal.terms_liability_heading' as TranslationKey, bodyKey: 'legal.terms_liability' as TranslationKey },
];

const cookiesSections: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { titleKey: 'legal.cookies_intro_heading' as TranslationKey, bodyKey: 'legal.cookies_intro' as TranslationKey },
  { titleKey: 'legal.cookies_types_heading' as TranslationKey, bodyKey: 'legal.cookies_types' as TranslationKey },
  { titleKey: 'legal.cookies_control_heading' as TranslationKey, bodyKey: 'legal.cookies_control' as TranslationKey },
];

function Section({ titleKey, bodyKey }: { titleKey: TranslationKey; bodyKey: TranslationKey }) {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{t(titleKey)}</h2>
      <div className="text-sm text-white/70 leading-relaxed space-y-2">
        <p>{t(bodyKey)}</p>
      </div>
    </section>
  );
}

export default function LegalPage({ slug }: Props) {
  const { t } = useTranslation();
  const page = pages[slug] || pages.privacy;
  const Icon = page.icon;

  useSEO({
    title: t(page.titleKey),
    description: `Legal information for ${t('app.title')} - ${t(page.titleKey)}`,
  });

  const sections = slug === 'terms' ? termsSections : slug === 'cookies' ? cookiesSections : privacySections;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-icc-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('nav.home')}
        </Link>

        <div className="glass-card-premium p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-icc-500/20 to-emerald-600/20 flex items-center justify-center border border-icc-500/10">
              <Icon className="w-7 h-7 text-icc-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t(page.titleKey)}</h1>
              <p className="text-sm text-white/40 mt-1">
                {t('legal.last_updated')}: {page.lastUpdated}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <Section key={section.titleKey} titleKey={section.titleKey} bodyKey={section.bodyKey} />
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="flex flex-wrap gap-3">
              {Object.entries(pages).map(([key, p]) => {
                if (key === slug) return null;
                const PIcon = p.icon;
                return (
                  <Link
                    key={key}
                    to={`/${key}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-icc-500/10 border border-white/5 hover:border-icc-500/20 text-sm text-white/50 hover:text-icc-400 transition-all"
                  >
                    <PIcon className="w-4 h-4" />
                    {t(p.titleKey)}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
