import { BookOpen } from 'lucide-react';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../../config/collections';

interface CollectionBrowserProps {
  collectionStats: Record<string, number>;
  selectedCollection: string | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
  browseLabel: string;
  showingLabel: string;
  clearLabel: string;
}

export default function CollectionBrowser({
  collectionStats,
  selectedCollection,
  onSelect,
  onClear,
  browseLabel,
  showingLabel,
  clearLabel,
}: CollectionBrowserProps) {
  return (
    <>
      {Object.keys(collectionStats).length > 0 && (
        <div className="mb-5">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-icc-400" />
            {browseLabel}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {COLLECTIONS.filter(c => (collectionStats[c.slug] || 0) > 0).map(c => (
              <button
                key={c.slug}
                onClick={() => onSelect(c.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shrink-0 transition-all border ${
                  selectedCollection === c.slug
                    ? 'bg-icc-500 text-white border-icc-500'
                    : `${COLLECTION_COLORS[c.slug] || 'bg-white/5 text-white/60 border-white/10'} hover:brightness-125`
                }`}
              >
                <span>{c.icon}</span>
                <span className="font-medium whitespace-nowrap">{c.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCollection === c.slug ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {collectionStats[c.slug]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCollection && (
        <div className="mb-4 flex items-center gap-2 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="text-white/60">{showingLabel}</span>
          <span className="font-semibold text-icc-400">
            {getCollectionBySlug(selectedCollection)?.icon} {getCollectionBySlug(selectedCollection)?.name || selectedCollection}
          </span>
          <button
            onClick={onClear}
            className="ml-auto px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </>
  );
}