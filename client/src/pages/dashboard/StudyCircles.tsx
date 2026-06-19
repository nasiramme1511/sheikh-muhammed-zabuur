import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n';

const circles = [
  { name: 'Tafsiira Qur\'aanaa', icon: '📖', slug: 'tafsir-al-quran', desc: 'Detailed explanation of the Quran', schedule: 'Daily, 5:00 AM' },
  { name: 'Riyaadus Saalihiin', icon: '📖', slug: 'riyadhus-salihin', desc: 'Hadith on righteous conduct', schedule: 'Daily, 6:30 AM' },
  { name: 'Buluughul Maraam', icon: '📖', slug: 'bulugh-al-maram', desc: 'Hadith on Islamic jurisprudence', schedule: 'Daily, 8:00 AM' },
  { name: 'Usuulus Salaasaa', icon: '📖', slug: 'usul-ath-thalatha', desc: 'Three fundamental principles', schedule: 'Daily, 9:30 AM' },
  { name: 'Kitaabut Tawhiid', icon: '📖', slug: 'kitab-at-tawheed', desc: 'Islamic monotheism', schedule: 'Daily, 9:30 AM' },
  { name: 'Tajriid', icon: '📖', slug: 'tajweed', desc: 'Arabic grammar & morphology', schedule: 'Daily, 10:00 AM' },
  { name: 'Bayquuniyyah', icon: '📖', slug: 'hadith', desc: 'Hadith terminology', schedule: 'Weekly' },
  { name: 'Arba\'iina Nawawiyyah', icon: '📖', slug: 'riyadhus-salihin', desc: '40 Hadith of Imam Nawawi', schedule: 'Weekly' },
];

export default function StudyCircles() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-icc-400" /> My Study Circles
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {circles.length} circles
        </span>
      </div>

      <p className="text-sm text-white/50">
        Study circles currently taught by Sheikh Muhammed Zabuur at Iman Chercher Masjid.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {circles.map((circle, i) => (
          <motion.div
            key={circle.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-premium p-5 group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0">{circle.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1">{circle.name}</h3>
                <p className="text-xs text-white/50 mb-2">{circle.desc}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-icc-400">
                  <Clock className="w-3 h-3" /> {circle.schedule}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <Link to={`/collections/${circle.slug}`}
                className="flex items-center justify-between text-xs text-icc-400 hover:text-icc-300 transition-colors"
              >
                <span>Browse Resources</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
