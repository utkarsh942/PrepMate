import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  Calendar,
  LogOut,
  Loader2,
  GraduationCap,
  Edit3,
  Save,
  X,
  Brain,
  Target,
  Trophy,
  FileText,
  Lock,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "../components/Toast";
import LoadingSkeleton from "../components/LoadingSkeleton";

function Profile() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [quizStats, setQuizStats] = useState({ total: 0, avgAccuracy: 0, bestScore: 0 });
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/profile");
        let userData = response.data.user || response.data;

        // If profile only has user_id, try to fetch full details
        const hasMinimalData =
          userData &&
          userData.user_id &&
          !userData.full_name &&
          !userData.email;

        if (hasMinimalData) {
          try {
            const fullResponse = await api.get(
              `/get-user/${userData.user_id}`
            );
            userData = { ...userData, ...fullResponse.data };
          } catch {
            // Use whatever data we have
          }
        }

        setProfile(userData);
        setEditData({
          full_name: userData.full_name || "",
          college: userData.college || "",
          branch: userData.branch || "",
          year: userData.year || "",
          phone_number: userData.phone_number || "",
          age: userData.age || "",
        });

        // Fetch quiz stats
        try {
          const analyticsRes = await api.get('/analytics/test-analytics');
          const analytics = analyticsRes.data || {};
          const recentAttempts = analytics.recent_attempts || [];
          const bestScore = recentAttempts.length > 0
            ? Math.max(...recentAttempts.map(a => Math.round(a.accuracy || 0)))
            : 0;
          setQuizStats({
            total: analytics.total_quizzes_taken || 0,
            avgAccuracy: Math.round(analytics.average_accuracy || 0),
            bestScore,
          });
        } catch {
          // silently fail
        }

        // Fetch notes count
        try {
          const notesRes = await api.get('/get-notes?limit=100');
          const notes = notesRes.data.notes || notesRes.data || [];
          setNotesCount(notes.length);
        } catch {
          // silently fail
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSave = async () => {
    if (!profile?.user_id) {
      toast.error("Cannot save — user ID not found");
      return;
    }
    try {
      setSaving(true);
      await api.put(`/update-user/${profile.user_id}`, {
        full_name: editData.full_name,
        college: editData.college,
        branch: editData.branch,
        year: editData.year ? parseInt(editData.year) : null,
        phone_number: editData.phone_number,
        age: editData.age ? parseInt(editData.age) : null,
      });
      setProfile((prev) => ({ ...prev, ...editData, year: editData.year ? parseInt(editData.year) : null, age: editData.age ? parseInt(editData.age) : null }));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-white/[0.06] mb-4" />
            <div className="w-40 h-6 rounded-lg bg-white/[0.06] mb-2" />
            <div className="w-52 h-4 rounded-lg bg-white/[0.04]" />
          </div>
          <LoadingSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            We couldn't load your profile information.
          </p>
          <button
            onClick={() => navigate("/notes")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
            Go to Notes
          </button>
        </div>
      </div>
    );
  }

  const isGoogleUser = profile.auth_provider === "google" || profile.google_id;

  const editableFields = [
    { key: "full_name", label: "Full Name", icon: User, type: "text" },
    { key: "college", label: "College", icon: Building, type: "text" },
    { key: "branch", label: "Branch", icon: BookOpen, type: "text" },
    { key: "year", label: "Year", icon: GraduationCap, type: "number" },
    { key: "phone_number", label: "Phone", icon: Phone, type: "tel" },
    { key: "age", label: "Age", icon: Calendar, type: "number" },
  ];

  const statItems = [
    { label: "Quizzes", value: quizStats.total, icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Avg Score", value: `${quizStats.avgAccuracy}%`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Best Score", value: `${quizStats.bestScore}%`, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Notes", value: notesCount, icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* ─── Profile Card ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Gradient Banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-600/30 via-violet-600/30 to-fuchsia-600/30 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        </div>

        {/* Avatar & Name */}
        <div className="px-6 md:px-8 -mt-12 pb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-[#0a0a0f] shadow-xl shadow-indigo-500/20 mb-4">
              {getInitials(profile.full_name)}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {profile.full_name || "Unknown User"}
            </h1>
            {profile.college && (
              <p className="text-gray-400 text-sm">{profile.college}</p>
            )}
          </div>

          {/* ─── Stats Row ─── */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {statItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/[0.06] mb-6" />

          {/* ─── Edit Toggle ─── */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Profile Details</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      full_name: profile.full_name || "",
                      college: profile.college || "",
                      branch: profile.branch || "",
                      year: profile.year || "",
                      phone_number: profile.phone_number || "",
                      age: profile.age || "",
                    });
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ─── Profile Fields ─── */}
          <div className="space-y-1.5">
            {editableFields.map((field) => {
              const Icon = field.icon;
              const value = isEditing ? editData[field.key] : (profile[field.key] ?? "");
              const isEmpty = !isEditing && (value === "" || value === null || value === undefined);
              
              return (
                <div
                  key={field.key}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">{field.label}</p>
                    {isEditing ? (
                      <input
                        type={field.type}
                        value={editData[field.key] || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-indigo-500/60 rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-all"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <p className={`text-sm truncate ${isEmpty ? 'text-gray-600 italic' : 'text-white'}`}>
                        {isEmpty ? "Not set" : String(value)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Account Info ─── */}
          <div className="border-t border-white/[0.06] mt-6 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
            
            {/* Email */}
            <div className="flex items-center gap-4 p-3 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm text-white truncate">{profile.email || "N/A"}</p>
              </div>
            </div>

            {/* Auth Provider */}
            <div className="flex items-center gap-4 p-3 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Auth Provider</p>
                <p className="text-sm text-white">{isGoogleUser ? "Google" : "Email & Password"}</p>
              </div>
            </div>

            {/* Change password for non-Google users */}
            {!isGoogleUser && (
              <div className="flex items-center gap-4 p-3 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Password</p>
                  <p className="text-sm text-gray-400">••••••••</p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Logout ─── */}
          <div className="border-t border-white/[0.06] mt-6 pt-6">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/20 rounded-xl px-4 py-3 font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
