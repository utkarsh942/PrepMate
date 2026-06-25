import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  User, 
  LogOut, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Notes', path: '/notes', icon: FileText },
    { name: 'Upload Notes', path: '/upload', icon: UploadCloud },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  // Check if a link is active, also supporting nested paths (e.g. /notes/:id/summary)
  const isLinkActive = (path) => {
    if (path === '/notes') {
      return location.pathname === '/notes' || location.pathname.startsWith('/notes/');
    }
    return location.pathname === path;
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#0c0c14]/90 backdrop-blur-xl border-r border-white/[0.06] flex flex-col justify-between transition-all duration-300 ${
        isOpen 
          ? 'translate-x-0 w-64' 
          : '-translate-x-full md:translate-x-0 md:w-20'
      }`}
    >
      {/* Brand logo & Toggle */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <span className="font-bold text-lg text-white tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                PrepMate
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group relative ${
                  active
                    ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                {isOpen && <span className="text-sm">{item.name}</span>}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-950 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/[0.05]">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/[0.05]">
        {isOpen && user && (
          <div className="flex items-center gap-3 px-2 py-2.5 mb-3 bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.full_name || 'Student'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all group relative cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {isOpen && <span className="text-sm font-medium">Log Out</span>}
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-950 text-rose-400 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-rose-500/10">
              Log Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
