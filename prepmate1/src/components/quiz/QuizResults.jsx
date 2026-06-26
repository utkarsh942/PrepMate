import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Target, BarChart3, Trophy, Eye, RotateCcw } from 'lucide-react';

function getGrade(pct) {
  if (pct >= 95) return { letter: 'A+', color: 'text-emerald-400', msg: 'Outstanding! Perfect mastery!' };
  if (pct >= 85) return { letter: 'A', color: 'text-emerald-400', msg: 'Excellent work! You know this well.' };
  if (pct >= 75) return { letter: 'B+', color: 'text-green-400', msg: 'Great job! Almost there.' };
  if (pct >= 65) return { letter: 'B', color: 'text-green-400', msg: 'Good performance! Keep improving.' };
  if (pct >= 55) return { letter: 'C+', color: 'text-yellow-400', msg: 'Fair effort. Review the weak areas.' };
  if (pct >= 45) return { letter: 'C', color: 'text-yellow-400', msg: 'Needs improvement. Study more.' };
  if (pct >= 35) return { letter: 'D', color: 'text-orange-400', msg: 'Below average. Revisit the material.' };
  return { letter: 'F', color: 'text-rose-400', msg: 'Keep trying! Review your notes thoroughly.' };
}

const formatTime = (seconds) => {
  if (seconds == null || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function QuizResults({ questions, userAnswers, timeSpent, onRetry, onBackToNotes }) {
  const [showReview, setShowReview] = useState(false);

  const totalQuestions = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unattempted = 0;

  questions.forEach((q, idx) => {
    const answer = userAnswers.get ? userAnswers.get(idx) : userAnswers[idx];
    if (!answer) {
      unattempted++;
    } else if (answer === q.correct_answer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const grade = getGrade(accuracy);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;
  const strokeColor = accuracy >= 70 ? '#818cf8' : accuracy >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-500/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
          <p className="text-gray-400">Here's your performance breakdown</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Circular Score */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 flex flex-col items-center justify-center animate-scale-in">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={strokeColor}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{accuracy}%</span>
                <span className="text-xs text-gray-400 mt-1">Score</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {correctCount} of {totalQuestions} correct
            </p>
          </div>

          {/* Grade + Message */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 flex flex-col items-center justify-center animate-scale-in" style={{ animationDelay: '100ms' }}>
            <span className={`text-7xl font-black ${grade.color} mb-3`}>{grade.letter}</span>
            <p className="text-white font-medium text-center mb-2">{grade.msg}</p>
            <p className="text-xs text-gray-500 text-center">Based on {totalQuestions} questions</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Correct', value: correctCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Wrong', value: wrongCount, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Skipped', value: unattempted, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Time', value: formatTime(timeSpent), icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            { label: 'Accuracy', value: `${accuracy}%`, icon: BarChart3, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`${stat.bg} border rounded-2xl p-4 text-center animate-count-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-gray-300 font-medium transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          {showReview ? 'Hide' : 'Review'} Answers
        </button>

        {showReview && (
          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers.get ? userAnswers.get(idx) : userAnswers[idx];
              const isCorrect = userAnswer === q.correct_answer;
              const isUnattempted = !userAnswer;

              return (
                <div
                  key={idx}
                  className={`bg-white/[0.03] border rounded-2xl p-5 animate-scale-in ${
                    isUnattempted
                      ? 'border-amber-500/20'
                      : isCorrect
                      ? 'border-emerald-500/20'
                      : 'border-rose-500/20'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-sm font-bold text-gray-500 shrink-0 mt-0.5">Q{idx + 1}.</span>
                    <p className="text-white font-medium text-sm leading-relaxed">{q.question}</p>
                  </div>

                  <div className="ml-8 space-y-1.5 mb-3">
                    {(q.options || []).map((opt, optIdx) => {
                      const isUserChoice = userAnswer === opt;
                      const isCorrectOpt = q.correct_answer === opt;
                      let optClass = 'text-gray-500';
                      if (isCorrectOpt) optClass = 'text-emerald-400 font-medium';
                      else if (isUserChoice && !isCorrect) optClass = 'text-rose-400 line-through';

                      return (
                        <div key={optIdx} className={`flex items-center gap-2 text-sm ${optClass}`}>
                          <span className="w-5 h-5 rounded flex items-center justify-center text-xs bg-white/[0.05]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {opt}
                          {isCorrectOpt && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
                          {isUserChoice && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400 ml-1" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="ml-8 mt-2 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                      <p className="text-xs text-indigo-300">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Quiz
          </button>
          <button
            onClick={onBackToNotes}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300 rounded-xl px-6 py-3 font-medium transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </button>
        </div>
      </div>
    </div>
  );
}
