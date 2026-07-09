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
 const navBg = scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-[#1B2A22]/5 shadow-sm' : (isHome ? 'bg-transparent' : 'bg-white border-b border-[#1B2A22]/5');
 const textColor = (isHome && !scrolled) ? 'text-white' : 'text-[#1B2A22]';

 return (
 <header className={`fixed top-0 left-0 w-full z-50 h-[72px] flex items-center transition-all duration-500 ${navBg}`}>
 <div className="flex items-center justify-between w-full px-8 md:px-12 lg:px-16 h-full">
 
 {/* Brand Logo - Left Aligned */}
 <div className="flex-1 flex justify-start">
 <Link className={`flex items-center gap-2 tracking-tight ${textColor} hover:opacity-80 transition-opacity`} href="/">
 <div className={`w-10 h-10 flex items-center justify-center shrink-0`}>
 <img src="/logo.png"alt="Enjoy Farm Logo"className="w-full h-full object-contain"/>
 </div>
 <span className="font-serif text-[20px] md:text-[22px] font-bold tracking-tight">Enjoy Farm</span>
 </Link>
 </div>

 {/* Navigation Links - Center Aligned */}
 <nav className="hidden md:flex flex-1 justify-center items-center gap-10">
 <Link 
 className={`relative text-sm font-medium transition-all group ${
 pathname === '/' ? textColor : `${textColor} opacity-70 hover:opacity-100`
 }`} 
 href="/"
 >
 Home
 <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-[#00a877] scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${pathname === '/' ? 'scale-x-100' : ''}`}></span>
 </Link>
 <Link 
 className={`relative text-sm font-medium transition-all group ${
 pathname === '/farms' || pathname === '/properties' ? textColor : `${textColor} opacity-70 hover:opacity-100`
 }`} 
 href="/farms"
 >
 The Collection
 <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-[#00a877] scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${pathname === '/farms' || pathname === '/properties' ? 'scale-x-100' : ''}`}></span>
 </Link>
 <Link 
 className={`relative text-sm font-medium transition-all group ${
 pathname === '/contact' ? textColor : `${textColor} opacity-70 hover:opacity-100`
 }`} 
 href="/contact"
 >
 Contact Us
 <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-[#00a877] scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${pathname === '/contact' ? 'scale-x-100' : ''}`}></span>
 </Link>
 </nav>

 {/* Actions - Right Aligned */}
 <div className="flex-1 flex justify-end items-center gap-6">
 {session ? (
 <div className="relative"ref={dropdownRef}>
 <button 
 onClick={() => setDropdownOpen(!dropdownOpen)}
 className={`flex items-center gap-2 group focus:outline-none ${textColor}`}
 >
 <div className="h-8 w-8 overflow-hidden rounded-full border border-current/20 shrink-0">
 <img src={displayImage} alt={displayName} className="h-full w-full object-cover"/>
 </div>
 <span className="hidden sm:inline text-[15px] font-medium opacity-90 group-hover:opacity-100 transition-opacity">
 {displayName.split(' ')[0]}
 </span>
 <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity hidden sm:block"/>
 </button>

 {dropdownOpen && (
 <div className="absolute right-0 top-12 mt-2 w-56 bg-white border border-[#1B2A22]/10 shadow-xl p-2 z-50 animate-fade-in rounded-xl">
 <div className="px-3 pb-3 pt-2 border-b border-[#1B2A22]/5 mb-2">
 <h4 className="text-sm font-serif font-bold text-[#1B2A22]">{displayName}</h4>
 <p className="text-sm font-medium text-[#1B2A22]/60 mt-0.5">{displayEmail}</p>
 </div>
 <div className="space-y-1">
 {isAdmin ? (
 <Link href="/admin/dashboard"onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide text-[#1B2A22] hover:bg-[#fbf8ff] rounded-md transition-colors">
 <ShieldAlert className="h-4 w-4"/> Admin Panel
 </Link>
 ) : (
 <Link href="/dashboard/bookings"onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide text-[#1B2A22] hover:bg-[#fbf8ff] rounded-md transition-colors">
 <CalendarDays className="h-4 w-4"/> My Reservations
 </Link>
 )}
 <Link href="/settings"onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide text-[#1B2A22] hover:bg-[#fbf8ff] rounded-md transition-colors">
 <Settings className="h-4 w-4"/> Settings
 </Link>
 <button onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide text-red-800 hover:bg-red-50 rounded-md transition-colors text-left">
 <LogOut className="h-4 w-4"/> Logout
 </button>
 </div>
 </div>
 )}
 </div>
 ) : (
 <Link 
 href="/login"
 className={`text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300 ${
 (isHome && !scrolled) ? 'bg-white text-[#1B2A22] hover:bg-white/90 shadow-md' : 'bg-[#00a877] text-white hover:bg-[#008f65] hover:shadow-lg hover:-translate-y-0.5'
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
 {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
 </button>
 </div>
 </div>

 {/* Mobile menu */}
 {mobileMenuOpen && (
 <div className="absolute top-20 left-0 w-full bg-[#FAF9F6] border-b border-[#1B2A22]/10 md:hidden flex flex-col py-6 px-8 gap-6 z-40 shadow-2xl text-center">
 <Link className="text-sm font-semibold text-[#1B2A22]"href="/"onClick={() => setMobileMenuOpen(false)}>Home</Link>
 <Link className="text-sm font-semibold text-[#1B2A22]"href="/farms"onClick={() => setMobileMenuOpen(false)}>The Collection</Link>
 <Link className="text-sm font-semibold text-[#1B2A22]"href="/contact"onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
 {!isAdmin && <Link className="text-sm font-semibold text-[#1B2A22]"href={session ?"/dashboard/bookings":"/login"} onClick={() => setMobileMenuOpen(false)}>Reservations</Link>}
 {isAdmin && <Link className="text-sm font-bold text-[#1B2A22]"href="/admin/dashboard"onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
 </div>
 )}
 </header>
 );
}
