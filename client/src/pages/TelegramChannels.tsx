import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MessageCircle, Send, ArrowRight, Lock, LogIn } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { telegram, telegramAccess } from '../lib/api';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Channel {
  id: number;
  name: string;
  link?: string;
  teacherName: string | null;
  description: string | null;
  category: string;
}

interface Stats {
  total: number;
  categories: number;
}

const CATEGORY_ORDER = ['RIYAD', 'TAFSIR', 'TAJREED', 'BULUGH AL-MARAM', 'USUL AL-THALATHAH', 'AQEEDAH', 'BAYQUNIYYAH', 'General'];

function categorySortKey(cat: string): number {
  const idx = CATEGORY_ORDER.indexOf(cat);
  return idx >= 0 ? idx : CATEGORY_ORDER.length;
}

export default function TelegramChannels() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [fullChannels, setFullChannels] = useState<Map<number, string>>(new Map());
  const [stats, setStats] = useState<Stats>({ total: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    Promise.all([
      telegram.getAll(),
      telegram.getStats(),
    ])
      .then(([chRes, statsRes]) => {
        const data: Channel[] = chRes.data ?? [];
        setChannels(data);
        setStats(statsRes.data || { total: data.length, categories: new Set(data.map(c => c.category).filter(Boolean)).size });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setAccessChecked(true);
      setHasAccess(false);
      return;
    }
    telegram.checkAccess()
      .then(res => {
        setHasAccess(res.data.allowed);
        setAccessChecked(true);
        if (res.data.allowed) {
          return telegramAccess.getAll().then(chRes => {
            const map = new Map<number, string>();
            (chRes.data ?? []).forEach((ch: Channel) => {
              if (ch.link) map.set(ch.id, ch.link);
            });
            setFullChannels(map);
          });
        }
      })
      .catch(() => {
        setHasAccess(false);
        setAccessChecked(true);
      });
  }, [user]);

  const handleJoin = (ch: Channel) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!hasAccess || !fullChannels.has(ch.id)) {
      setShowSubscribeModal(true);
      return;
    }
    window.open(fullChannels.get(ch.id), '_blank', 'noopener,noreferrer');
  };

  const filtered = channels.filter(ch =>
    !searchQuery ||
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ch.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped: Record<string, Channel[]> = {};
  for (const ch of filtered) {
    const cat = ch.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ch);
  }
  const groups = Object.entries(grouped)
    .map(([name, chs]) => ({ name, channels: chs }))
    .sort((a, b) => categorySortKey(a.name) - categorySortKey(b.name));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <FaTelegramPlane className="w-8 h-8 text-[#0088cc]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('telegram.title')}</h1>
          <p className="text-white/50 max-w-xl mx-auto">{t('telegram.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          {[
            { label: t('telegram.channels'), value: stats.total, icon: MessageCircle },
            { label: 'Categories', value: stats.categories, icon: Users },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-white/50 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('nav.search_placeholder')}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
          />
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <FaTelegramPlane className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery ? t('common.no_results') : t('telegram.no_channels')}</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.name} className="mb-10 last:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <span className="text-sm font-bold text-blue-400">{group.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{group.name}</h2>
                  <p className="text-xs text-white/50">{group.channels.length} channels</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.channels.map((ch, idx) => (
                  <motion.div
                    key={ch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card p-5 flex items-start gap-4 group hover:border-blue-500/30 transition-all cursor-pointer"
                    onClick={() => handleJoin(ch)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <FaTelegramPlane className="w-6 h-6 text-[#0088cc]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{ch.name}</h3>
                      {ch.description && (
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">{ch.description}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-400 font-medium">
                        {!user ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>{t('telegram.login_required')}</span>
                          </>
                        ) : !hasAccess || !fullChannels.has(ch.id) ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>{t('telegram.subscription_required')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>{t('telegram.join')}</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}>
          <div className="bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">{t('telegram.login_required')}</h3>
            <p className="text-white/50 text-center text-sm mb-6">{t('telegram.login_to_access')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium">
                {t('common.back')}
              </button>
              <button onClick={() => navigate('/login')} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                {t('auth.sign_in')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSubscribeModal(false)}>
          <div className="bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <FaTelegramPlane className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">{t('telegram.subscription_required')}</h3>
            <p className="text-white/50 text-center text-sm mb-6">{t('telegram.subscribe_to_access')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubscribeModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium">
                {t('common.back')}
              </button>
              <button onClick={() => navigate('/dashboard/profile')} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                {t('telegram.subscribe_now')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
