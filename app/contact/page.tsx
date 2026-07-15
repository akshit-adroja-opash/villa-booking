'use client';

import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, ArrowRight, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22]">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-[1280px] mx-auto text-center">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#002E1E] tracking-tight mb-4">
          Get in <span className="text-[#00a877]">Touch</span>
        </h1>
        <p className="text-gray-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Have questions? We're here to help you find the perfect farmhouse for your next getaway
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-[1280px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-12 order-1 lg:order-1">
            <div>
              <h2 className="font-serif text-[28px] text-[#002E1E] font-bold mb-4">Contact Information</h2>
              <p className="text-gray-500 font-medium text-[14px] leading-relaxed mb-10 max-w-md">
                We're always here to help you find the perfect farmhouse experience. Reach out to us through any of the channels below.
              </p>

              <div className="space-y-8">
                
                {/* Phone */}
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-[#e6f4ea] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <Phone className="h-5 w-5 text-[#00a877]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[20px] text-[#002E1E] font-bold mb-1">Phone</h3>
                    <p className="text-gray-400 text-[13px] font-bold mb-2">Call us for immediate assistance</p>
                    <a href="tel:+918780493615" className="text-[15px] font-bold text-[#1B2A22] hover:text-[#00a877] transition-colors">+91 8780493615</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-[#e6f4ea] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <Mail className="h-5 w-5 text-[#00a877]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[20px] text-[#002E1E] font-bold mb-1">Email</h3>
                    <p className="text-gray-400 text-[13px] font-bold mb-2">Send us an email anytime</p>
                    <a href="mailto:info@enjoyfarm.in" className="text-[15px] font-bold text-[#1B2A22] hover:text-[#00a877] transition-colors">info@enjoyfarm.in</a>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-[#e6f4ea] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <MapPin className="h-5 w-5 text-[#00a877]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[20px] text-[#002E1E] font-bold mb-1">Office</h3>
                    <p className="text-gray-400 text-[13px] font-bold mb-2">Visit our main office</p>
                    <p className="text-[#1B2A22] font-semibold text-[14px] leading-relaxed max-w-sm">
                      The Galleria Business Hub, Shopping Hub, 129, beside Sanjeev Kumar Auditorium Road, Adajan Gam, Pal Gam, Surat, Gujarat 394510
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-[#e6f4ea] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <Clock className="h-5 w-5 text-[#00a877]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[20px] text-[#002E1E] font-bold mb-1">Business Hours</h3>
                    <p className="text-gray-400 text-[13px] font-bold mb-2">We are here to help</p>
                    <p className="text-[#1B2A22] font-semibold text-[14px] leading-relaxed">
                      Mon - Fri: 9:00 AM - 7:00 PM<br/>
                      Sat - Sun: 10:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Contact Form Container */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] order-2 lg:order-2">
            <h2 className="font-serif text-[28px] text-[#002E1E] font-bold mb-8">Send us a Message</h2>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); toast.success('Message sent successfully! We will get back to you soon.'); }}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name*</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:border-[#00a877] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address*</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:border-[#00a877] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:border-[#00a877] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="+91 8780493615"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subject*</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:border-[#00a877] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Comment*</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:border-[#00a877] focus:bg-white focus:outline-none transition-all resize-none placeholder:text-gray-400 placeholder:font-medium"
                  placeholder="Tell us more about your requirements..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#00a877] text-white py-3.5 rounded-xl text-[14px] font-bold hover:bg-[#009669] transition-colors mt-2 active:scale-[0.99] shadow-sm"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

        {/* Quick Actions Footer */}
        <div className="mt-20 pt-10 border-t border-gray-200 text-center">
          <h3 className="font-serif text-[22px] font-bold text-[#002E1E] mb-6">Need Immediate Assistance?</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="tel:+918780493615" className="inline-flex items-center gap-2 bg-[#00a877] text-white px-6 py-3 rounded-full text-[13px] font-bold hover:bg-[#009669] transition-colors shadow-sm">
              <PhoneCall className="h-4 w-4" /> Call Now
            </a>
            <a href="https://wa.me/918780493615" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#1B2A22] px-6 py-3 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href="mailto:info@enjoyfarm.in" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#1B2A22] px-6 py-3 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <Mail className="h-4 w-4" /> Email Us
            </a>
          </div>
        </div>

      </section>
    </div>
  );
}
