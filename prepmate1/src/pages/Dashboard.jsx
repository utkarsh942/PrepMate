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
  Sparkles
} from 'lucide-react';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    avgAccuracy: 0,
    avgTime: '0s',
  });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch analytics
        const analyticsPromise = api.get('/analytics/test-analytics').catch(e => ({ data: {} }));
        // Fetch notes
        const notesPromise = api.get('/get-notes?limit=100').catch(e => ({ data: [] }));

        const [analyticsRes, notesRes] = await Promise.all([analyticsPromise, notesPromise]);
        
        const analytics = analyticsRes.data || {};
        const notes = notesRes.data.notes || notesRes.data || [];

        // Format Avg Time
        const totalSeconds = analytics.average_time_per_quiz_seconds || 0;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.round(totalSeconds % 60);
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

        setStats({
          totalNotes: notes.length,
          totalQuizzes: analytics.total_quizzes_taken || 0,
          avgAccuracy: Math.round(analytics.average_accuracy || 0),
          avgTime: timeStr,
        });

        setAttempts(analytics.recent_attempts || []);
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
      border: 'border-l-indigo-500',
      bg: 'from-indigo-500/5 to-transparent'
    },
    { 
      label: 'Quizzes Taken', 
      value: stats.totalQuizzes, 
      icon: Brain, 
      border: 'border-l-violet-500',
      bg: 'from-violet-500/5 to-transparent'
    },
    { 
      label: 'Average Accuracy', 
      value: `${stats.avgAccuracy}%`, 
      icon: Target, 
      border: 'border-l-emerald-500',
      bg: 'from-emerald-500/5 to-transparent'
    },
    { 
      label: 'Avg Time / Quiz', 
      value: stats.avgTime, 
      icon: Clock, 
      border: 'border-l-amber-500',
      bg: 'from-amber-500/5 to-transparent'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-white/[0.05] rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/[0.03] border border-white/[0.05] rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white/[0.03] border border-white/[0.05] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Welcome back, {user?.full_name || 'Student'}!
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-gray-400 mt-1">Here is a summary of your recent study performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.bg} border-y border-r border-white/[0.06] border-l-4 ${card.border} rounded-2xl p-6 flex items-center justify-between shadow-xl`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-400">{card.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1.5">{card.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-gray-300">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Attempts */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <Award className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Recent Quiz Attempts</h2>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No quiz attempts recorded yet. Head over to My Notes to generate a test!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] text-xs font-semibold text-gray-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4">Time Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {attempts.map((attempt, index) => (
                  <tr key={index} className="text-sm text-gray-300 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4">
                      {new Date(attempt.date || attempt.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {attempt.correct_answers} / {attempt.total_questions}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        attempt.accuracy >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : attempt.accuracy >= 50
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {Math.round(attempt.accuracy)}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {attempt.time_spent_seconds 
                        ? `${Math.floor(attempt.time_spent_seconds / 60)}m ${attempt.time_spent_seconds % 60}s` 
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/upload')}
          className="group cursor-pointer bg-white/[0.01] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] rounded-2xl p-6 transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">Upload Study Material</h4>
            <p className="text-xs text-gray-400">Process notes & slides with Gemini AI</p>
          </div>
          <Upload className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/notes')}
          className="group cursor-pointer bg-white/[0.01] border border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-500/[0.02] rounded-2xl p-6 transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors">Browse Notes</h4>
            <p className="text-xs text-gray-400">View notes, summaries & flashcards</p>
          </div>
          <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate('/notes')}
          className="group cursor-pointer bg-white/[0.01] border border-white/[0.06] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.02] rounded-2xl p-6 transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white group-hover:text-fuchsia-400 transition-colors">Practice Quizzes</h4>
            <p className="text-xs text-gray-400">Test your knowledge and review scores</p>
          </div>
          <Brain className="w-5 h-5 text-gray-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
