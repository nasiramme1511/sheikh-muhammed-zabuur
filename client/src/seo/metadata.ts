import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  keywords?: string;
  structuredData?: Record<string, any>;
}

const DEFAULT_DESCRIPTION = 'Sheikh Mohammed Zabuur Iman Chercher College - Authentic Islamic education platform. Learn Aqeedah, Tafsir, Hadith, Fiqh and more from qualified Sunni teachers.';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_NAME = 'Sheikh Mohammed Zabuur Iman Chercher College';
const SITE_URL = 'https://shaykhmohammedzabuur.com';

export function useSEO({ title, description, ogImage = DEFAULT_IMAGE, ogType = 'website', canonical, keywords, structuredData }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', description);
    setMeta('keywords', keywords || 'Islamic education, Quran, Sunnah, Aqeedah, Tafsir, Hadith, Fiqh, Tajweed, online learning, Sheikh Mohammed Zabuur');
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:url', canonical || window.location.href, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = `${SITE_URL}${canonical}`;
    }

    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-dynamic]') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic', '');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...structuredData,
      });
    }
  }, [title, description, ogImage, ogType, canonical, keywords, structuredData]);
}