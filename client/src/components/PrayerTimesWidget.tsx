import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../i18n';

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  icon: typeof Sunrise;
  color: string;
}

const PRAYER_TIMES: PrayerTime[] = [
  { name: 'Fajr', nameAr: 'الفجر', time: '05:12', icon: Sunrise, color: '#10B981' },
  { name: 'Dhuhr', nameAr: 'الظهر', time: '12:30', icon: Sun, color: '#F59E0B' },
  { name: 'Asr', nameAr: 'العصر', time: '15:45', icon: Sun, color: '#F97316' },
  { name: 'Maghrib', nameAr: 'المغرب', time: '18:30', icon: Sunset, color: '#EC4899' },
  { name: 'Isha', nameAr: 'العشاء', time: '20:00', icon: Moon, color: '#8B5CF6' },
];

function getCurrentPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = PRAYER_TIMES.length - 1; i >= 0; i--) {
    const [h, m] = PRAYER_TIMES[i].time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (currentMinutes >= prayerMinutes) return i;
  }
  return -1;
}

function getNextPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < PRAYER_TIMES.length; i++) {
    const [h, m] = PRAYER_TIMES[i].time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (currentMinutes < prayerMinutes) return i;
  }
  return 0;
}

export default function PrayerTimesWidget() {
  const { t } = useTranslation();
  const [nextIndex, setNextIndex] = useState(getNextPrayerIndex());
  const [currentIndex, setCurrentIndex] = useState(getCurrentPrayerIndex());
  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setNextIndex(getNextPrayerIndex());
      setCurrentIndex(getCurrentPrayerIndex());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();
    try {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'islamic',
      };
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', options);
      setHijriDate(formatter.format(now));
    } catch {
      setHijriDate('');
    }
  }, []);

  const prayerKeyMap: Record<string, TranslationKey> = {
    Fajr: 'prayer_times.fajr',
    Dhuhr: 'prayer_times.dhuhr',
    Asr: 'prayer_times.asr',
    Maghrib: 'prayer_times.maghrib',
    Isha: 'prayer_times.isha',
  };

  const nextPrayer = PRAYER_TIMES[nextIndex];
  const NextIcon = nextPrayer.icon;

  const remainingSeconds = (() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = nextPrayer.time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    const diff = prayerMinutes - currentMinutes;
    if (diff <= 0) return 0;
    return diff * 60;
  })();

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-icc-500/50 to-transparent" />

      {hijriDate && (
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 mb-3">
          <Sparkles className="w-3 h-3 text-gold-400" />
          <span>{hijriDate}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-icc-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-icc-400" />
          </div>
          <div>
            <p className="text-xs text-white/40">{t('prayer_times.next_prayer')}</p>
            <p className="text-sm font-semibold text-white">{t(prayerKeyMap[nextPrayer.name])}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{nextPrayer.time}</p>
          <p className="text-[10px] text-white/40">
            {t('prayer_times.time_left', { hours, minutes })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {PRAYER_TIMES.map((prayer, i) => {
          const Icon = prayer.icon;
          const isNext = i === nextIndex;
          const isPast = i < currentIndex || (currentIndex === -1 && i < nextIndex);
          const isCurrent = i === currentIndex;

          return (
            <div
              key={prayer.nameAr}
              className={`text-center py-2 px-1 rounded-xl transition-all duration-300 ${
                isNext
                  ? 'bg-icc-500/15 border border-icc-500/30 shadow-sm shadow-icc-500/10'
                  : isCurrent
                  ? 'bg-gold-500/10 border border-gold-500/20'
                  : 'hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 mx-auto mb-1 ${
                  isNext ? 'text-icc-400' : isCurrent ? 'text-gold-400' : isPast ? 'text-white/20' : 'text-white/40'
                }`}
              />
              <p className={`text-[9px] font-medium ${
                isNext ? 'text-icc-400' : isCurrent ? 'text-gold-400' : isPast ? 'text-white/20' : 'text-white/40'
              }`}>
                {t(prayerKeyMap[prayer.name])}
              </p>
              <p className={`text-[8px] ${
                isNext ? 'text-icc-400/60' : isPast ? 'text-white/10' : 'text-white/20'
              }`}>
                {prayer.time}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
