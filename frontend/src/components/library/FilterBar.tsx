import { Search, Grid3X3, List } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder: string;
  sortBy: 'latest' | 'downloads' | 'views';
  onSortChange: (val: 'latest' | 'downloads' | 'views') => void;
  sortLatest: string;
  sortDownloads: string;
  sortViews: string;
  viewMode: 'grid' | 'list';
  onViewModeChange: (val: 'grid' | 'list') => void;
  gridTitle: string;
  listTitle: string;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  sortBy,
  onSortChange,
  sortLatest,
  sortDownloads,
  sortViews,
  viewMode,
  onViewModeChange,
  gridTitle,
  listTitle,
}: FilterBarProps) {
  return (
    <div className="sticky top-20 z-30 flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-surface-900/90 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg shadow-black/20">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-icc-500/50 transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
          {(['latest', 'downloads', 'views'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === s ? 'bg-icc-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {s === 'latest' ? sortLatest : s === 'downloads' ? sortDownloads : sortViews}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-icc-500 text-white' : 'text-white/60 hover:text-white'}`}
            title={gridTitle}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-icc-500 text-white' : 'text-white/60 hover:text-white'}`}
            title={listTitle}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}