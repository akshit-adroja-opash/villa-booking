'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
 Phone, 
 Mail, 
 MapPin, 
 Clock,
 MessageCircle
} from 'lucide-react';



export default function Footer() {
 const pathname = usePathname();

 const isAuthPage = pathname === '/login' || pathname === '/register';
 const isAdminPage = pathname.startsWith('/admin');

 if (isAuthPage || isAdminPage) {
 return null;
 }

 return (
 <footer className="w-full bg-[#1B2A22] text-[#FAF9F6] border-t border-[#D4AF37]/20 relative overflow-hidden">
 {/* Decorative subtle element */}
 <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

 <div className="mx-auto max-w-[1280px] px-8 py-20 md:px-16 relative z-10">
 <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-16 w-full">
 
 {/* Logo & Description */}
 <div className="md:col-span-5 space-y-6">
 <Link className="flex items-center gap-3 tracking-tight text-white hover:opacity-80 transition-opacity"href="/">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white">
 <svg width="22"height="22"viewBox="0 0 24 24"fill="none"xmlns="http://www.w3.org/2000/svg">
 <path d="M12 3L3 10.5H5V21H19V10.5H21L12 3Z"fill="#0a3124"/>
 <rect x="10.5"y="14"width="3"height="7"fill="white"/>
 <circle cx="12"cy="9.5"r="1.5"fill="#00a877"/>
 </svg>
 </div>
 <span className="font-serif text-[28px] font-bold tracking-tight">Enjoy Farm</span>
 </Link>
 <p className="text-sm text-white/60 font-medium leading-relaxed max-w-sm">
 Making Every Farmhouse Moment Special. An exclusive collection of private retreats designed for the discerning traveler.
 </p>
 <div className="pt-2">
 <a href="https://wa.me/918780493615"target="_blank"rel="noopener noreferrer"className="inline-flex items-center gap-2 bg-[#1B2A22] border border-[#D4AF37]/50 text-[#D4AF37] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] hover:text-[#1B2A22] transition-all">
 <MessageCircle className="h-4 w-4"/>
 WhatsApp Us
 </a>
 </div>
 </div>

 {/* Quick Links */}
 <div className="md:col-span-3 space-y-6">
 <h4 className="text-xs font-bold text-white/90 font-serif">
 Our Farmhouses
 </h4>
 <ul className="space-y-4 text-[13px] text-white/60 font-medium">
 <li>
 <Link href="/"className="hover:text-[#D4AF37] transition-colors">Home</Link>
 </li>
 <li>
 <Link href="/farms"className="hover:text-[#D4AF37] transition-colors">All Farm House</Link>
 </li>
 <li>
 <a href="#"className="hover:text-[#D4AF37] transition-colors">Contact US</a>
 </li>
 </ul>
 </div>

 {/* Contact Details */}
 <div className="md:col-span-4 space-y-6">
 <h4 className="text-xs font-bold text-white/90 font-serif">
 Get In Touch
 </h4>
 <ul className="space-y-6 text-[13px] text-white/60 font-medium">
 <li className="flex flex-col gap-1.5">
 <div className="flex items-center gap-4 hover:text-[#D4AF37] transition-colors">
 <Phone className="h-4.5 w-4.5 text-[#D4AF37] shrink-0"/>
 <a href="tel:+918780493615"className="font-semibold text-white/90 tracking-wide">+91 8780493615</a>
 </div>
 <span className="text-sm font-medium text-[#D4AF37]/70 ml-[34px] font-bold">Online Booking Inquiry (10 AM - 7 PM)</span>
 </li>
 <li className="flex flex-col gap-1.5">
 <div className="flex items-center gap-4 hover:text-[#D4AF37] transition-colors">
 <Phone className="h-4.5 w-4.5 text-[#D4AF37] shrink-0"/>
 <a href="tel:+918780493615"className="font-semibold text-white/90 tracking-wide">+91 8780493615</a>
 </div>
 <span className="text-sm font-medium text-[#D4AF37]/70 ml-[34px] font-bold">Any Other Queries (10 AM - 7 PM)</span>
 </li>
 <li className="flex items-center gap-4 hover:text-[#D4AF37] transition-colors mt-2">
 <Mail className="h-4.5 w-4.5 text-[#D4AF37] shrink-0"/>
 <a href="mailto:info@enjoyfarm.in"className="font-semibold text-white/90">info@enjoyfarm.in</a>
 </li>
 <li className="flex items-start gap-4 mt-2">
 <MapPin className="h-4.5 w-4.5 text-[#D4AF37] mt-0.5 shrink-0"/>
 <span className="leading-relaxed font-semibold text-white/90">Surat, Gujarat, India</span>
 </li>
 </ul>
 </div>

 </div>

 {/* Bottom bar */}
 <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-white/40 font-medium tracking-wider">
 <p>© {new Date().getFullYear()}, Enjoy Farm. All rights reserved.</p>
 <div className="flex flex-wrap justify-center gap-8">
 <a href="#"className="hover:text-white transition-colors">Privacy Policy</a>
 <a href="#"className="hover:text-white transition-colors">Terms & Conditions</a>
 </div>
 </div>

 </div>
 </footer>
 );
}
