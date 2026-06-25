import React from 'react';
import { ArrowRight } from 'lucide-react';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/[0.08] rounded-3xl bg-white/[0.01] backdrop-blur-sm py-16">
      <div className="relative mb-6">
        {/* Glow behind icon */}
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-indigo-400">
          {Icon && <Icon className="w-8 h-8" />}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-8">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
