'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock 
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
            <Link className="flex items-center tracking-tight text-white hover:opacity-80 transition-opacity" href="/">
              <span className="font-serif text-2xl font-normal tracking-wide uppercase">Enjoy Farm</span>
            </Link>
            <p className="text-sm text-white/60 font-medium leading-relaxed max-w-sm">
              An exclusive collection of private retreats designed for the discerning traveler. Experience unparalleled luxury, utmost privacy, and impeccable service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest font-serif">
              Explore
            </h4>
            <ul className="space-y-4 text-[13px] text-white/60 font-medium">
              <li>
                <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/farms" className="hover:text-[#D4AF37] transition-colors">Properties</Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Customer Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Activities</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Blog</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest font-serif">
              Contact Support
            </h4>
            <ul className="space-y-5 text-[13px] text-white/60 font-medium">
              <li className="flex items-start gap-4">
                <MapPin className="h-4.5 w-4.5 text-[#D4AF37] mt-0.5 shrink-0" />
                <span className="leading-relaxed">Enjoy Farm Headquarters, <br/> 123 Emerald Valley, Countryside District</span>
              </li>
              <li className="flex items-center gap-4 hover:text-[#D4AF37] transition-colors">
                <Phone className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-4 hover:text-[#D4AF37] transition-colors">
                <Mail className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
                <a href="mailto:support@theestate.com">support@theestate.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-white/40 font-medium uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Enjoy Farm Collection. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
