import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-violet-500/[0.07] rounded-full blur-[120px] animate-float [animation-delay:3s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-500/[0.04] rounded-full blur-[100px] animate-float [animation-delay:1.5s]" />

      {/* Auth Card — Glassmorphism */}
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl shadow-indigo-500/[0.05] relative z-10 my-8 animate-scale-in">
        
        {/* Subtle gradient top border accent */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        {/* Brand / Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              PrepMate
            </span>
          </Link>
        </div>

        {/* Nested login/signup forms */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
