import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Loader2, RotateCcw } from "lucide-react";
import api from "../utils/api";
import { toast } from "../components/Toast";

function NoteFlashcards() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get(`/generate-flashcards/${noteId}`);
        const raw = response.data.flashcards || [];

        const normalized = raw.map((card) => ({
          front: card.front || card.question || "No question",
          back: card.back || card.answer || "No answer",
        }));

        setFlashcards(normalized);
        setSource(response.data.source || "");
      } catch (err) {
        setError(true);
        toast.error(
          err.response?.data?.message || "Failed to generate flashcards"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [noteId]);

  const goToPrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") goToPrevious();
    else if (e.key === "ArrowRight") goToNext();
    else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleFlip();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 rounded-full bg-violet-500/20 animate-ping" />
            <div className="absolute w-16 h-16 rounded-full bg-violet-500/10 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Generating flashcards...
          </h2>
          <p className="text-gray-400 text-sm">
            AI is creating study cards from your notes
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
            <RotateCcw className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to Generate Flashcards
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

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Flashcards Generated
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            The AI couldn't generate flashcards from this note.
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

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/notes")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Notes</span>
          </button>

          {source && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                source === "database"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {source === "database" ? "Cached" : "Freshly Generated"}
            </span>
          )}
        </div>

        {/* Title & Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Flashcards</h1>
              <p className="text-gray-500 text-sm">Click a card to flip it</p>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-400">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <div
          className="relative cursor-pointer select-none"
          onClick={toggleFlip}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="w-full min-h-[320px] bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                Question
              </span>
              <p className="text-lg md:text-xl text-white text-center leading-relaxed font-medium">
                {currentCard.front}
              </p>
              <p className="text-gray-500 text-xs mt-8">
                Tap to reveal answer
              </p>
            </div>

            {/* Back */}
            <div
              className="w-full min-h-[320px] bg-white/[0.03] border border-indigo-500/20 rounded-2xl p-8 flex flex-col items-center justify-center absolute top-0 left-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                Answer
              </span>
              <p className="text-lg md:text-xl text-gray-300 text-center leading-relaxed">
                {currentCard.back}
              </p>
              <p className="text-gray-500 text-xs mt-8">
                Tap to see question
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
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

          {/* Dots */}
          <div className="hidden md:flex items-center gap-1.5">
            {flashcards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-violet-400 w-6"
                    : "bg-white/[0.1] hover:bg-white/[0.2]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === flashcards.length - 1}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200 ${
              currentIndex === flashcards.length - 1
                ? "bg-white/[0.02] text-gray-600 cursor-not-allowed border border-white/[0.04]"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Use ← → arrow keys to navigate, Space to flip
        </p>
      </div>
    </div>
  );
}

export default NoteFlashcards;
