import { useState, useEffect, useRef, useCallback } from "react";
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
  Settings,
  Shuffle,
  Eye,
  ClipboardCheck,
  Timer,
  BarChart3,
  RotateCcw,
  Trophy,
  Zap,
  BookOpen,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "../components/Toast";

// ─── PHASE ENUM ───
const PHASE = {
  CONFIG: "config",
  QUIZ: "quiz",
  RESULTS: "results",
};

// ─── GRADE CALCULATOR ───
function getGrade(pct) {
  if (pct >= 95) return { letter: "A+", color: "text-emerald-400", msg: "Outstanding! Perfect mastery!" };
  if (pct >= 85) return { letter: "A", color: "text-emerald-400", msg: "Excellent work! You know this well." };
  if (pct >= 75) return { letter: "B+", color: "text-green-400", msg: "Great job! Almost there." };
  if (pct >= 65) return { letter: "B", color: "text-green-400", msg: "Good performance! Keep improving." };
  if (pct >= 55) return { letter: "C+", color: "text-yellow-400", msg: "Fair effort. Review the weak areas." };
  if (pct >= 45) return { letter: "C", color: "text-yellow-400", msg: "Needs improvement. Study more." };
  if (pct >= 35) return { letter: "D", color: "text-orange-400", msg: "Below average. Revisit the material." };
  return { letter: "F", color: "text-rose-400", msg: "Keep trying! Review your notes thoroughly." };
}

// ─── SHUFFLE UTILITY ───
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function NoteQuiz() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  // ─── Phase ───
  const [phase, setPhase] = useState(PHASE.CONFIG);

  // ─── Config ───
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [timerMinutes, setTimerMinutes] = useState(0); // 0 = no timer
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showAnswersAfterSubmit, setShowAnswersAfterSubmit] = useState(true);
  const [allowReview, setAllowReview] = useState(true);

  // ─── Quiz State ───
  const [questions, setQuestions] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // ─── Timer ───
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [perQuestionTimes, setPerQuestionTimes] = useState({});
  const timerRef = useRef(null);

  // ─── Results ───
  const [results, setResults] = useState(null);

  // ─── FETCH QUIZ ───
  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/generate-quiz/${noteId}`, {
        params: {
          num_questions: numQuestions,
          difficulty: difficulty,
        },
      });

      // Handle error responses from backend
      if (response.data.message && !response.data.questions) {
        setError(response.data.message);
        return;
      }

      let fetchedQuestions = response.data.questions || response.data.quiz || [];

      // If quiz data is a string (legacy format), try to parse it
      if (typeof fetchedQuestions === "string") {
        try {
          fetchedQuestions = JSON.parse(fetchedQuestions);
        } catch {
          setError("Quiz data format is invalid. Please try regenerating.");
          return;
        }
      }

      if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
        setError("No questions were generated. Please try again.");
        return;
      }

      // Normalize question format
      const normalized = fetchedQuestions
        .filter((q) => q && typeof q === "object" && q.question)
        .map((q) => ({
          question: q.question || "",
          options: Array.isArray(q.options) ? q.options.map(String) : [],
          correct_answer: q.correct_answer || q.answer || "",
          explanation: q.explanation || "",
        }));

      if (normalized.length === 0) {
        setError("Quiz questions could not be parsed. Please try again.");
        return;
      }

      // Apply shuffling
      let finalQuestions = shuffleQuestions ? shuffleArray(normalized) : normalized;
      if (shuffleOptions) {
        finalQuestions = finalQuestions.map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }));
      }

      setQuestions(finalQuestions);
      setSource(response.data.source || "");
      setCurrentIndex(0);
      setAnswers({});
      setPerQuestionTimes({});
      setTotalElapsed(0);
      setQuestionStartTime(Date.now());

      // Set timer
      if (timerMinutes > 0) {
        setTimeLeft(timerMinutes * 60);
      }

      setPhase(PHASE.QUIZ);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to generate quiz. Please try again.");
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }, [noteId, numQuestions, difficulty, shuffleQuestions, shuffleOptions, timerMinutes]);

  // ─── ELAPSED TIMER ───
  useEffect(() => {
    if (phase !== PHASE.QUIZ || submitted) return;
    timerRef.current = setInterval(() => {
      setTotalElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitted]);

  // ─── COUNTDOWN TIMER ───
  useEffect(() => {
    if (phase !== PHASE.QUIZ || submitted || timerMinutes === 0) return;
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [phase, submitted, timerMinutes]);

  // ─── KEYBOARD SHORTCUTS ───
  useEffect(() => {
    if (phase !== PHASE.QUIZ || submitted) return;
    const handleKey = (e) => {
      const currentQ = questions[currentIndex];
      if (!currentQ) return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (currentQ.options && currentQ.options[idx]) {
          selectOption(currentQ.options[idx]);
        }
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, submitted, currentIndex, questions]);

  // ─── HELPERS ───
  const formatTime = (seconds) => {
    if (seconds == null || isNaN(seconds)) return "00:00";
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

  const handleSubmit = useCallback(async () => {
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
      } else if (userAnswer === q.correct_answer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const finalPerQuestionTimes = questions.map((_, idx) => perQuestionTimes[idx] || 0);

    setResults({
      correctCount,
      wrongCount,
      unattempted,
      accuracy: pct,
      totalTime: totalElapsed,
      grade: getGrade(pct),
      totalQuestions: questions.length,
    });
    setSubmitted(true);
    setSubmitting(false);
    setPhase(PHASE.RESULTS);

    // Submit analytics (non-blocking)
    try {
      await api.post("/analytics/submit-quiz", {
        note_id: noteId,
        total_questions: questions.length,
        correct_answers: correctCount,
        time_spent_seconds: totalElapsed,
        per_question_time: finalPerQuestionTimes,
      });
    } catch {
      // Silently fail — don't block results display
    }
  }, [questions, answers, currentIndex, perQuestionTimes, totalElapsed, noteId]);

  const restartQuiz = () => {
    setPhase(PHASE.CONFIG);
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setSubmitted(false);
    setError("");
    setTotalElapsed(0);
    setTimeLeft(0);
    setCurrentIndex(0);
    setPerQuestionTimes({});
    setShowReview(false);
  };

  // ─────────────────────────────────────────
  // ─── PHASE 1: CONFIGURATION SCREEN ──────
  // ─────────────────────────────────────────
  if (phase === PHASE.CONFIG) {
    const difficulties = [
      { value: "easy", label: "Easy", icon: BookOpen, color: "emerald", desc: "Basic recall & understanding" },
      { value: "medium", label: "Medium", icon: Brain, color: "indigo", desc: "Application & analysis" },
      { value: "hard", label: "Hard", icon: Zap, color: "rose", desc: "Critical thinking & synthesis" },
    ];
    const questionCounts = [5, 10, 15, 20];
    const timerOptions = [
      { value: 0, label: "No Timer" },
      { value: 5, label: "5 min" },
      { value: 10, label: "10 min" },
      { value: 15, label: "15 min" },
      { value: 20, label: "20 min" },
      { value: 30, label: "30 min" },
    ];

    return (
      <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate("/notes")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Quiz Configuration</h1>
              <p className="text-gray-400 text-sm mt-0.5">Customize your quiz experience</p>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Difficulty Level
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((d) => {
                const Icon = d.icon;
                const isActive = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer group ${
                      isActive
                        ? `bg-${d.color}-500/10 border-${d.color}-500/30 shadow-lg shadow-${d.color}-500/5`
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]"
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
                    <p className={`text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}>{d.label}</p>
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
            <div className="flex gap-3">
              {questionCounts.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`flex-1 py-3 rounded-xl border text-center font-semibold transition-all duration-200 cursor-pointer ${
                    numQuestions === n
                      ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                      : "bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.12]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Timer className="w-4 h-4" /> Timer
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {timerOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTimerMinutes(t.value)}
                  className={`py-2.5 rounded-xl border text-center text-sm font-medium transition-all duration-200 cursor-pointer ${
                    timerMinutes === t.value
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.12]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Quiz Settings
            </h2>
            <div className="space-y-3">
              {[
                { label: "Shuffle Questions", icon: Shuffle, value: shuffleQuestions, setter: setShuffleQuestions },
                { label: "Shuffle Options", icon: Shuffle, value: shuffleOptions, setter: setShuffleOptions },
                { label: "Show Correct Answers After Submission", icon: Eye, value: showAnswersAfterSubmit, setter: setShowAnswersAfterSubmit },
                { label: "Allow Review Before Submit", icon: ClipboardCheck, value: allowReview, setter: setAllowReview },
              ].map((setting) => {
                const Icon = setting.icon;
                return (
                  <button
                    key={setting.label}
                    onClick={() => setting.setter(!setting.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      setting.value
                        ? "bg-indigo-600/10 border-indigo-500/20"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${setting.value ? "text-indigo-400" : "text-gray-500"}`} />
                      <span className={`text-sm font-medium ${setting.value ? "text-white" : "text-gray-400"}`}>
                        {setting.label}
                      </span>
                    </div>
                    <div className={`w-10 h-6 rounded-full relative transition-all duration-300 ${
                      setting.value ? "bg-indigo-600" : "bg-white/[0.1]"
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                        setting.value ? "left-5" : "left-1"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={fetchQuiz}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-4 font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Start Quiz
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // ─── PHASE 3: RESULTS SCREEN ────────────
  // ─────────────────────────────────────────
  if (phase === PHASE.RESULTS && results) {
    const { correctCount, wrongCount, unattempted, accuracy, totalTime, grade, totalQuestions } = results;
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (accuracy / 100) * circumference;
    const strokeColor = accuracy >= 70 ? "#818cf8" : accuracy >= 40 ? "#fbbf24" : "#f87171";

    return (
      <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-scale-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-500/20">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className="text-gray-400">Here's your performance breakdown</p>
          </div>

          {/* Score + Grade Row */}
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
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 flex flex-col items-center justify-center animate-scale-in" style={{ animationDelay: "100ms" }}>
              <span className={`text-7xl font-black ${grade.color} mb-3`}>{grade.letter}</span>
              <p className="text-white font-medium text-center mb-2">{grade.msg}</p>
              <p className="text-xs text-gray-500 text-center">Based on {totalQuestions} questions</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Correct", value: correctCount, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Wrong", value: wrongCount, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
              { label: "Skipped", value: unattempted, icon: Target, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { label: "Time", value: formatTime(totalTime), icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
              { label: "Accuracy", value: `${accuracy}%`, icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
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

          {/* Review Answers */}
          {showAnswersAfterSubmit && (
            <>
              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-gray-300 font-medium transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                {showReview ? "Hide" : "Review"} Answers
              </button>

              {showReview && (
                <div className="space-y-4 mb-8">
                  {questions.map((q, idx) => {
                    const userAnswer = answers[idx];
                    const isCorrect = userAnswer === q.correct_answer;
                    const isUnattempted = !userAnswer;

                    return (
                      <div
                        key={idx}
                        className={`bg-white/[0.03] border rounded-2xl p-5 animate-scale-in ${
                          isUnattempted
                            ? "border-amber-500/20"
                            : isCorrect
                            ? "border-emerald-500/20"
                            : "border-rose-500/20"
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-sm font-bold text-gray-500 shrink-0 mt-0.5">Q{idx + 1}.</span>
                          <p className="text-white font-medium text-sm leading-relaxed">{q.question}</p>
                        </div>

                        {/* Options review */}
                        <div className="ml-8 space-y-1.5 mb-3">
                          {(q.options || []).map((opt, optIdx) => {
                            const isUserChoice = userAnswer === opt;
                            const isCorrectOpt = q.correct_answer === opt;
                            let optClass = "text-gray-500";
                            if (isCorrectOpt) optClass = "text-emerald-400 font-medium";
                            else if (isUserChoice && !isCorrect) optClass = "text-rose-400 line-through";

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

                        {/* Explanation */}
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
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={restartQuiz}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Quiz
            </button>
            <button
              onClick={() => navigate("/notes")}
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

  // ─────────────────────────────────────────
  // ─── PHASE 2: QUIZ INTERFACE ────────────
  // ─────────────────────────────────────────
  if (phase === PHASE.QUIZ) {
    // Loading state
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-20 h-20 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Generating your quiz...</h2>
            <p className="text-gray-400 text-sm">AI is crafting questions from your notes</p>
            <div className="mt-6 flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Failed to Generate Quiz</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={restartQuiz}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/notes")}
                className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300 rounded-xl px-6 py-3 font-medium transition-all duration-200 cursor-pointer"
              >
                Back to Notes
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Empty state
    if (!questions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Questions Generated</h2>
            <p className="text-gray-400 text-sm mb-6">The AI couldn't generate questions from this note.</p>
            <button
              onClick={restartQuiz}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Review before submit
    if (showReview && allowReview && !submitted) {
      const attempted = Object.keys(answers).length;
      const remaining = questions.length - attempted;

      return (
        <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <ClipboardCheck className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Review Before Submitting</h1>
              <p className="text-gray-400 text-sm">Check your answers before final submission</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{attempted}</p>
                <p className="text-xs text-gray-400">Answered</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{remaining}</p>
                <p className="text-xs text-gray-400">Unanswered</p>
              </div>
            </div>

            {/* Question Overview */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowReview(false);
                    setCurrentIndex(idx);
                  }}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all cursor-pointer ${
                    answers[idx] !== undefined
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                      : "bg-white/[0.03] border border-white/[0.06] text-gray-500"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowReview(false)}
                className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300 rounded-xl px-6 py-3 font-medium transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ─── MAIN QUIZ UI ───
    const currentQ = questions[currentIndex];
    if (!currentQ) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <p className="text-gray-400">Loading question...</p>
        </div>
      );
    }

    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLastQuestion = currentIndex === questions.length - 1;
    const timerDanger = timerMinutes > 0 && timeLeft <= 30;

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
              <span className="text-sm font-medium">Exit</span>
            </button>

            <div className="flex items-center gap-3">
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

              {/* Timer Display */}
              {timerMinutes > 0 ? (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  timerDanger
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-timer-pulse"
                    : "bg-white/[0.03] border-white/[0.06] text-gray-400"
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono font-medium">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-400 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono font-medium">{formatTime(totalElapsed)}</span>
                </div>
              )}
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
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 md:p-8 mb-6 animate-scale-in" key={`q-${currentIndex}`}>
            <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {(currentQ.options || []).map((option, idx) => {
              const isSelected = answers[currentIndex] === option;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  onClick={() => selectOption(option)}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/5"
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
                  {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-gray-600 mb-6 hidden md:block">
            Press 1-4 to select • ← → to navigate
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200 cursor-pointer ${
                currentIndex === 0
                  ? "bg-white/[0.02] text-gray-600 cursor-not-allowed border border-white/[0.04]"
                  : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Question dots */}
            <div className="hidden md:flex items-center gap-1">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    recordQuestionTime(currentIndex);
                    setCurrentIndex(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
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
                onClick={() => {
                  if (allowReview) {
                    setShowReview(true);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                {allowReview ? "Review & Submit" : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={goToNext}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-3 font-medium transition-all duration-200 cursor-pointer"
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

  // ─── Fallback ───
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );
}

export default NoteQuiz;
