'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';



export default function Footer() {
   const pathname = usePathname();

   const isAuthPage = pathname === '/login' || pathname === '/register';
   const isAdminPage = pathname.startsWith('/admin');

   if (isAuthPage || isAdminPage) {
      return null;
   }

   return (
      <footer className="w-full bg-[#1B2A22] text-[#FAF9F6] border-t border-[#00a877]/20 relative overflow-hidden">
         {/* Decorative subtle element */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a877]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

         <div className="mx-auto max-w-[1280px] px-6 pt-10 pb-8 md:px-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-16 w-full text-center md:text-left">

               {/* Logo & Description */}
               <div className="md:col-span-5 space-y-4 md:space-y-6 flex flex-col items-center md:items-start">
                  <Link className="flex items-center justify-center md:justify-start gap-3 tracking-tight text-white hover:opacity-80 transition-opacity" href="/">
                     <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="Enjoy Farm Logo" className="w-full h-full object-contain" />
                     </div>
                     <span className="font-serif text-[28px] font-bold tracking-tight">Enjoy Farm</span>
                  </Link>
                  <p className="text-sm text-white/60 font-medium leading-relaxed max-w-sm">
                     Making Every Farmhouse Moment Special. An exclusive collection of private retreats designed for the discerning traveler.
                  </p>
                  <div className="pt-2">
                     <a href="https://wa.me/918780493615" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#1B2A22] border border-[#00a877]/50 text-[#00a877] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#00a877] hover:text-[#1B2A22] transition-all">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp Us
                     </a>
                  </div>
               </div>

               {/* Quick Links */}
               <div className="md:col-span-3 space-y-4 md:space-y-6">
                  <h4 className="text-[15px] font-bold text-white/90 font-serif">
                     Our Farmhouses
                  </h4>
                  <ul className="space-y-3 text-[13px] text-white/60 font-medium">
                     <li>
                        <Link href="/" className="hover:text-[#00a877] transition-colors">Home</Link>
                     </li>
                     <li>
                        <Link href="/farms" className="hover:text-[#00a877] transition-colors">Farm House</Link>
                     </li>
                     <li>
                        <Link href="/contact" className="hover:text-[#00a877] transition-colors">Contact Us</Link>
                     </li>
                  </ul>
               </div>

               {/* Contact Details */}
               <div className="md:col-span-4 space-y-4 md:space-y-6 flex flex-col items-center md:items-start">
                  <h4 className="text-[15px] font-bold text-white/90 font-serif">
                     Get In Touch
                  </h4>
                  <ul className="space-y-4 md:space-y-6 text-[13px] text-white/60 font-medium w-full">
                     <li className="flex flex-col gap-1.5 items-center md:items-start">
                        <div className="flex items-center justify-center md:justify-start gap-4 hover:text-[#00a877] transition-colors">
                           <Phone className="h-4.5 w-4.5 text-[#00a877] shrink-0" />
                           <a href="tel:+918780493615" className="font-semibold text-white/90 tracking-wide">+91 8780493615</a>
                        </div>
                        <span className="text-sm font-medium text-[#00a877]/70 md:ml-[34px] font-bold text-center md:text-left">Online Booking Inquiry (10 AM - 7 PM)</span>
                     </li>
                     <li className="flex flex-col gap-1.5 items-center md:items-start">
                        <div className="flex items-center justify-center md:justify-start gap-4 hover:text-[#00a877] transition-colors">
                           <Phone className="h-4.5 w-4.5 text-[#00a877] shrink-0" />
                           <a href="tel:+918780493615" className="font-semibold text-white/90 tracking-wide">+91 8780493615</a>
                        </div>
                        <span className="text-sm font-medium text-[#00a877]/70 md:ml-[34px] font-bold text-center md:text-left">Any Other Queries (10 AM - 7 PM)</span>
                     </li>
                     <li className="flex items-center justify-center md:justify-start gap-4 hover:text-[#00a877] transition-colors mt-2">
                        <Mail className="h-4.5 w-4.5 text-[#00a877] shrink-0" />
                        <a href="mailto:info@enjoyfarm.in" className="font-semibold text-white/90">info@enjoyfarm.in</a>
                     </li>
                     <li className="flex items-center md:items-start justify-center md:justify-start gap-4 mt-2">
                        <MapPin className="h-4.5 w-4.5 text-[#00a877] mt-0.5 shrink-0" />
                        <span className="leading-relaxed font-semibold text-white/90 text-center md:text-left">Surat, Gujarat, India</span>
                     </li>
                  </ul>
               </div>

            </div>

            {/* Bottom bar */}
            <div className="mt-12 md:mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] md:text-sm font-normal text-white/40 tracking-wider text-center md:text-left">
               <p>© {new Date().getFullYear()}, Enjoy Farm. All rights reserved.</p>
               <div className="flex flex-wrap justify-center gap-8">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
               </div>
            </div>

         </div>
      </footer>
   );
}
