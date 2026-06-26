import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function QuizControls({
  onSaveAndNext,
  onClearResponse,
  onMarkForReview,
  onPrevious,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  hasAnswer,
  isMarked,
}) {
  return (
    <div className="bg-[#13131a] border-t border-white/[0.08] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        
        {/* Left Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={onMarkForReview}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors border ${
              isMarked 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30' 
                : 'bg-white/[0.03] text-gray-300 border-white/[0.1] hover:bg-white/[0.08]'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{isMarked ? 'Unmark Review' : 'Mark for Review & Next'}</span>
            <span className="sm:hidden">{isMarked ? 'Unmark' : 'Mark & Next'}</span>
          </button>
          
          <button
            onClick={onClearResponse}
            disabled={!hasAnswer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-300 bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Response</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>

        {/* Center Actions (Navigation) */}
        <div className="flex items-center gap-2 order-3 md:order-none w-full md:w-auto justify-between md:justify-center">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="flex items-center gap-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <button
            onClick={onSaveAndNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-[#16a34a] hover:bg-[#15803d] transition-colors shadow-lg shadow-green-500/20"
          >
            Save & Next
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onNext}
            disabled={isLast}
            className="flex items-center gap-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden md:flex"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action (Submit) */}
        <div className="flex items-center justify-end w-full md:w-auto order-2 md:order-none">
          <button
            onClick={onSubmit}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Test
          </button>
        </div>

      </div>
    </div>
  );
}
