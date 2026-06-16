import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useTranslation, type TranslationKey } from '../../i18n';

interface SectionHeaderProps {
  badge?: string;
  badgeKey?: TranslationKey;
  title: string;
  titleKey?: TranslationKey;
  highlight?: string;
  highlightKey?: TranslationKey;
  subtitle?: string;
  subtitleKey?: TranslationKey;
  icon?: ReactNode;
  align?: 'left' | 'center';
  variant?: 'icc' | 'gold';
}

export function SectionHeader({
  badge,
  badgeKey,
  title,
  titleKey,
  highlight,
  highlightKey,
  subtitle,
  subtitleKey,
  icon,
  align = 'center',
  variant = 'gold',
}: SectionHeaderProps) {
  const { t } = useTranslation();
  const badgeText = badgeKey ? t(badgeKey) : badge;
  const titleText = titleKey ? t(titleKey) : title;
  const highlightText = highlightKey ? t(highlightKey) : highlight;
  const subtitleText = subtitleKey ? t(subtitleKey) : subtitle;

  const gradientClass = variant === 'gold' ? 'text-gradient-gold' : 'text-gradient-icc';
  const badgeVariant = variant === 'gold' ? 'bg-gold-500/10 border-gold-500/20 text-gold-300' : 'bg-icc-500/10 border-icc-500/20 text-icc-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      {badgeText && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 ${badgeVariant}`}>
          {icon && <span className="w-3.5 h-3.5">{icon}</span>}
          <span className="text-xs font-medium">{badgeText}</span>
        </div>
      )}
      <h2 className="section-title">
        {titleText}{' '}
        {highlightText && <span className={gradientClass}>{highlightText}</span>}
      </h2>
      {subtitleText && (
        <p className="section-subtitle">{subtitleText}</p>
      )}
    </motion.div>
  );
}
