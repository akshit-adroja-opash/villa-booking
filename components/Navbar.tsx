'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  User, 
  Menu, 
  X, 
  ShieldAlert, 
  ChevronDown, 
  LogOut,
  Diamond,
  CalendarDays,
  Settings
} from 'lucide-react';

const Logo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 15L85 45L75 85H25L15 45L50 15Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M50 35V85" stroke="currentColor" strokeWidth="4"/>
    <path d="M30 60H70" stroke="currentColor" strokeWidth="4"/>
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isAdmin = session?.user && (session.user as any).role === 'admin';
  const role = (session?.user as any)?.role || 'customer';
  
  const displayName = session?.user?.name || (role === 'admin' ? 'Admin' : 'Guest');
  const displayEmail = session?.user?.email || (role === 'admin' ? 'admin@theestate.com' : 'guest@example.com');
  const displayImage = session?.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';

  const isHome = pathname === '/';
  const navBg = scrolled ? 'bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#1B2A22]/10 shadow-sm' : (isHome ? 'bg-transparent' : 'bg-[#FAF9F6] border-b border-[#1B2A22]/5');
  const textColor = (isHome && !scrolled) ? 'text-white' : 'text-[#1B2A22]';

  return (
    <header className={`fixed top-0 left-0 w-full z-50 h-20 flex items-center transition-all duration-500 ${navBg}`}>
      <div className="flex justify-between items-center w-full px-8 md:px-16 h-full">
        
        {/* Brand Logo */}
        <Link className={`flex items-center gap-3 tracking-tight ${textColor} hover:opacity-80 transition-opacity`} href="/">
          <Logo className={`h-7 w-7 ${textColor}`} />
          <span className="font-serif text-2xl font-normal tracking-wide uppercase">The Estate</span>
        </Link>

        <div className="flex items-center gap-8 md:gap-12">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              className={`text-[13px] uppercase tracking-widest font-semibold transition-all hover:text-[#D4AF37] ${
                pathname === '/' ? (isHome && !scrolled ? 'text-white border-b border-white' : 'text-[#1B2A22] border-b border-[#1B2A22]') : `${textColor} opacity-80 hover:opacity-100`
              }`} 
              href="/"
            >
              Home
            </Link>
            <Link 
              className={`text-[13px] uppercase tracking-widest font-semibold transition-all hover:text-[#D4AF37] ${
                pathname === '/farms' || pathname === '/properties' ? (isHome && !scrolled ? 'text-white border-b border-white' : 'text-[#1B2A22] border-b border-[#1B2A22]') : `${textColor} opacity-80 hover:opacity-100`
              }`} 
              href="/farms"
            >
              The Collection
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 group focus:outline-none ${textColor}`}
                >
                  <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-opacity">
                    {displayName.split(' ')[0]}
                  </span>
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-current/20">
                    <img src={displayImage} alt={displayName} className="h-full w-full object-cover" />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-56 bg-[#FAF9F6] border border-[#1B2A22]/10 shadow-2xl p-2 z-50 animate-fade-in">
                    <div className="px-3 pb-3 pt-2 border-b border-[#1B2A22]/5 mb-2">
                      <h4 className="text-sm font-serif font-bold text-[#1B2A22]">{displayName}</h4>
                      <p className="text-[11px] text-[#1B2A22]/60 mt-0.5">{displayEmail}</p>
                    </div>
                    <div className="space-y-1">
                      {isAdmin ? (
                        <Link href="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B2A22] hover:bg-[#1B2A22]/5 transition-colors">
                          <ShieldAlert className="h-4 w-4" /> Admin Panel
                        </Link>
                      ) : (
                        <Link href="/dashboard/bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B2A22] hover:bg-[#1B2A22]/5 transition-colors">
                          <CalendarDays className="h-4 w-4" /> My Reservations
                        </Link>
                      )}
                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B2A22] hover:bg-[#1B2A22]/5 transition-colors">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-800 hover:bg-red-50 transition-colors text-left">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className={`text-[12px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-sm border transition-all ${
                  (isHome && !scrolled) ? 'border-white text-white hover:bg-white hover:text-[#1B2A22]' : 'border-[#1B2A22] text-[#1B2A22] hover:bg-[#1B2A22] hover:text-[#FAF9F6]'
                }`}
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ${textColor}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#FAF9F6] border-b border-[#1B2A22]/10 md:hidden flex flex-col py-6 px-8 gap-6 z-40 shadow-2xl text-center">
          <Link className="text-sm uppercase tracking-widest font-semibold text-[#1B2A22]" href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link className="text-sm uppercase tracking-widest font-semibold text-[#1B2A22]" href="/farms" onClick={() => setMobileMenuOpen(false)}>The Collection</Link>
          {!isAdmin && <Link className="text-sm uppercase tracking-widest font-semibold text-[#1B2A22]" href={session ? "/dashboard/bookings" : "/login"} onClick={() => setMobileMenuOpen(false)}>Reservations</Link>}
          {isAdmin && <Link className="text-sm uppercase tracking-widest font-bold text-[#D4AF37]" href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
        </div>
      )}
    </header>
  );
}
