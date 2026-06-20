interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
  type?: 'audio' | 'video' | 'pdf';
  count?: number;
}

export default function LoadingSkeleton({ viewMode, type = 'audio', count = 6 }: LoadingSkeletonProps) {
  return (
    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {type === 'video' ? (
            <>
              <div className="bg-white/5 aspect-video w-full" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            </>
          ) : (
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/5" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
              <div className="h-8 bg-white/5 rounded w-full mt-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}