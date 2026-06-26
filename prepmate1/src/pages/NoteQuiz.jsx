import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "../components/Toast";
import QuizConfig from "../components/quiz/QuizConfig";
import QuizPanel from "../components/quiz/QuizPanel";
import QuizResults from "../components/quiz/QuizResults";

const PHASE = {
  CONFIG: "config",
  QUIZ: "quiz",
  RESULTS: "results",
};

export default function NoteQuiz() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASE.CONFIG);
  const [loading, setLoading] = useState(false);
  
  const [quizData, setQuizData] = useState({
    questions: [],
    title: "Note Assessment",
    timerSeconds: 0,
  });

  const [resultsData, setResultsData] = useState({
    userAnswers: new Map(),
    timeSpent: 0
  });

  const [startTime, setStartTime] = useState(null);

  // Randomize questions slightly or as requested by user
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const handleStartQuiz = async (config) => {
    try {
      setLoading(true);
      const { difficulty, numQuestions, timerMinutes } = config;

      const response = await api.get(`/generate-quiz/${noteId}`, {
        params: {
          num_questions: numQuestions,
          difficulty: difficulty,
        },
      });

      if (response.data.message && !response.data.questions && !response.data.quiz) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      let fetchedQuestions = response.data.questions || response.data.quiz || [];
      if (typeof fetchedQuestions === "string") {
        try {
          fetchedQuestions = JSON.parse(fetchedQuestions);
        } catch {
          toast.error("Quiz data format is invalid.");
          setLoading(false);
          return;
        }
      }

      if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
        toast.error("No questions were generated.");
        setLoading(false);
        return;
      }

      // Normalize
      const normalized = fetchedQuestions
        .filter((q) => q && typeof q === "object" && q.question)
        .map((q) => ({
          question: q.question || "",
          options: Array.isArray(q.options) ? q.options.map(String) : [],
          correct_answer: q.correct_answer || q.answer || "",
          explanation: q.explanation || "",
        }));

      if (normalized.length === 0) {
        toast.error("Quiz questions could not be parsed.");
        setLoading(false);
        return;
      }

      // We can always shuffle options for variety
      const finalQuestions = normalized.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));

      setQuizData({
        questions: finalQuestions,
        title: response.data.source || "Note Assessment",
        timerSeconds: timerMinutes * 60,
      });

      setStartTime(Date.now());
      setPhase(PHASE.QUIZ);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async (answersMap) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    setResultsData({
      userAnswers: answersMap,
      timeSpent: timeSpent
    });
    
    setPhase(PHASE.RESULTS);

    // Calculate correct answers for analytics
    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (answersMap.get(idx) === q.correct_answer) {
        correctCount++;
      }
    });

    try {
      await api.post("/analytics/submit-quiz", {
        note_id: noteId,
        total_questions: quizData.questions.length,
        correct_answers: correctCount,
        time_spent_seconds: timeSpent,
        per_question_time: [], // We omitted per-question time tracking for brevity
      });
    } catch {
      // Non-blocking
    }
  };

  const handleRetry = () => {
    setPhase(PHASE.CONFIG);
    setQuizData({ questions: [], title: "", timerSeconds: 0 });
    setResultsData({ userAnswers: new Map(), timeSpent: 0 });
  };

  return (
    <>
      {phase === PHASE.CONFIG && (
        <div className="relative">
          <button 
            onClick={() => navigate("/notes")} 
            className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 z-10 bg-white/[0.05] px-4 py-2 rounded-xl border border-white/[0.1]"
          >
            Back to Notes
          </button>
          <QuizConfig onStart={handleStartQuiz} loading={loading} />
        </div>
      )}

      {phase === PHASE.QUIZ && (
        <QuizPanel
          questions={quizData.questions}
          title={quizData.title}
          timerSeconds={quizData.timerSeconds}
          onSubmit={handleSubmitQuiz}
        />
      )}

      {phase === PHASE.RESULTS && (
        <QuizResults
          questions={quizData.questions}
          userAnswers={resultsData.userAnswers}
          timeSpent={resultsData.timeSpent}
          onRetry={handleRetry}
          onBackToNotes={() => navigate("/notes")}
        />
      )}
    </>
  );
}
