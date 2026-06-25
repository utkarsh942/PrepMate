import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.06] p-8 shadow-2xl relative z-10 my-8">
        
        {/* Brand / Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
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
