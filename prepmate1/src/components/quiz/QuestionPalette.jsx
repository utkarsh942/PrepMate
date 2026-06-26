import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function QuestionPalette({ questions, questionStatuses, currentIndex, onJumpTo }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusClass = (index) => {
    const status = questionStatuses.get(index) || 'not-visited';
    let baseClass = "w-10 h-10 md:w-11 md:h-11 rounded-lg text-white font-medium flex items-center justify-center transition-all cursor-pointer shadow-md";
    
    // Status colors
    if (status === 'answered') baseClass += " bg-[#22c55e] hover:bg-[#16a34a]";
    else if (status === 'not-answered') baseClass += " bg-[#ef4444] hover:bg-[#dc2626]";
    else if (status === 'marked') baseClass += " bg-[#f59e0b] hover:bg-[#d97706]";
    else if (status === 'answered-marked') baseClass += " bg-[#a855f7] hover:bg-[#9333ea]";
    else baseClass += " bg-[#4b5563] hover:bg-[#374151]"; // not-visited

    // Current active ring
    if (index === currentIndex) {
      baseClass += " ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f] transform scale-110 z-10";
    }

    return baseClass;
  };

  return (
    <div className="bg-[#13131a] rounded-2xl border border-white/[0.08] flex flex-col h-full shadow-lg">
      <div 
        className="p-4 border-b border-white/[0.08] flex items-center justify-between cursor-pointer md:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-white font-semibold flex items-center gap-2">
          Question Palette
        </h3>
        <button className="md:hidden text-gray-400 hover:text-white">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      <div className={`flex-1 overflow-y-auto p-4 transition-all ${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onJumpTo(idx)}
              className={getStatusClass(idx)}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
