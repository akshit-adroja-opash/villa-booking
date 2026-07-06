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

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="#00a877" />
    <path d="M50 22L20 48H32V78H46V60H54V78H68V48H80L50 22Z" fill="#ffffff" />
    <circle cx="50" cy="36" r="5" fill="#fef08a" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  // If we want it to be renderable anywhere, we can remove the pathname check,
  // but let's keep it clean: if it is explicitly called in admin layout, it will render.
  // We can just check here if it's auth/admin and return null, OR we can let it render.
  // Wait, let's allow it to render everywhere, but in pages where it's not needed, we don't render it.
  // Let's remove the restriction so it can be rendered on admin dashboard page!
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0b131f] text-white border-t border-gray-800/40">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          
          {/* Logo & Description */}
          <div className="space-y-5">
            <Link className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-white" href="/">
              <Logo />
              <span className="font-serif tracking-tight text-white">AgriStay</span>
            </Link>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Experience luxury, privacy, and nature at our exclusive private farmhouses. Create unforgettable memories with us.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
              <li>
                <Link href="/" className="hover:text-[#00a877] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/farms" className="hover:text-[#00a877] transition-colors">Listings</Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#00a877] transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00a877] transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00a877] transition-colors">Blog</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-3.5 text-xs text-gray-400 font-semibold">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-[#00a877] mt-0.5" />
                <span className="leading-relaxed">123 Farm Lane, Green Valley</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 text-[#00a877]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-[#00a877]" />
                <span>hello@agristay.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4.5 w-4.5 text-[#00a877]" />
                <span>Mon-Sat: 9AM - 8PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-semibold">
          <p>© 2024 AgriStay. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
