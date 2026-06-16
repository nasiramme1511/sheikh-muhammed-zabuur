import { motion } from 'framer-motion';
import { BookOpen, Award, Globe, Heart, Sparkles, Shield, Bookmark, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { useSEO } from '../seo/metadata';

const EXPERTISE = [
  { subject: 'Aqeedah (Islamic Creed)', desc: 'Clarifying the pure belief of Ahlus Sunnah wal Jama\'ah based on Quran and Sunnah.' },
  { subject: 'Tafsir (Quranic Exegesis)', desc: 'Explaining the meanings of the Noble Quran with reference to classical commentaries.' },
  { subject: 'Hadith (Prophetic Traditions)', desc: 'Teaching terminology (Mustalah) and reading books of Hadith like Riyad As-Salihin.' },
  { subject: 'Fiqh (Islamic Jurisprudence)', desc: 'Practical rulings of worship, transactions, and daily life according to authentic proofs.' },
  { subject: 'Seerah (Prophetic Biography)', desc: 'Extracting lessons and morals from the life of the Prophet Muhammad ﷺ.' },
  { subject: 'Arabic & Tajweed', desc: 'Rules of correct pronunciation, recitation, and foundation of classical Arabic grammar.' }
];

export default function About() {
  useSEO({
    title: 'About Sheikh Mohammed Zabuur',
    description: 'Learn about Sheikh Mohammed Zabuur, his educational background, areas of teaching, languages spoken, and his dedicated Islamic educational platform.',
  });

  return (
    <div className="pt-24 pb-16 relative overflow-hidden bg-dark-900 text-white min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Biography</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            About Sheikh Mohammed Zabuur
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            A dedicated teacher of the Sunnah, providing clear, accessible, and structured Islamic classes to help Muslims strengthen their connection to authentic knowledge.
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
              <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Shield className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-bold text-white">Sheikh Mohammed Zabuur</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">Scholar & Islamic Educator</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/45 text-xs">Primary Region</p>
                  <p className="text-white/80 font-medium">East Africa / Online</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/45 text-xs">Languages Spoken</p>
                  <p className="text-white/80 font-medium">Oromo (Primary), Amharic, Arabic</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/45 text-xs">Core Focus</p>
                  <p className="text-white/80 font-medium">Aqeedah, Tafsir, Fiqh, Seerah</p>
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
              <h2 className="text-2xl font-bold text-white mb-2">Academic Journey & Biography</h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Sheikh Mohammed Zabuur is a well-respected scholar and teacher who has dedicated many years to studying and teaching the classical sciences of Islam. Holding strict adherence to the methodology of the Salafus Salih (Ahlus Sunnah wal Jama'ah), his teachings emphasize clarity, sound evidence, and structured learning.
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                His lectures are widely listened to across East Africa and the global diaspora, especially within the Oromo-speaking community. By translating complex classical texts into clear, practical explanations, he bridges the gap for beginners and advanced students alike.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xl font-extrabold text-emerald-400">100+</h4>
                <p className="text-xs text-white/40 mt-1">Recorded Audio Lectures</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xl font-extrabold text-emerald-400">Thousands</h4>
                <p className="text-xs text-white/40 mt-1">Of Online Students globally</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Teaching Areas & Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-10 mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> Teaching Methodology
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-8">
            The platform is designed to provide learning paths starting from the fundamental beliefs of a Muslim. Each curriculum follows a classical text, read, explained, and annotated line-by-line by the Sheikh.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {EXPERTISE.map((exp, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">{exp.subject}</h4>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
