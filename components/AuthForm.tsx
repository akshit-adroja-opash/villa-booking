'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Logo = () => (
  <div className="flex flex-col items-center gap-2 mb-2 md:mb-6 text-[#1B2A22]">
  <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0">
  <img src="/logo.png" alt="Enjoy Farm Logo" className="w-full h-full object-contain" />
  </div>
  <span className="font-serif text-2xl md:text-3xl font-normal tracking-wide mt-1 md:mt-2">Enjoy Farm</span>
  </div>
);

interface AuthFormProps {
 initialMode: 'signin' | 'signup';
}

export default function AuthForm({ initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'authenticated') {
      if ((session?.user as any)?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/farms');
      }
    }
  }, [status, session, router]);

 // Input states
 const [loginEmail, setLoginEmail] = useState('');
 const [loginPassword, setLoginPassword] = useState('');
 const [regName, setRegName] = useState('');
 const [regEmail, setRegEmail] = useState('');
 const [regPassword, setRegPassword] = useState('');
 
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [rememberMe, setRememberMe] = useState(false);
 const [errors, setErrors] = useState<{email?: string; password?: string; name?: string}>({});

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrors({});
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
 };

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {email?: string; password?: string;} = {};
    if (!loginEmail.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!loginPassword.trim()) {
      newErrors.password = 'Password is required';
    } else if (loginPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
        const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false
        });

        if (result?.ok) {
        toast.success('Login successful!');
        if (loginEmail.toLowerCase() === 'admin@gmail.com') {
        router.push('/admin/dashboard');
        } else {
        router.push('/farms');
        }
        router.refresh();
        } else {
        const errorMessage = result?.error === 'CredentialsSignin' ? 'Login failed' : (result?.error || 'Login failed');
        toast.error(errorMessage);
        }
    } catch (err) {
        console.error(err);
        toast.error('An error occurred during sign in.');
    } finally {
        setLoading(false);
    }
 };

 const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {email?: string; password?: string; name?: string;} = {};
    if (!regName.trim()) newErrors.name = 'Full Name is required';
    
    if (!regEmail.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!regPassword.trim()) {
      newErrors.password = 'Password is required';
    } else if (regPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
        const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
        });

        if (res.ok) {
        toast.success('Registration successful! Please log in.');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setMode('signin');
        router.push('/login');
        } else {
        const data = await res.json();
        toast.error(data.error || 'Registration error.');
        }
    } catch (err) {
        console.error(err);
        toast.error('An error occurred during registration.');
    } finally {
        setLoading(false);
    }
 };

 return (
 <div className="flex-grow flex flex-col md:py-16 bg-white md:bg-[#FAF9F6] items-center justify-center md:p-6 text-[#1B2A22] font-sans antialiased relative overflow-hidden min-h-screen">
 
 {/* Decorative subtle element */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B2A22]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none hidden md:block"></div>
 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1B2A22]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none hidden md:block"></div>

 {/* Main Card */}
 <div className="w-full h-full min-h-screen md:min-h-0 md:max-w-[480px] bg-white md:rounded-3xl border-none md:border md:border-[#1B2A22]/10 p-6 md:p-10 shadow-none md:shadow-2xl relative z-10 flex flex-col justify-center">
 
 {/* Header Logo & Welcomes */}
 <div className="flex flex-col items-center text-center mb-6 md:mb-8">
 <Logo />
 <div className="space-y-1 md:space-y-2 mt-2 md:mt-4">
 <h2 className="text-sm font-medium text-[#1B2A22]">
 {mode === 'signin' ? 'Login' : 'Sign Up'}
 </h2>
 <p className="text-sm text-[#1B2A22]/60 font-serif">
 {mode === 'signin' ? 'Sign in to your account to continue.' : 'Create an account to continue.'}
 </p>
 </div>
 </div>

 {/* Dynamic Forms */}
 {status === 'loading' || status === 'authenticated' ? (
   <div className="flex flex-col items-center justify-center py-12">
     <div className="w-8 h-8 border-4 border-[#00a877]/30 border-t-[#00a877] rounded-full animate-spin"></div>
   </div>
 ) : mode === 'signin' ? (
 <form onSubmit={handleLogin} className="space-y-4 md:space-y-5" noValidate>
 {/* Email Address */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="login-email">
 Email Address <span className="text-red-500">*</span>
 </label>
 <div className={`relative flex items-center bg-[#FAF9F6] border ${errors.email ? 'border-red-500' : 'border-[#1B2A22]/10'} focus-within:border-[#00a877] transition-all rounded-xl`}>
 <Mail className={`absolute left-4 h-4 w-4 ${errors.email ? 'text-red-500' : 'text-[#1B2A22]/40'}`}/>
 <input 
 className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="login-email"
 placeholder="member@theestate.com"
 type="email"
 required
 value={loginEmail}
 onChange={(e) => {
    setLoginEmail(e.target.value);
    if (errors.email) setErrors({...errors, email: undefined});
  }}
 />
 </div>
 {errors.email && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.email}</p>}
 </div>

 {/* Password */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="login-pass">
 Password <span className="text-red-500">*</span>
 </label>
 <div className={`relative flex items-center bg-[#FAF9F6] border ${errors.password ? 'border-red-500' : 'border-[#1B2A22]/10'} focus-within:border-[#00a877] transition-all rounded-xl`}>
 <Lock className={`absolute left-4 h-4 w-4 ${errors.password ? 'text-red-500' : 'text-[#1B2A22]/40'}`}/>
 <input 
 className="w-full h-12 pl-12 pr-12 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="login-pass"
 placeholder="•••••"
 type={showPassword ? 'text' : 'password'}
 required
 value={loginPassword}
 onChange={(e) => {
    setLoginPassword(e.target.value);
    if (errors.password) setErrors({...errors, password: undefined});
  }}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 p-1 hover:bg-[#1B2A22]/5 rounded-full transition-colors"
 >
 {showPassword ? <Eye className="h-4 w-4 text-[#1B2A22]/50"/> : <EyeOff className="h-4 w-4 text-[#1B2A22]/50"/>}
 </button>
 </div>
 {errors.password && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.password}</p>}
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
 <Link href="/forgot-password" className="hover:text-[#00a877] transition-colors">
 Forgot password?
 </Link>
 </div>

 {/* Submit */}
 <button 
 type="submit"
 disabled={loading}
 className="w-full h-12 md:h-14 bg-[#00a877] hover:bg-[#009669] text-white text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 mt-2 md:mt-4 rounded-xl"
 >
 {loading ? 'Authenticating...' : 'Sign In'}
 </button>
 </form>
 ) : (
 <form onSubmit={handleRegister} className="space-y-4 md:space-y-5" noValidate>
 {/* Full Name */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="reg-name">
 Full Name <span className="text-red-500">*</span>
 </label>
 <div className={`relative flex items-center bg-[#FAF9F6] border ${errors.name ? 'border-red-500' : 'border-[#1B2A22]/10'} focus-within:border-[#00a877] transition-all rounded-xl`}>
 <input 
 className="w-full h-12 px-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="reg-name"
 placeholder="Julianne Smith"
 type="text"
 required
 value={regName}
 onChange={(e) => {
    setRegName(e.target.value);
    if (errors.name) setErrors({...errors, name: undefined});
  }}
 />
 </div>
 {errors.name && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.name}</p>}
 </div>

 {/* Email Address */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="reg-email">
 Email Address <span className="text-red-500">*</span>
 </label>
 <div className={`relative flex items-center bg-[#FAF9F6] border ${errors.email ? 'border-red-500' : 'border-[#1B2A22]/10'} focus-within:border-[#00a877] transition-all rounded-xl`}>
 <Mail className={`absolute left-4 h-4 w-4 ${errors.email ? 'text-red-500' : 'text-[#1B2A22]/40'}`}/>
 <input 
 className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="reg-email"
 placeholder="member@theestate.com"
 type="email"
 required
 value={regEmail}
 onChange={(e) => {
    setRegEmail(e.target.value);
    if (errors.email) setErrors({...errors, email: undefined});
  }}
 />
 </div>
 {errors.email && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.email}</p>}
 </div>

 {/* Password */}
 <div className="space-y-2">
 <label className="block text-sm font-medium font-bold text-[#1B2A22]"htmlFor="reg-pass">
 Password <span className="text-red-500">*</span>
 </label>
 <div className={`relative flex items-center bg-[#FAF9F6] border ${errors.password ? 'border-red-500' : 'border-[#1B2A22]/10'} focus-within:border-[#00a877] transition-all rounded-xl`}>
 <Lock className={`absolute left-4 h-4 w-4 ${errors.password ? 'text-red-500' : 'text-[#1B2A22]/40'}`}/>
 <input 
 className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 id="reg-pass"
 placeholder="At least 8 characters"
 type="password"
 required
 value={regPassword}
 onChange={(e) => {
    setRegPassword(e.target.value);
    if (errors.password) setErrors({...errors, password: undefined});
  }}
 />
 </div>
 {errors.password && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.password}</p>}
 </div>

 {/* Submit */}
 <button 
 type="submit"
 disabled={loading}
 className="w-full h-12 md:h-14 bg-[#00a877] hover:bg-[#009669] text-white text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 mt-2 md:mt-4 rounded-xl"
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
 type="button"
 onClick={() => switchMode('signup')}
 className="text-[#1B2A22] hover:text-[#00a877] font-semibold transition-colors ml-1"
 >
 Sign Up
 </button>
 </p>
 ) : (
 <p>
 Already a member?{' '}
 <button 
 type="button"
 onClick={() => switchMode('signin')}
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
