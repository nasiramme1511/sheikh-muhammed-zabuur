import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';

export default function NotFound() {
  useSEO({
    title: '404 - Not Found',
    description: 'The page you are looking for does not exist on Sheikh Mohammed Zabuur.',
  });

  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-icc-500/10 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-6"
        >
          🌙
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/60 mb-8">{t('common.not_found')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-icc px-8 py-4">
            <Home className="w-5 h-5" /> {t('common.back_to_home')}
          </Link>
          <Link to="/search" className="btn-outline px-8 py-4">
            <Search className="w-5 h-5" /> {t('nav.search_label')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
