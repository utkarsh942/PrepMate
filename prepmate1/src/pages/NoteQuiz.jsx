import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Brain,
  Sparkles,
  Target,
  Award,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "../components/Toast";

function NoteQuiz() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer
  const [totalTime, setTotalTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [perQuestionTimes, setPerQuestionTimes] = useState({});
  const timerRef = useRef(null);

  // Results
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get(`/generate-quiz/${noteId}`);
        const quiz = response.data.quiz || [];
        setQuestions(quiz);
        setSource(response.data.source || "");
        setQuestionStartTime(Date.now());
      } catch (err) {
        setError(true);
        toast.error(err.response?.data?.message || "Failed to generate quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [noteId]);

  // Timer effect
  useEffect(() => {
    if (!loading && !submitted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, submitted, questions.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const recordQuestionTime = (fromIndex) => {
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    setPerQuestionTimes((prev) => ({
      ...prev,
      [fromIndex]: (prev[fromIndex] || 0) + elapsed,
    }));
    setQuestionStartTime(Date.now());
  };

  const selectOption = (option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      recordQuestionTime(currentIndex);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      recordQuestionTime(currentIndex);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordQuestionTime(currentIndex);
    setSubmitting(true);

    let correctCount = 0;
    let wrongCount = 0;
    let unattempted = 0;

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (!userAnswer) {
        unattempted++;
      } else if (userAnswer === q.answer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const accuracy =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;

    const finalPerQuestionTimes = questions.map(
      (_, idx) => perQuestionTimes[idx] || 0
    );

    setResults({
      correctCount,
      wrongCount,
      unattempted,
      accuracy,
      totalTime,
    });
    setSubmitted(true);
    setSubmitting(false);

    // Submit analytics (non-blocking)
    try {
      await api.post("/analytics/submit-quiz", {
        note_id: noteId,
        total_questions: questions.length,
        correct_answers: correctCount,
        time_spent_seconds: totalTime,
        per_question_time: finalPerQuestionTimes,
      });
    } catch {
      // Silently fail — don't block results display
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="absolute w-16 h-16 rounded-full bg-indigo-500/10 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Generating your quiz...
          </h2>
          <p className="text-gray-400 text-sm">
            AI is crafting questions from your notes
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to Generate Quiz
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => navigate("/notes")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Questions Generated
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            The AI couldn't generate quiz questions from this note.
          </p>
          <button
            onClick={() => navigate("/notes")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───
  if (submitted && results) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Quiz Complete!
            </h1>
            <p className="text-gray-400">Here's how you performed</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={results.accuracy >= 70 ? "#818cf8" : results.accuracy >= 40 ? "#fbbf24" : "#f87171"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(results.accuracy / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {results.accuracy}%
                </span>
                <span className="text-xs text-gray-400">Accuracy</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-400">
                {results.correctCount}
              </p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
              <XCircle className="w-5 h-5 text-rose-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-400">
                {results.wrongCount}
              </p>
              <p className="text-xs text-gray-500">Wrong</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
              <Target className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-400">
                {results.unattempted}
              </p>
              <p className="text-xs text-gray-500">Unattempted</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
              <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-indigo-400">
                {formatTime(results.totalTime)}
              </p>
              <p className="text-xs text-gray-500">Time Taken</p>
            </div>
          </div>

          {/* Detailed Solutions */}
          <h2 className="text-lg font-semibold text-white mb-4">
            Detailed Solutions
          </h2>
          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.answer;
              const isUnattempted = !userAnswer;

              return (
                <div
                  key={idx}
                  className={`bg-white/[0.03] border rounded-2xl p-5 ${
                    isUnattempted
                      ? "border-amber-500/20"
                      : isCorrect
                      ? "border-emerald-500/20"
                      : "border-rose-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-sm font-bold text-gray-500 shrink-0 mt-0.5">
                      Q{idx + 1}.
                    </span>
                    <p className="text-white font-medium text-sm leading-relaxed">
                      {q.question}
                    </p>
                  </div>

                  <div className="ml-8 space-y-1.5">
                    {isUnattempted ? (
                      <p className="text-xs text-amber-400">Not attempted</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <p
                          className={`text-sm ${
                            isCorrect ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          Your answer: {userAnswer}
                        </p>
                      </div>
                    )}
                    {(!isCorrect || isUnattempted) && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <p className="text-sm text-emerald-400">
                          Correct answer: {q.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/notes")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200"
            >
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ INTERFACE ───
  const currentQ = questions[currentIndex];
  console.log("Questions:", questions);
console.log("Current Question:", currentQ);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/notes")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Exit Quiz</span>
          </button>

          <div className="flex items-center gap-4">
            {source && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full hidden sm:flex items-center gap-1.5 ${
                  source === "database"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {source === "database" ? "Cached" : "Fresh"}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-gray-400 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono font-medium">
                {formatTime(totalTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 mb-6">
          <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
            {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((option, idx) => {
            const isSelected = answers[currentIndex] === option;
            const optionLetter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                onClick={() => selectOption(option)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                    : "bg-white/[0.03] border-white/[0.06] text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-white/[0.05] text-gray-500 group-hover:text-gray-300"
                  }`}
                >
                  {optionLetter}
                </span>
                <span className="text-sm md:text-base">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200 ${
              currentIndex === 0
                ? "bg-white/[0.02] text-gray-600 cursor-not-allowed border border-white/[0.04]"
                : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Question dots — desktop only */}
          <div className="hidden md:flex items-center gap-1">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  recordQuestionTime(currentIndex);
                  setCurrentIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  idx === currentIndex
                    ? "bg-indigo-400 scale-125"
                    : answers[idx] !== undefined
                    ? "bg-violet-400/60"
                    : "bg-white/[0.1]"
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-3 font-medium transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteQuiz;
