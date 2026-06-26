import React, { useState } from 'react';
import { Target, BarChart3, Timer, Sparkles, Loader2, BookOpen, Brain, Zap, CheckCircle } from 'lucide-react';

export default function QuizConfig({ onStart, loading }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timerMinutes, setTimerMinutes] = useState(0);

  const difficulties = [
    { value: 'easy', label: 'Easy', icon: BookOpen, color: 'emerald', desc: 'Basic recall & understanding' },
    { value: 'medium', label: 'Medium', icon: Brain, color: 'indigo', desc: 'Application & analysis' },
    { value: 'hard', label: 'Hard', icon: Zap, color: 'rose', desc: 'Critical thinking & synthesis' },
  ];
  const questionCounts = [5, 10, 15, 20];
  const timerOptions = [
    { value: 0, label: 'No Timer' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '60 min' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Quiz Configuration</h1>
          <p className="text-gray-400 text-sm mt-0.5">Customize your exam experience</p>
        </div>

        {/* Difficulty Level */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" /> Difficulty Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {difficulties.map((d) => {
              const Icon = d.icon;
              const isActive = difficulty === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                    isActive
                      ? `bg-${d.color}-500/10 border-${d.color}-500/30 shadow-lg shadow-${d.color}-500/5`
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                  }`}
                  style={isActive ? {
                    backgroundColor: d.color === 'emerald' ? 'rgba(16,185,129,0.1)' : d.color === 'indigo' ? 'rgba(99,102,241,0.1)' : 'rgba(244,63,94,0.1)',
                    borderColor: d.color === 'emerald' ? 'rgba(16,185,129,0.3)' : d.color === 'indigo' ? 'rgba(99,102,241,0.3)' : 'rgba(244,63,94,0.3)',
                  } : {}}
                >
                  <Icon className={`w-5 h-5 mb-2 ${
                    isActive
                      ? d.color === 'emerald' ? 'text-emerald-400' : d.color === 'indigo' ? 'text-indigo-400' : 'text-rose-400'
                      : 'text-gray-500'
                  }`} />
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{d.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className={`w-4 h-4 ${
                        d.color === 'emerald' ? 'text-emerald-400' : d.color === 'indigo' ? 'text-indigo-400' : 'text-rose-400'
                      }`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Number of Questions
          </h2>
          <div className="flex flex-wrap gap-3">
            {questionCounts.map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`flex-1 min-w-[80px] py-3 rounded-xl border text-center font-semibold transition-all duration-200 cursor-pointer ${
                  numQuestions === n
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.12]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4" /> Timer
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {timerOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimerMinutes(t.value)}
                className={`py-2.5 rounded-xl border text-center text-sm font-medium transition-all duration-200 cursor-pointer ${
                  timerMinutes === t.value
                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.12]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart({ difficulty, numQuestions, timerMinutes })}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-4 font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Start Exam
            </>
          )}
        </button>
      </div>
    </div>
  );
}
