import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Brain, 
  Target, 
  Clock, 
  Upload, 
  BookOpen, 
  Award, 
  ArrowRight,
  Sparkles,
  Trophy,
  Flame,
  TrendingUp
} from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    avgAccuracy: 0,
    avgTime: '0s',
    bestScore: 0,
    studyStreak: 0,
  });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const analyticsPromise = api.get('/analytics/test-analytics').catch(e => ({ data: {} }));
        const notesPromise = api.get('/get-notes?limit=100').catch(e => ({ data: [] }));

        const [analyticsRes, notesRes] = await Promise.all([analyticsPromise, notesPromise]);
        
        const analytics = analyticsRes.data || {};
        const notes = notesRes.data.notes || notesRes.data || [];

        // Format Avg Time
        const totalSeconds = analytics.average_time_per_quiz_seconds || 0;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.round(totalSeconds % 60);
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

        // Calculate best score
        const recentAttempts = analytics.recent_attempts || [];
        const bestScore = recentAttempts.length > 0
          ? Math.max(...recentAttempts.map(a => Math.round(a.accuracy || 0)))
          : 0;

        // Calculate study streak from recent attempts
        let streak = 0;
        if (recentAttempts.length > 0) {
          const dates = [...new Set(recentAttempts.map(a => {
            const d = new Date(a.date || a.timestamp);
            return d.toDateString();
          }))];
          streak = Math.min(dates.length, 7);
        }

        // Build weekly activity data from recent attempts
        const weekDays = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        recentAttempts.forEach(a => {
          const d = new Date(a.date || a.timestamp);
          const daysDiff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff < 7) {
            weekDays[6 - daysDiff] += 1;
          }
        });
        setWeeklyData(weekDays);

        setStats({
          totalNotes: notes.length,
          totalQuizzes: analytics.total_quizzes_taken || 0,
          avgAccuracy: Math.round(analytics.average_accuracy || 0),
          avgTime: timeStr,
          bestScore,
          studyStreak: streak,
        });

        setAttempts(recentAttempts);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      label: 'Total Notes', 
      value: stats.totalNotes, 
      icon: FileText, 
      gradient: 'from-indigo-600 to-indigo-400',
      bgGlow: 'bg-indigo-500/10',
    },
    { 
      label: 'Quizzes Taken', 
      value: stats.totalQuizzes, 
      icon: Brain, 
      gradient: 'from-violet-600 to-violet-400',
      bgGlow: 'bg-violet-500/10',
    },
    { 
      label: 'Avg Accuracy', 
      value: `${stats.avgAccuracy}%`, 
      icon: Target, 
      gradient: 'from-emerald-600 to-emerald-400',
      bgGlow: 'bg-emerald-500/10',
    },
    { 
      label: 'Study Streak', 
      value: `${stats.studyStreak}d`, 
      icon: Flame, 
      gradient: 'from-orange-600 to-amber-400',
      bgGlow: 'bg-orange-500/10',
    },
    { 
      label: 'Avg Time / Quiz', 
      value: stats.avgTime, 
      icon: Clock, 
      gradient: 'from-cyan-600 to-cyan-400',
      bgGlow: 'bg-cyan-500/10',
    },
    { 
      label: 'Best Score', 
      value: `${stats.bestScore}%`, 
      icon: Trophy, 
      gradient: 'from-fuchsia-600 to-pink-400',
      bgGlow: 'bg-fuchsia-500/10',
    },
  ];

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivity = Math.max(...weeklyData, 1);

  // Skeleton loading
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Greeting skeleton */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8">
          <div className="h-8 w-72 bg-white/[0.06] rounded-lg mb-3" />
          <div className="h-5 w-96 bg-white/[0.04] rounded-lg" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.03] border border-white/[0.05] rounded-2xl" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/[0.03] border border-white/[0.05] rounded-2xl" />
          <div className="h-64 bg-white/[0.03] border border-white/[0.05] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Greeting Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/10 via-violet-600/10 to-fuchsia-600/10 border border-white/[0.06] p-8 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Student'}!
            </h1>
            <Sparkles className="w-7 h-7 text-indigo-400 animate-float" />
          </div>
          <p className="text-gray-400 max-w-lg">
            Here's a summary of your study performance. Keep up the great work and stay consistent! 🚀
          </p>
        </div>
      </div>

      {/* ─── Stats Grid (6 cards) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="group relative overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              {/* Gradient glow */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${card.bgGlow} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:w-28 group-hover:h-28 transition-all duration-500`} />
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{card.label}</p>
                  <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Weekly Progress & Recent Activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <div className="flex items-center gap-2.5 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Weekly Activity</h2>
          </div>
          <div className="flex items-end justify-between gap-3 h-40">
            {weeklyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-28">
                  <div
                    className={`w-full rounded-lg transition-all duration-700 ${
                      val > 0
                        ? 'bg-gradient-to-t from-indigo-600 to-violet-500'
                        : 'bg-white/[0.04]'
                    }`}
                    style={{
                      height: val > 0 ? `${Math.max((val / maxActivity) * 100, 15)}%` : '8px',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
          <div className="flex items-center gap-2.5 mb-6">
            <Award className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Recent Quizzes</h2>
          </div>

          {attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
              <Brain className="w-8 h-8 mb-3 text-gray-600" />
              <p>No quizzes taken yet</p>
              <p className="text-xs text-gray-600 mt-1">Start from your notes!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {attempts.slice(0, 5).map((attempt, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      attempt.accuracy >= 80
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : attempt.accuracy >= 50
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {Math.round(attempt.accuracy)}%
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {attempt.correct_answers}/{attempt.total_questions} correct
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(attempt.date || attempt.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {attempt.time_spent_seconds
                      ? `${Math.floor(attempt.time_spent_seconds / 60)}m ${attempt.time_spent_seconds % 60}s`
                      : 'N/A'
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/upload')}
          className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-indigo-600/5 to-indigo-600/[0.02] border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
          style={{ animationDelay: '0.7s', opacity: 0 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">Upload Material</h4>
              <p className="text-xs text-gray-400">Process notes with Gemini AI</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        <div
          onClick={() => navigate('/notes')}
          className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-violet-600/5 to-violet-600/[0.02] border border-white/[0.06] hover:border-violet-500/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
          style={{ animationDelay: '0.8s', opacity: 0 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">Browse Notes</h4>
              <p className="text-xs text-gray-400">View summaries & flashcards</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        <div
          onClick={() => navigate('/notes')}
          className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-fuchsia-600/5 to-fuchsia-600/[0.02] border border-white/[0.06] hover:border-fuchsia-500/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
          style={{ animationDelay: '0.9s', opacity: 0 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-400 flex items-center justify-center mb-3 shadow-lg shadow-fuchsia-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">Start Quiz</h4>
              <p className="text-xs text-gray-400">Test your knowledge</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
