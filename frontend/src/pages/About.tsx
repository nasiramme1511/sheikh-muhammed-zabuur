import { motion } from 'framer-motion';
import { BookOpen, Award, Globe, Sparkles, Shield, MapPin, CheckCircle, Clock, BookMarked, Headphones, Target, Heart } from 'lucide-react';
import { useSEO } from '../seo/metadata';
import { useTranslation } from '../i18n';

export default function About() {
  const { t } = useTranslation();
  const MORNING_CLASSES = [
    t('about.morning_classes_list_item_1'),
    t('about.morning_classes_list_item_2'),
    t('about.morning_classes_list_item_3'),
    t('about.morning_classes_list_item_4'),
    t('about.morning_classes_list_item_5'),
  ];
  const ADVANCED_STUDIES = [
    t('about.advanced_studies_list_item_1'),
    t('about.advanced_studies_list_item_2'),
    t('about.advanced_studies_list_item_3'),
    t('about.advanced_studies_list_item_4'),
    t('about.advanced_studies_list_item_5'),
    t('about.advanced_studies_list_item_6'),
    t('about.advanced_studies_list_item_7'),
    t('about.advanced_studies_list_item_8'),
  ];
  const METHODOLOGY_LIST = [
    t('about.methodology_list_item_1'),
    t('about.methodology_list_item_2'),
    t('about.methodology_list_item_3'),
    t('about.methodology_list_item_4'),
    t('about.methodology_list_item_5'),
    t('about.methodology_list_item_6'),
  ];
  const MEDIA_LIST = [
    t('about.media_library_list_1'),
    t('about.media_library_list_2'),
    t('about.media_library_list_3'),
    t('about.media_library_list_4'),
    t('about.media_library_list_5'),
  ];
  const PURPOSE_LIST = [
    t('about.purpose_list_1'),
    t('about.purpose_list_2'),
    t('about.purpose_list_3'),
    t('about.purpose_list_4'),
    t('about.purpose_list_5'),
    t('about.purpose_list_6'),
  ];

  useSEO({
    title: t('about.title'),
    description: `${t('about.title')} — ${t('app.title')}`,
  });

  return (
    <div className="pt-24 pb-16 relative overflow-hidden bg-dark-900 text-white min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-icc-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-semibold text-icc-300 uppercase tracking-wider">{t('about.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {t('about.title')}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Quick Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="md:col-span-1 glass-card p-6 flex flex-col gap-6"
          >
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
              <div className="w-24 h-24 rounded-2xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center mb-4">
                <Shield className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('about.scholar_name')}</h3>
              <p className="text-xs text-icc-400 font-medium mt-1">{t('about.scholar_title')}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/45 text-xs">{t('about.region_label')}</p>
                  <p className="text-white/80 font-medium">{t('about.region_value')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/45 text-xs">{t('about.languages_label')}</p>
                  <p className="text-white/80 font-medium">{t('about.languages_value')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/45 text-xs">{t('about.focus_label')}</p>
                  <p className="text-white/80 font-medium">{t('about.focus_value')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Biography Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:col-span-2 glass-card p-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-2">{t('about.biography_title')}</h2>
              <p className="text-sm text-white/60 leading-relaxed">
                {t('about.biography_para1')}
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                {t('about.biography_para2')}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xl font-extrabold text-icc-400">{t('about.stat_lectures_count')}</h4>
                <p className="text-xs text-white/40 mt-1">{t('about.stat_lectures_label')}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xl font-extrabold text-icc-400">{t('about.stat_students_count')}</h4>
                <p className="text-xs text-white/40 mt-1">{t('about.stat_students_label')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Teaching Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-icc-400" /> {t('about.teaching_activities_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            {t('about.teaching_activities_desc')}
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-white/40">{t('about.schedule_days_label')}</p>
              <p className="text-sm font-bold text-white mt-1">{t('about.schedule_days_value')}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-white/40">{t('about.schedule_rest_label')}</p>
              <p className="text-sm font-bold text-white mt-1">{t('about.schedule_rest_value')}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-3">{t('about.morning_classes_title')}</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            {t('about.morning_classes_desc')}
          </p>
          <ul className="space-y-2 mb-4">
            {MORNING_CLASSES.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-icc-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40 italic">{t('about.morning_classes_note')}</p>
        </motion.div>

        {/* Advanced Studies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-icc-400" /> {t('about.advanced_studies_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            {t('about.advanced_studies_desc')}
          </p>
          <ul className="space-y-2 mb-4">
            {ADVANCED_STUDIES.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-icc-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40 italic">{t('about.advanced_studies_note')}</p>
        </motion.div>

        {/* Teaching Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-icc-400" /> {t('about.methodology_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            {t('about.methodology_desc')}
          </p>
          <ul className="space-y-3 max-w-2xl">
            {METHODOLOGY_LIST.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-icc-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40 italic mt-4">{t('about.methodology_note')}</p>
        </motion.div>

        {/* Media Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-icc-400" /> {t('about.media_library_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            {t('about.media_library_desc')}
          </p>
          <ul className="space-y-2 mb-4">
            {MEDIA_LIST.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-icc-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/40 italic">{t('about.media_library_note')}</p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-icc-400" /> {t('about.mission_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            {t('about.mission_desc')}
          </p>
          <p className="text-xs text-white/40 italic">{t('about.mission_note')}</p>
        </motion.div>

        {/* Purpose */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-icc-400" /> {t('about.purpose_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            {t('about.purpose_desc')}
          </p>
          <ul className="space-y-2">
            {PURPOSE_LIST.map((item, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-icc-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 border border-icc-500/10 bg-gradient-to-br from-icc-500/5 to-transparent"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-icc-400" /> {t('about.conclusion_title')}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            {t('about.conclusion_desc')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
