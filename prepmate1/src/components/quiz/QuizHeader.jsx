import React from 'react';
import QuizTimer from './QuizTimer';
import { BookOpen } from 'lucide-react';

export default function QuizHeader({ title, timerSeconds, onTimeUp, currentQuestion, totalQuestions, isPaused }) {
  return (
    <div className="flex flex-wrap items-center justify-between p-4 bg-[#0f0f15] border-b border-white/[0.08] shadow-lg sticky top-0 z-10 gap-4">
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <BookOpen className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="font-semibold text-white text-base md:text-lg hidden md:block">
            {title || 'CBT Examination'}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <QuizTimer 
          totalSeconds={timerSeconds} 
          onTimeUp={onTimeUp} 
          isPaused={isPaused} 
        />
      </div>

      <div className="min-w-[120px] text-right bg-white/[0.03] px-4 py-2 rounded-lg border border-white/[0.05]">
        <span className="text-gray-400 text-sm mr-1">Question</span>
        <span className="text-white font-bold">{currentQuestion}</span>
        <span className="text-gray-500 mx-1">/</span>
        <span className="text-gray-400">{totalQuestions}</span>
      </div>
    </div>
  );
}
