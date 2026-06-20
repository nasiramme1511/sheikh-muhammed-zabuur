import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (cat: string) => void;
}

export default function CategoryNav({ categories, selectedCategory, onSelect }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-6">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-900/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-10"
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-all whitespace-nowrap ${
                active
                  ? 'bg-icc-500 text-white shadow-lg shadow-icc-500/20'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/5 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-900/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}