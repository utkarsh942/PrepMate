import React from 'react';
import { AlertTriangle, Send } from 'lucide-react';

export default function QuizSubmitModal({ isOpen, onClose, onConfirm, stats }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#13131a] border border-white/[0.1] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-2">Submit Assessment?</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Are you sure you want to submit? You cannot change your answers after submission.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-bold text-[#22c55e]">{stats.answered}</span>
              <span className="text-xs text-gray-400 mt-1 text-center">Answered</span>
            </div>
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-bold text-[#ef4444]">{stats.notAnswered}</span>
              <span className="text-xs text-gray-400 mt-1 text-center">Not Answered</span>
            </div>
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-bold text-[#f59e0b]">{stats.markedForReview}</span>
              <span className="text-xs text-gray-400 mt-1 text-center">Marked for Review</span>
            </div>
            <div className="bg-[#4b5563]/30 border border-[#4b5563]/50 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-300">{stats.notVisited}</span>
              <span className="text-xs text-gray-400 mt-1 text-center">Not Visited</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium text-white bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <Send className="w-4 h-4" />
              Submit Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
