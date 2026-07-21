'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Logo = () => (
  <Link href="/" className="flex flex-col items-center gap-2 mb-2 md:mb-6 text-[#1B2A22] hover:opacity-80 transition-opacity">
    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <img src="/logo.png" alt="Enjoy Farm Logo" className="w-full h-full object-contain" />
    </div>
    <span className="font-serif text-2xl md:text-3xl font-normal tracking-wide mt-1 md:mt-2">Enjoy Farm</span>
  </Link>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('Password reset link sent to your email.');
      } else {
        toast.error(data.error || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong, try again.');
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
            <h2 className="text-sm font-medium text-[#1B2A22]">Forgot Password</h2>
            <p className="text-sm text-[#1B2A22]/60 font-serif">
              Enter your email address to receive a password reset link.
            </p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
              A password reset link has been sent to {email}. Please check your inbox.
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[#1B2A22] hover:text-[#00a877] transition-colors mt-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium font-bold text-[#1B2A22]" htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
                <Mail className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                <input
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 md:h-14 bg-[#00a877] hover:bg-[#009669] text-white text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 mt-2 md:mt-4 rounded-xl"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="mt-8 text-center text-sm font-medium text-[#1B2A22]/50 pt-4">
              <Link href="/login" className="inline-flex items-center gap-2 text-[#1B2A22] hover:text-[#00a877] font-semibold transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
