import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = ({
  icon = <Sparkles className="w-10 h-10 text-slate-400 dark:text-slate-600" />,
  title = "No data found",
  message = "Try adjusting your search criteria or add new entries.",
  actionButton = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4 text-slate-500 dark:text-slate-400 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {message}
      </p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
