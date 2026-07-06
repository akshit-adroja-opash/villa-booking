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
  const isAdminPage = pathname.startsWith('/admin');

  if (isAuthPage || isAdminPage) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0b131f] text-white border-t border-gray-800/40">
      <div className="mx-auto w-full px-6 py-16 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-12 w-full">
          
          {/* Logo & Description */}
          <div className="md:col-span-5 space-y-6">
            <Link className="flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-white" href="/">
              <Logo />
              <span className="font-serif tracking-tight text-white">AgriStay</span>
            </Link>
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-md">
              Experience unparalleled luxury, privacy, and nature at our exclusive private farmhouses. Unwind from the city and create unforgettable memories.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-5">
            <h4 className="text-sm font-bold text-gray-100 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
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
          <div className="md:col-span-4 space-y-5">
            <h4 className="text-sm font-bold text-gray-100 uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#00a877] mt-0.5 shrink-0" />
                <span className="leading-relaxed">123 Farm Lane, Green Valley, Countryside District</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#00a877] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#00a877] shrink-0" />
                <span>hello@agristay.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#00a877] shrink-0" />
                <span>Mon-Sat: 9AM - 8PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-gray-800/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} AgriStay. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
