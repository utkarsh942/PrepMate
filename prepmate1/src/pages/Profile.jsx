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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "../components/Toast";
import LoadingSkeleton from "../components/LoadingSkeleton";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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
      <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
            {/* Avatar skeleton */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-white/[0.06] animate-pulse mb-4" />
              <div className="w-40 h-5 rounded-lg bg-white/[0.06] animate-pulse mb-2" />
              <div className="w-52 h-4 rounded-lg bg-white/[0.04] animate-pulse" />
            </div>
            <div className="border-t border-white/[0.06] pt-6">
              <LoadingSkeleton count={6} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
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

  const profileFields = [
    {
      icon: Mail,
      label: "Email",
      value: profile.email,
    },
    {
      icon: Calendar,
      label: "Age",
      value: profile.age,
    },
    {
      icon: Phone,
      label: "Phone",
      value: profile.phone_number,
    },
    {
      icon: Building,
      label: "College",
      value: profile.college,
    },
    {
      icon: BookOpen,
      label: "Branch",
      value: profile.branch,
    },
    {
      icon: GraduationCap,
      label: "Year",
      value: profile.year,
    },
  ];

  const visibleFields = profileFields.filter(
    (f) => f.value !== undefined && f.value !== null && f.value !== ""
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-600/30 to-violet-600/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
          </div>

          {/* Avatar & Name */}
          <div className="px-6 md:px-8 -mt-10 pb-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0a0a0f] mb-4 shadow-lg shadow-indigo-500/20">
                {getInitials(profile.full_name)}
              </div>
              <h1 className="text-xl font-bold text-white mb-1">
                {profile.full_name || "Unknown User"}
              </h1>
              {profile.college && (
                <p className="text-gray-400 text-sm">{profile.college}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] mb-6" />

            {/* Profile Fields */}
            <div className="space-y-1">
              {visibleFields.map((field, idx) => {
                const Icon = field.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-sm text-white truncate">
                        {String(field.value)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {visibleFields.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">
                    No profile details available.
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] my-6" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 rounded-xl px-4 py-3 font-medium transition-all duration-200 disabled:opacity-50"
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
