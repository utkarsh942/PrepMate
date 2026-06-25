import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar, 
  UserPlus 
} from 'lucide-react';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      const userData = res.data.user;

      login(token, userData);
      toast.success('Registration successful via Google!');
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

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      age: parseInt(age) || 0,
      phone_number: phoneNumber.trim(),
      college: "",
      branch: "",
      year: null
    };

    try {
      setLoading(true);
      await api.post('/create-user', payload);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create an account</h1>
        <p className="text-gray-400 text-sm mt-1.5">Join PrepMate to study smarter</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-650 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
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
              className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-650 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Age & Phone Number */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">Age</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="number"
                required
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="18"
                className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-650 text-sm outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-650 text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-650 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0c0c14]/50 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-650 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Sign Up
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-4">
        <div className="h-px bg-white/[0.08] flex-1" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">or continue with</span>
        <div className="h-px bg-white/[0.08] flex-1" />
      </div>

      {/* Google OAuth Button */}
      <div ref={googleBtnRef} className="w-full min-h-[44px]" />

      {/* Redirect Link */}
      <p className="text-center text-gray-500 text-xs mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
