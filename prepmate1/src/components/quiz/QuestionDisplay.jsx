import React from 'react';

export default function QuestionDisplay({ question, selectedAnswer, onSelectAnswer, questionNumber, isMarked }) {
  if (!question) return null;

  const handleSelect = (option) => {
    onSelectAnswer(option);
  };

  return (
    <div className="flex flex-col h-full bg-[#13131a] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        {/* Question Text */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center font-bold text-gray-300 shadow-inner">
            {questionNumber}
          </div>
          <div className="flex-1 pt-1">
            <h2 className="text-lg md:text-xl font-medium text-white leading-relaxed">
              {question.question}
            </h2>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 ml-0 md:ml-14">
          {(question.options || []).map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const letter = String.fromCharCode(65 + idx);
            
            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] transform translate-x-1' 
                    : 'bg-[#1a1a24] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.2]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 transition-colors ${
                  isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/[0.05] text-gray-400 border border-white/[0.1]'
                }`}>
                  {letter}
                </div>
                <div className={`flex-1 text-base ${isSelected ? 'text-indigo-100 font-medium' : 'text-gray-300'}`}>
                  {opt}
                </div>
                
                {/* Radio indicator */}
                <div className={`w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-indigo-500' : 'border-gray-600'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
