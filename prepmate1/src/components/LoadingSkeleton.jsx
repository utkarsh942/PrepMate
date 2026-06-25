import React from 'react';

const LoadingSkeleton = ({ count = 6, variant = 'card' }) => {
  const items = Array.from({ length: count });

  if (variant === 'profile') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/[0.05] rounded-full" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-white/[0.05] rounded" />
            <div className="h-4 w-28 bg-white/[0.05] rounded" />
          </div>
        </div>
        <div className="space-y-3 pt-6 border-t border-white/[0.05]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-4 w-24 bg-white/[0.05] rounded" />
              <div className="h-4 w-48 bg-white/[0.05] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {items.map((_, index) => (
        <div
          key={index}
          className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between min-h-[180px]"
        >
          <div>
            <div className="h-5 w-3/4 bg-white/[0.05] rounded mb-3" />
            <div className="h-3 w-1/4 bg-white/[0.05] rounded mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-white/[0.04] rounded" />
              <div className="h-3 w-5/6 bg-white/[0.04] rounded" />
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-white/[0.04] pt-4">
            <div className="h-4 w-1/3 bg-white/[0.05] rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-white/[0.05] rounded-lg" />
              <div className="h-8 w-8 bg-white/[0.05] rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
