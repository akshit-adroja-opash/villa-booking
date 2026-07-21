'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Logo = () => (
  <Link href="/" className="flex flex-col items-center gap-2 mb-2 md:mb-6 text-[#1B2A22] hover:opacity-80 transition-opacity">
    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <img src="/logo.png" alt="Enjoy Farm Logo" className="w-full h-full object-contain" />
    </div>
    <span className="font-serif text-2xl md:text-3xl font-normal tracking-wide mt-1 md:mt-2">Enjoy Farm</span>
  </Link>
);

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing password reset token.');
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('Password has been reset successfully.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error(data.error || 'Failed to reset password.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong, try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

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
            <h2 className="text-sm font-medium text-[#1B2A22]">Reset Password</h2>
            <p className="text-sm text-[#1B2A22]/60 font-serif">
              Enter your new password below.
            </p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[#1B2A22] hover:text-[#00a877] transition-colors mt-4">
              <ArrowLeft className="w-4 h-4" />
              Go to Login now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium font-bold text-[#1B2A22]" htmlFor="new-password">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
                <Lock className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                <input
                  className="w-full h-12 pl-12 pr-12 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
                  id="new-password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 hover:bg-[#1B2A22]/5 rounded-full transition-colors"
                >
                  {showPassword ? <Eye className="h-4 w-4 text-[#1B2A22]/50"/> : <EyeOff className="h-4 w-4 text-[#1B2A22]/50"/>}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium font-bold text-[#1B2A22]" htmlFor="confirm-password">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#1B2A22] transition-all rounded-xl">
                <Lock className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                <input
                  className="w-full h-12 pl-12 pr-12 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
                  id="confirm-password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 md:h-14 bg-[#00a877] hover:bg-[#009669] text-white text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 mt-2 md:mt-4 rounded-xl"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
          </form>
        )}
      </div>
    </div>
  );
}
