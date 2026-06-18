import { motion } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';
import { Send, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { ChannelData } from '../../types';

interface Props {
  channels: ChannelData[];
}

export default function TeacherChannels({ channels }: Props) {
  const { t } = useTranslation();
  if (channels.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FaTelegramPlane className="w-5 h-5 text-[#0088cc]" />
        {t('telegram.section_title')}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <a
              href={ch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl bg-dark-800/50 border border-white/5 p-5 hover:border-[#0088cc]/30 hover:bg-dark-800/70 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center">
                  <FaTelegramPlane className="w-5 h-5 text-[#0088cc]" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-icc-500/10 text-icc-400 border border-icc-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-icc-400 animate-pulse" />
                  {t('telegram.active')}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-[#0088cc] transition-colors line-clamp-1">
                {ch.name}
              </h3>
              {ch.description && (
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{ch.description}</p>
              )}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-[#0088cc] font-semibold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  {t('telegram.join')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[#0088cc] group-hover:translate-x-1 transition-all" />
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
