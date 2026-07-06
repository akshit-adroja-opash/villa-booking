'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#003527]">
    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="24" fill="#00a877" />
      <path d="M50 22L20 48H32V78H46V60H54V78H68V48H80L50 22Z" fill="#ffffff" />
      <circle cx="50" cy="36" r="5" fill="#fef08a" />
    </svg>
    <span className="font-serif text-[#003527]">AgriStay</span>
  </div>
);

interface AuthFormProps {
  initialMode: 'signin' | 'signup';
}

export default function AuthForm({ initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const router = useRouter();

  // Input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false
      });

      if (result?.ok) {
        if (loginEmail.toLowerCase() === 'admin@gmail.com') {
          router.push('/admin/dashboard');
        } else {
          router.push('/farms');
        }
        router.refresh();
      } else {
        alert(result?.error || 'Invalid credentials!');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      if (res.ok) {
        alert('Registration successful! Please log in.');
        setMode('signin');
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || 'Registration error.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-tr from-[#e6f4ea] to-[#fdfbf7] items-center justify-center p-6 text-[#1a1b22] font-sans antialiased">
      
      {/* Header Logo & Welcomes */}
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <Logo />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#003527]">
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'signin' ? 'Sign in to your account to continue' : 'Sign up to find your perfect stay'}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[460px] bg-white rounded-2xl border border-[#bfc9c3]/20 p-8 shadow-xl shadow-[#064e3b]/5 mb-6">
        {/* Dynamic Forms */}
        {mode === 'signin' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative flex items-center bg-[#f4f6f8] rounded-xl border border-transparent focus-within:border-[#00a877] focus-within:bg-white transition-all">
                <Mail className="absolute left-4 h-5 w-5 text-gray-400" />
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                  id="login-email" 
                  placeholder="owner@agristay.com" 
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="login-pass">
                Password
              </label>
              <div className="relative flex items-center bg-[#f4f6f8] rounded-xl border border-transparent focus-within:border-[#00a877] focus-within:bg-white transition-all">
                <Lock className="absolute left-4 h-5 w-5 text-gray-400" />
                <input 
                  className="w-full h-12 pl-12 pr-12 bg-transparent text-sm font-semibold outline-none border-none"
                  id="login-pass" 
                  placeholder="•••••" 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 hover:bg-gray-100 rounded-full"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Checks & Remembers */}
            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[#00a877] border-gray-300 rounded"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-[#00a877] hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-[#00a877] hover:bg-[#009669] text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-[#00a877]/10 disabled:opacity-75"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="reg-name">
                Full Name
              </label>
              <div className="relative flex items-center bg-[#f4f6f8] rounded-xl border border-transparent focus-within:border-[#00a877] focus-within:bg-white transition-all">
                <input 
                  className="w-full h-12 px-4 bg-transparent text-sm font-semibold outline-none border-none"
                  id="reg-name" 
                  placeholder="Julianne Smith" 
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="reg-email">
                Email Address
              </label>
              <div className="relative flex items-center bg-[#f4f6f8] rounded-xl border border-transparent focus-within:border-[#00a877] focus-within:bg-white transition-all">
                <Mail className="absolute left-4 h-5 w-5 text-gray-400" />
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                  id="reg-email" 
                  placeholder="name@example.com" 
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="reg-pass">
                Password
              </label>
              <div className="relative flex items-center bg-[#f4f6f8] rounded-xl border border-transparent focus-within:border-[#00a877] focus-within:bg-white transition-all">
                <Lock className="absolute left-4 h-5 w-5 text-gray-400" />
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                  id="reg-pass" 
                  placeholder="At least 8 characters" 
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-[#00a877] hover:bg-[#009669] text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-75"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs font-semibold text-gray-500">
          {mode === 'signin' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button 
                onClick={() => setMode('signup')}
                className="text-[#00a877] hover:underline font-bold"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('signin')}
                className="text-[#00a877] hover:underline font-bold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
