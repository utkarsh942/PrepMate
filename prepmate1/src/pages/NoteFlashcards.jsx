import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Loader2, RotateCcw, CopyPlus, Layers } from "lucide-react";
import api from "../utils/api";
import { toast } from "../components/Toast";

const PHASE = {
  CONFIG: "config",
  CARDS: "cards",
};

function NoteFlashcards() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASE.CONFIG);
  const [numCards, setNumCards] = useState(5);

  const [flashcards, setFlashcards] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.get(`/generate-flashcards/${noteId}`, {
        params: { num_cards: numCards }
      });
      const raw = response.data.flashcards || [];

      const normalized = raw.map((card) => ({
        front: card.front || card.question || "No question",
        back: card.back || card.answer || "No answer",
      }));

      setFlashcards(normalized);
      setSource(response.data.source || "");
      setCurrentIndex(0);
      setIsFlipped(false);
      setPhase(PHASE.CARDS);
    } catch (err) {
      setError(true);
      toast.error(
        err.response?.data?.message || "Failed to generate flashcards"
      );
    } finally {
      setLoading(false);
    }
  };

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
    if (phase !== PHASE.CARDS) return;
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

  // ─────────────────────────────────────────
  // ─── PHASE 1: CONFIGURATION SCREEN ──────
  // ─────────────────────────────────────────
  if (phase === PHASE.CONFIG) {
    const cardCounts = [5, 10, 15, 20];

    return (
      <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
        <div className="max-w-xl mx-auto mt-10">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate("/notes")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Flashcard Settings</h1>
              <p className="text-gray-400 text-sm mt-0.5">Choose how many cards to generate</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Number of Cards
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {cardCounts.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumCards(n)}
                  className={`py-4 rounded-xl border text-center font-semibold transition-all duration-200 cursor-pointer ${
                    numCards === n
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300 shadow-lg shadow-violet-500/10"
                      : "bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.12]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              Failed to generate flashcards. Please try again.
            </div>
          )}

          <button
            onClick={fetchFlashcards}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl py-4 font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Flashcards...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {numCards} Flashcards
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // ─── PHASE 2: CARDS SCREEN ───────────────
  // ─────────────────────────────────────────
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
            onClick={() => setPhase(PHASE.CONFIG)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
            Try Again
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
            onClick={() => setPhase(PHASE.CONFIG)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">New Cards</span>
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
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200 cursor-pointer ${
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
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
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
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200 cursor-pointer ${
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
