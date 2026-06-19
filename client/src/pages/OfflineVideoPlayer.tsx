import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { getOfflineResource } from '../lib/offline/db';
import { getOfflineBlobUrl, updatePlayPosition } from '../lib/offline/download';

export default function OfflineVideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<any>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await getOfflineResource(id);
      if (res) {
        setResource(res);
        const url = await getOfflineBlobUrl(id);
        setBlobUrl(url);
      }
    })();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resource) return;
    if (resource.playPosition) video.currentTime = resource.playPosition;
    const handler = () => updatePlayPosition(id!, Math.floor(video.currentTime));
    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [resource, id]);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function changeSpeed() {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link to="/my-downloads" className="inline-flex items-center gap-1.5 text-xs text-icc-400 hover:text-icc-300 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Downloads
        </Link>
      </div>

      <div ref={containerRef} className="relative bg-black mx-auto" style={{ maxWidth: 1100 }}>
        {blobUrl ? (
          <video
            ref={videoRef}
            src={blobUrl}
            controls
            autoPlay
            className="w-full max-h-[80vh] bg-black"
            style={{ outline: 'none' }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-white/50">
            Video not available offline
          </div>
        )}

        <div className="flex items-center gap-4 px-4 py-3 bg-dark-900">
          <button
            onClick={changeSpeed}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
          >
            {speed}x
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <span className="text-sm text-white/70 truncate flex-1 text-end">{resource.title}</span>
        </div>
      </div>
    </div>
  );
}
