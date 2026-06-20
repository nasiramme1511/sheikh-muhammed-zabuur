import { useState, useRef } from 'react';
import { useOffline } from '../../context/OfflineContext';
import { motion } from 'framer-motion';
import { Headphones, Trash2, Play, Pause, WifiOff, Clock } from 'lucide-react';
import { getOfflineBlobUrl, updatePlayPosition } from '../../lib/offline/download';

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function OfflineAudio() {
  const { state, removeResource, refresh } = useOffline();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const items = state.resources.filter(r => r.type === 'AUDIO' && r.status === 'completed');

  async function handlePlay(resourceId: string) {
    if (playingId === resourceId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    const url = await getOfflineBlobUrl(resourceId);
    if (!url) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    const resource = items.find(r => r.id === resourceId);
    if (resource?.playPosition) audio.currentTime = resource.playPosition;
    audio.play();
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      updatePlayPosition(resourceId, Math.floor(audio.currentTime));
    });
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    });
    audioRef.current = audio;
    setPlayingId(resourceId);
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <WifiOff className="w-6 h-6 text-icc-400" /> Offline Audio
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {items.length} files
        </span>
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <Headphones className="w-16 h-16 text-icc-400/60 mx-auto mb-4" />
          <p className="text-lg text-white/70 mb-2">No offline audio</p>
          <p className="text-sm text-white/40">Download audio lectures to listen offline.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const isPlaying = playingId === item.id;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass-premium p-4 ${isPlaying ? 'border-icc-500/40' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-icc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/40">{item.sizeHuman}</p>
                    {item.playPosition ? (
                      <p className="text-[10px] text-icc-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Resumed at {formatDuration(item.playPosition)}
                      </p>
                    ) : null}
                  </div>
                </div>
                {isPlaying && (
                  <div className="mt-3">
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-icc-400 transition-all duration-300" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 mt-1">
                      <span>{formatDuration(Math.floor(currentTime))}</span>
                      <span>{formatDuration(Math.floor(duration))}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => handlePlay(item.id)}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isPlaying
                        ? 'bg-icc-500/20 border-icc-500/30 text-icc-400'
                        : 'bg-icc-500/10 hover:bg-icc-500/20 border-icc-500/20 text-icc-400'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isPlaying ? 'Pause' : item.playPosition ? 'Resume' : 'Play'}
                  </button>
                  <button onClick={() => { if (playingId === item.id) { audioRef.current?.pause(); setPlayingId(null); } removeResource(item.id); refresh(); }}
                    className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
