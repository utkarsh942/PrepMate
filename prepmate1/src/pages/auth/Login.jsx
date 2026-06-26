import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { Loader2, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Google Sign-In button
  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          shape: 'rectangular',
        });
      }
    };

    // Retry if script takes a moment to load
    const interval = setInterval(() => {
      if (window.google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      toast.info('Signing in with Google...');
      const res = await api.post('/google-login', { token: response.credential });
      
      const token = res.data.access_token;
      const userData = res.data.user; // Contains full_name, email

      login(token, userData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/login', { email, password });
      
      // Handle the API's custom error responses returned with 200 status
      if (res.data.message === 'User not found' || res.data.message === 'Invalid password') {
        toast.error(res.data.message);
        setLoading(false);
        return;
      }

      if (res.data.access_token) {
        const token = res.data.access_token;
        const userData = res.data.user || { email, full_name: 'Student' };

        login(token, userData);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="text-gray-400 text-sm mt-1.5">Sign in to your PrepMate account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15 disabled:opacity-50 mt-6"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-white/[0.08] flex-1" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">or continue with</span>
        <div className="h-px bg-white/[0.08] flex-1" />
      </div>

      {/* Google OAuth Button */}
      <div ref={googleBtnRef} className="w-full min-h-[44px]" />

      {/* Redirect Link */}
      <p className="text-center text-gray-500 text-xs mt-8">
        Don’t have an account?{' '}
        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
