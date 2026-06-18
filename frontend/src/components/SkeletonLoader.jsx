import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'stats':
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
            <div className="space-y-2.5 w-1/2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
          </div>
        );
      case 'table':
        return (
          <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 animate-pulse">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
              </div>
            ))}
          </div>
        );
      case 'list':
        return (
          <div className="space-y-3 w-full animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center justify-between">
                <div className="space-y-2 w-3/4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
              </div>
            ))}
          </div>
        );
      case 'card':
      default:
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-40 bg-slate-200 dark:bg-slate-800"></div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`grid ${type === 'stats' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : type === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1'} w-full`}>
      {[...Array(count)].map((_, i) => (
        <React.Fragment key={i}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonLoader;
