export interface CollectionDef {
  slug: string;
  name: string;
  nameAr: string;
  icon: string;
  prefixes: string[];
}

export const COLLECTIONS: CollectionDef[] = [
  { slug: 'riyadhus-salihin', name: 'Riyadhus Salihin', nameAr: 'رياض الصالحين', icon: '📖', prefixes: ['riyad', 'riyadh', 'salihin', 'riyada'] },
  { slug: 'bulugh-al-maram', name: 'Bulugh Al Maram', nameAr: 'بلوغ المرام', icon: '📖', prefixes: ['bulugh', 'buluukaa'] },
  { slug: 'umdat-al-ahkam', name: 'Umdat Al Ahkam', nameAr: 'عمدة الأحكام', icon: '📖', prefixes: ['umdat', 'umdah'] },
  { slug: 'tafsir-ibn-kathir', name: 'Tafsir Ibn Kathir', nameAr: 'تفسير ابن كثير', icon: '📖', prefixes: ['tafsir-ibn', 'ibn-kathir'] },
  { slug: 'tafsir-al-quran', name: 'Tafsir Al Quran', nameAr: 'تفسير القرآن', icon: '📖', prefixes: ['tafsir', 'tafsiira'] },
  { slug: 'usul-ath-thalatha', name: 'Usul Ath-Thalatha', nameAr: 'الأصول الثلاثة', icon: '📖', prefixes: ['usul', 'usuulu'] },
  { slug: 'kitab-at-tawheed', name: 'Kitab At Tawheed', nameAr: 'كتاب التوحيد', icon: '📖', prefixes: ['tawheed'] },
  { slug: 'al-aqeedah-al-wasitiyyah', name: 'Al Aqeedah Al Wasitiyyah', nameAr: 'العقيدة الواسطية', icon: '📖', prefixes: ['wasitiyyah', 'aqeedah-al-wasit'] },
  { slug: 'al-manhaj-as-salim', name: 'Al Manhaj As Salim', nameAr: 'المنهج السليم', icon: '📖', prefixes: ['manhaj'] },
  { slug: 'tajweed', name: 'Tajweed', nameAr: 'التجويد', icon: '📖', prefixes: ['tajweed', 'tajwid', 'nuraniyyah', 'noorani', 'qaidah', 'tahsin'] },
  { slug: 'arabic-grammar', name: 'Arabic Grammar', nameAr: 'النحو العربي', icon: '📖', prefixes: ['arabic', 'nahw', 'sarf', 'grammar', 'ajrumiyyah', 'nahwii'] },
  { slug: 'seerah-nabawiyyah', name: 'Seerah Nabawiyyah', nameAr: 'السيرة النبوية', icon: '📖', prefixes: ['seerah', 'sirah', 'raheeq', 'makhtum'] },
  { slug: 'fiqh', name: 'Fiqh', nameAr: 'الفقه', icon: '📖', prefixes: ['fiqh', 'salah', 'prayer', 'wudu', 'zakat', 'sawm', 'hajj', 'umrah'] },
  { slug: 'ramadan', name: 'Ramadan', nameAr: 'رمضان', icon: '🌙', prefixes: ['ramadan', 'ramadhan'] },
  { slug: 'khutbah', name: 'Khutbah', nameAr: 'خطبة', icon: '📖', prefixes: ['khutbah', 'sermon'] },
  { slug: 'bayquniyyah', name: 'Bayquniyyah', nameAr: 'البيقونية', icon: '📖', prefixes: ['bayquniyyah', 'bayquni', 'manzumah'] },
  { slug: 'tajreed', name: 'Tajreed', nameAr: 'التجريد', icon: '📖', prefixes: ['tajreed', 'tajrid'] },
  { slug: 'questions-and-answers', name: 'Questions & Answers', nameAr: 'أسئلة وأجوبة', icon: '❓', prefixes: ['qa-', 'question', 'fatwa'] },
  { slug: 'general-lectures', name: 'General Lectures', nameAr: 'محاضرات عامة', icon: '📖', prefixes: ['general', 'lecture', 'dawah', 'da\'wah'] },
];

export function deriveCollection(filename: string): string | null {
  const n = filename.toLowerCase().replace(/[-_]/g, ' ');
  for (const col of COLLECTIONS) {
    for (const prefix of col.prefixes) {
      if (n.includes(prefix)) return col.slug;
    }
  }
  return null;
}

export function getCollectionBySlug(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find(c => c.slug === slug);
}

export const COLLECTION_COLORS: Record<string, string> = {
  'riyadhus-salihin': 'bg-icc-500/10 text-icc-400 border-icc-500/20',
  'bulugh-al-maram': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'umdat-al-ahkam': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'tafsir-ibn-kathir': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'tafsir-al-quran': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'usul-ath-thalatha': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'kitab-at-tawheed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'al-aqeedah-al-wasitiyyah': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'al-manhaj-as-salim': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'tajweed': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'arabic-grammar': 'bg-red-500/10 text-red-400 border-red-500/20',
  'seerah-nabawiyyah': 'bg-green-500/10 text-green-400 border-green-500/20',
  'fiqh': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'ramadan': 'bg-icc-600/10 text-icc-300 border-icc-600/20',
  'khutbah': 'bg-amber-600/10 text-amber-300 border-amber-600/20',
  'bayquniyyah': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'tajreed': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'questions-and-answers': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'general-lectures': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};
