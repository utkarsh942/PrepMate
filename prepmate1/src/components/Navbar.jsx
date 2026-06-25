import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // If the user is on an authenticated page, they see the Sidebar instead
  const isAuthPage = ['/dashboard', '/notes', '/upload', '/profile'].some(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/15 group-hover:scale-105 transition-transform duration-350">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            PrepMate
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link 
                to="/login" 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl px-4.5 py-2.5 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl px-4.5 py-2.5 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
