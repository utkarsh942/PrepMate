import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Sparkles, Loader2, BookOpen } from "lucide-react";
import api from "../utils/api";
import { toast } from "../components/Toast";

function NoteSummary() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get(`/generate-summary/${noteId}`);
        setSummary(response.data.summary || "");
        setSource(response.data.source || "");
      } catch (err) {
        setError(true);
        toast.error(err.response?.data?.message || "Failed to generate summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [noteId]);

  const renderSummary = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    const elements = [];
    let key = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={key++} className="h-3" />);
        continue;
      }

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4
            key={key++}
            className="text-base font-semibold text-white mt-5 mb-2"
          >
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h3
            key={key++}
            className="text-lg font-bold text-white mt-6 mb-2"
          >
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      } else if (trimmed.startsWith("# ")) {
        elements.push(
          <h2
            key={key++}
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mt-6 mb-3"
          >
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        elements.push(
          <div key={key++} className="flex items-start gap-2 ml-4 mb-1.5">
            <span className="text-indigo-400 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <p className="text-gray-300 leading-relaxed">
              {renderInlineFormatting(trimmed.slice(2))}
            </p>
          </div>
        );
      } else {
        elements.push(
          <p key={key++} className="text-gray-300 leading-relaxed mb-2">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      }
    }

    return elements;
  };

  const renderInlineFormatting = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
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
            AI is analyzing your notes...
          </h2>
          <p className="text-gray-400 text-sm">
            Generating a comprehensive summary
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
            <BookOpen className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to Generate Summary
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Something went wrong while analyzing your notes.
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-3xl mx-auto">
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

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Summary</h1>
            <p className="text-gray-500 text-sm">
              Auto-generated from your uploaded notes
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8">
          {summary ? (
            <div className="prose-custom">{renderSummary(summary)}</div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No summary content available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/notes")}
            className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300 rounded-xl px-6 py-3 font-medium transition-all"
          >
            Back to Notes
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteSummary;
