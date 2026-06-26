import React from 'react';

export default function QuizLegend() {
  const items = [
    { color: 'bg-[#22c55e]', label: 'Answered' },
    { color: 'bg-[#ef4444]', label: 'Not Answered' },
    { color: 'bg-[#4b5563]', label: 'Not Visited' },
    { color: 'bg-[#f59e0b]', label: 'Marked for Review' },
    { color: 'bg-[#a855f7]', label: 'Answered & Marked' },
  ];

  return (
    <div className="bg-[#13131a] p-4 rounded-xl border border-white/[0.08] shadow-md mt-4">
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-md flex-shrink-0 shadow-sm ${item.color}`} />
            <span className="text-xs text-gray-300 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
