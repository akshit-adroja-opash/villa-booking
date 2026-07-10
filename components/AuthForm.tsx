'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Logo = () => (
  <div className="flex flex-col items-center gap-2 mb-6 text-[#1B2A22]">
    <div className="w-16 h-16 flex items-center justify-center shrink-0">
      <img src="/logo.png" alt="Enjoy Farm Logo" className="w-full h-full object-contain" />
    </div>
    <span className="font-serif text-3xl font-normal tracking-wide mt-2">Enjoy Farm</span>
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
 <div className="flex-grow flex flex-col py-12 md:py-16 bg-[#FAF9F6] items-center justify-center p-6 text-[#1B2A22] font-sans antialiased relative overflow-hidden">
 
 {/* Decorative subtle element */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B2A22]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1B2A22]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

 {/* Main Card */}
 <div className="w-full max-w-[480px] bg-white rounded-3xl border border-[#1B2A22]/10 p-8 md:p-10 shadow-2xl relative z-10">
 
 {/* Header Logo & Welcomes */}
 <div className="flex flex-col items-center text-center mb-8">
 <Logo />
 <div className="space-y-2 mt-4">
 <h2 className="text-sm font-medium text-[#1B2A22]">
 {mode === 'signin' ? 'Login' : 'Sign Up'}
 </h2>
 <p className="text-sm text-[#1B2A22]/60 font-serif">
 {mode === 'signin' ? 'Sign in to your account to continue.' : 'Create an account to continue.'}
 </p>
 </div>
 </div>

 {/* Dynamic Forms */}
 {mode === 'signin' ? (
 <form onSubmit={handleLogin} className="space-y-5">
 {/* Email Address */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="login-email">
 Email Address
 </label>
 <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
 <Mail className="absolute left-4 h-4 w-4 text-[#1B2A22]/40"/>
 <input 
 className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="login-email"
 placeholder="member@theestate.com"
 type="email"
 required
 value={loginEmail}
 onChange={(e) => setLoginEmail(e.target.value)}
 />
 </div>
 </div>

 {/* Password */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="login-pass">
 Password
 </label>
 <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
 <Lock className="absolute left-4 h-4 w-4 text-[#1B2A22]/40"/>
 <input 
 className="w-full h-12 pl-12 pr-12 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
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
 className="absolute right-4 p-1 hover:bg-[#1B2A22]/5 rounded-full transition-colors"
 >
 {showPassword ? <EyeOff className="h-4 w-4 text-[#1B2A22]/50"/> : <Eye className="h-4 w-4 text-[#1B2A22]/50"/>}
 </button>
 </div>
 </div>

 {/* Checks & Remembers */}
 <div className="flex justify-between items-center text-sm font-medium font-bold tracking-wider text-[#1B2A22]/60 mt-4 mb-2">
 <label className="flex items-center gap-2 cursor-pointer hover:text-[#1B2A22] transition-colors">
 <input 
 type="checkbox"
 checked={rememberMe}
 onChange={(e) => setRememberMe(e.target.checked)}
 className="h-3.5 w-3.5 cursor-pointer accent-[#00a877]"
 />
 <span>Remember me</span>
 </label>
 <a href="#"className="hover:text-[#00a877] transition-colors">
 Forgot password?
 </a>
 </div>

 {/* Submit */}
 <button 
 type="submit"
 disabled={loading}
 className="w-full h-14 bg-[#00a877] hover:bg-[#008f65] text-white text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 mt-4 rounded-xl"
 >
 {loading ? 'Authenticating...' : 'Sign In'}
 </button>
 </form>
 ) : (
 <form onSubmit={handleRegister} className="space-y-5">
 {/* Full Name */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="reg-name">
 Full Name
 </label>
 <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
 <input 
 className="w-full h-12 px-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
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
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="reg-email">
 Email Address
 </label>
 <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
 <Mail className="absolute left-4 h-4 w-4 text-[#1B2A22]/40"/>
 <input 
 className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="reg-email"
 placeholder="member@theestate.com"
 type="email"
 required
 value={regEmail}
 onChange={(e) => setRegEmail(e.target.value)}
 />
 </div>
 </div>

 {/* Password */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="reg-pass">
 Password
 </label>
 <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
 <Lock className="absolute left-4 h-4 w-4 text-[#1B2A22]/40"/>
 <input 
 className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
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
 className="w-full h-14 bg-[#00a877] hover:bg-[#008f65] text-white text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 mt-4 rounded-xl"
 >
 {loading ? 'Creating Account...' : 'Sign Up'}
 </button>
 </form>
 )}

 {/* Toggle Mode */}
 <div className="mt-8 text-center text-sm font-medium text-[#1B2A22]/50 border-t border-[#1B2A22]/10 pt-4">
 {mode === 'signin' ? (
 <p>
 Not a member yet?{' '}
 <button 
 onClick={() => setMode('signup')}
 className="text-[#1B2A22] hover:text-[#00a877] font-semibold transition-colors ml-1"
 >
 Sign Up
 </button>
 </p>
 ) : (
 <p>
 Already a member?{' '}
 <button 
 onClick={() => setMode('signin')}
 className="text-[#1B2A22] hover:text-[#00a877] font-semibold transition-colors ml-1"
 >
 Sign In
 </button>
 </p>
 )}
 </div>

 </div>
 </div>
 );
}
