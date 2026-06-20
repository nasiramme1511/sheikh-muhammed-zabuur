import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Moon, Sun, Bookmark, Search } from 'lucide-react';
import { getOfflineResource } from '../lib/offline/db';
import { getOfflineBlobUrl } from '../lib/offline/download';

export default function OfflinePdfReader() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<any>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [nightMode, setNightMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
  }, [id]);

  if (!resource) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-800/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/my-downloads" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-icc-400 hover:border-icc-500/30 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[400px]">{resource.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/50 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setNightMode(!nightMode)}
            className={`p-2 rounded-lg border transition-all ${
              nightMode
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className={`flex-1 ${nightMode ? 'bg-gray-900 brightness-75' : 'bg-gray-100'}`}>
        {blobUrl ? (
          <iframe
            ref={iframeRef}
            src={`${blobUrl}#toolbar=0&navpanes=1`}
            className="w-full h-full"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            title={resource.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50">
            PDF not available offline
          </div>
        )}
      </div>
    </div>
  );
}
