import { useNavigate } from "react-router-dom";
import {
  Upload,
  Brain,
  BookOpen,
  Sparkles,
  BarChart3,
  Search,
  ArrowRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Notes",
    description: "Upload PDFs and let AI extract the important stuff",
    gradient: "from-indigo-500/10 to-indigo-500/5",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    hoverBorder: "hover:border-indigo-500/20",
  },
  {
    icon: Brain,
    title: "AI Quiz Generator",
    description: "Automatic MCQ generation from your study material",
    gradient: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    hoverBorder: "hover:border-violet-500/20",
  },
  {
    icon: BookOpen,
    title: "AI Summaries",
    description: "Get concise summaries of lengthy notes in seconds",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    hoverBorder: "hover:border-cyan-500/20",
  },
  {
    icon: Sparkles,
    title: "Flashcards",
    description: "AI-generated flashcards for quick revision",
    gradient: "from-fuchsia-500/10 to-fuchsia-500/5",
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-400",
    hoverBorder: "hover:border-fuchsia-500/20",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with detailed analytics",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/20",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find any note instantly with intelligent search",
    gradient: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    hoverBorder: "hover:border-amber-500/20",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* ───────────── Hero Section ───────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[100px] animate-float [animation-delay:2s]" />
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-fuchsia-500/5 rounded-full blur-[80px] animate-float [animation-delay:4s]" />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full glass text-gray-400 mb-8 animate-slide-down">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Study Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Turn Your Notes Into
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient">
              Smart AI Tests
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mt-6 animate-slide-up [animation-delay:0.2s]" style={{ opacity: 0 }}>
            PrepMate uses AI to convert your PDFs into summaries, quizzes, and
            flashcards — automatically.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-10 flex-wrap animate-slide-up [animation-delay:0.4s]" style={{ opacity: 0 }}>
            <button
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl px-7 py-3.5 font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="glass hover:bg-white/[0.06] text-gray-300 rounded-xl px-7 py-3.5 font-semibold transition-all cursor-pointer hover:scale-[1.02]"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ───────────── Features Grid ───────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Everything you need
              </span>
              <br />
              <span className="text-white mt-2 block">
                to study smarter
              </span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              Powerful tools designed to transform how you learn and prepare for
              exams.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-gradient-to-br ${feature.gradient} border border-white/[0.06] ${feature.hoverBorder} rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300`}>
                    <Icon className={`${feature.iconColor} w-6 h-6`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Bottom CTA ───────────── */}
      <section className="py-24 px-6">
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-indigo-500/8 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Ready to ace your exams?
            </h2>
            <p className="text-gray-400 mt-4 max-w-md mx-auto">
              Join thousands of students who are studying smarter with
              AI-powered tools.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl px-7 py-3.5 font-semibold transition-all duration-300 mt-8 inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02]"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="border-t border-white/[0.06]">
        <p className="text-gray-500 text-sm py-8 text-center">
          Built with ❤️ by PrepMate Team &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
