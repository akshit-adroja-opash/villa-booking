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
  Home, 
  Compass,
  LayoutGrid,
  BookOpen,
  Settings,
  TrendingUp,
  HelpCircle,
  LogOut
} from 'lucide-react';

const Logo = ({ className = "h-8 w-8 text-primary" }: { className?: string }) => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="24" fill="#003527" />
    <path d="M50 22L20 48H32V78H46V60H54V78H68V48H80L50 22Z" fill="#ffffff" />
    <circle cx="50" cy="36" r="5" fill="#10b981" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Do not render navbar on auth forms
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isAdmin = session?.user && (session.user as any).role === 'admin';
  const role = (session?.user as any)?.role || 'customer';
  
  // Custom fallback names/emails matching our mock logins for visual accuracy
  const displayName = session?.user?.name || (role === 'admin' ? 'AgriStay Admin' : 'Arjun Mehta');
  const displayEmail = session?.user?.email || (role === 'admin' ? 'admin@agristay.com' : 'arjun@agristay.com');
  const displayImage = session?.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#bfc9c3]/20 h-16 flex items-center">
      <div className="flex justify-between items-center w-full px-6 md:px-16 h-full relative">
        
        {/* Brand Logo */}
        <Link className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#003527]" href="/">
          <Logo />
          <span className="font-serif tracking-tight text-[#003527]">AgriStay</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
          <Link 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              pathname === '/' 
                ? 'bg-[#e6f4ea] text-[#003527]' 
                : 'text-[#404944] hover:text-[#003527] hover:bg-gray-50'
            }`} 
            href="/"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              pathname === '/farms' || pathname === '/properties'
                ? 'bg-[#e6f4ea] text-[#003527]' 
                : 'text-[#404944] hover:text-[#003527] hover:bg-gray-50'
            }`} 
            href="/farms"
          >
            <Compass className="h-4 w-4" />
            <span>Farmhouses</span>
          </Link>
          {!isAdmin && (
            <Link 
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pathname?.startsWith('/dashboard')
                  ? 'bg-[#e6f4ea] text-[#003527]' 
                  : 'text-[#404944] hover:text-[#003527] hover:bg-gray-50'
              }`} 
              href={session ? "/dashboard/bookings" : "/login"}
            >
              <span>Bookings</span>
            </Link>
          )}
          {isAdmin && (
            <Link 
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pathname?.startsWith('/admin')
                  ? 'bg-[#e6f4ea] text-[#003527] border border-[#a7f3d0]'
                  : 'text-[#404944] hover:text-[#003527] hover:bg-gray-50'
              }`} 
              href="/admin/dashboard"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Actions (User profile pill) */}
        <div className="flex items-center gap-4">
          
          {/* User Profile / Login */}
          {session ? (
            <div className="relative border-l border-gray-200 pl-4" ref={dropdownRef}>
              
              {/* Profile Pill Trigger */}
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 group focus:outline-none"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 shadow-sm">
                  <img 
                    src={displayImage} 
                    alt={displayName} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-[#1a1b22] group-hover:text-[#003527] transition-colors">
                  {displayName.split(' ')[0]}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#404944] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* High-Fidelity Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 mt-2 w-64 bg-white border border-[#bfc9c3]/20 rounded-2xl shadow-xl shadow-[#064e3b]/5 p-4 z-50 animate-fade-in text-left">
                  
                  {/* Dropdown Header Info */}
                  <div className="pb-3 border-b border-gray-100 mb-2">
                    <h4 className="text-sm font-bold text-[#1a1b22]">{displayName}</h4>
                    <p className="text-[11px] text-gray-400 font-semibold truncate mt-0.5">{displayEmail}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold bg-[#e6f4ea] text-[#0f766e] border border-[#a7f3d0]/30 rounded-full lowercase">
                      {role}
                    </span>
                  </div>

                  {/* Dropdown List Items */}
                  <div className="space-y-1">
                    {!isAdmin && (
                      <Link 
                        href="/dashboard/bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#404944] hover:bg-gray-50 transition-colors"
                      >
                        <BookOpen className="h-4.5 w-4.5 text-gray-400 stroke-[1.8]" />
                        <span>My Bookings</span>
                      </Link>
                    )}

                    <Link 
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#404944] hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4.5 w-4.5 text-gray-400 stroke-[1.8]" />
                      <span>Settings</span>
                    </Link>

                    <Link 
                      href="/support"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#404944] hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="h-4.5 w-4.5 text-gray-400 stroke-[1.8]" />
                      <span>Help & Support</span>
                    </Link>

                    <button 
                      onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50/50 transition-colors text-left"
                    >
                      <LogOut className="h-4.5 w-4.5 text-red-500 stroke-[2]" />
                      <span>Logout</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <Link 
                href="/login" 
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center text-gray-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-[#1a1b22] group-hover:text-[#003527] transition-colors">
                  Sign In
                </span>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#404944] hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-lg md:hidden flex flex-col py-4 px-6 gap-4 z-40">
          <Link 
            className="text-sm font-semibold text-[#404944] hover:text-[#003527] py-1" 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            className="text-sm font-semibold text-[#404944] hover:text-[#003527] py-1" 
            href="/farms" 
            onClick={() => setMobileMenuOpen(false)}
          >
            Farmhouses
          </Link>
          {!isAdmin && (
            <Link 
              className="text-sm font-semibold text-[#404944] hover:text-[#003527] py-1" 
              href={session ? "/dashboard/bookings" : "/login"} 
              onClick={() => setMobileMenuOpen(false)}
            >
              Bookings
            </Link>
          )}
          {isAdmin && (
            <Link 
              className="text-sm font-bold text-[#064e3b] py-1 flex items-center gap-1" 
              href="/admin/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldAlert className="h-4 w-4" /> Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
