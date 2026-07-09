'use client';

import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, ArrowRight, PhoneCall } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22]">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-[1280px] mx-auto text-center">
        <h1 className="font-sans text-6xl md:text-8xl font-black text-[#1B2A22] tracking-tight mb-6">
          Get in<span className="text-[#00a877]">Touch</span>
        </h1>
        <p className="text-[#1B2A22]/80 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Have questions? We're here to help you find the perfect farmhouse for your next getaway
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-[1280px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 border border-[#1B2A22]/10 shadow-sm order-2 lg:order-1">
            <h2 className="font-serif text-3xl mb-8">Send us a Message</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! We will get back to you soon.'); }}>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1B2A22]">Name*</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-b border-[#1B2A22]/20 bg-transparent px-0 py-3 text-[#1B2A22] focus:border-[#00a877] focus:outline-none transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1B2A22]">Email Address*</label>
                <input 
                  type="email" 
                  required
                  className="w-full border-b border-[#1B2A22]/20 bg-transparent px-0 py-3 text-[#1B2A22] focus:border-[#00a877] focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1B2A22]">Phone number</label>
                <input 
                  type="tel" 
                  className="w-full border-b border-[#1B2A22]/20 bg-transparent px-0 py-3 text-[#1B2A22] focus:border-[#00a877] focus:outline-none transition-colors"
                  placeholder="+91 8780493615"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1B2A22]">Subject*</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-b border-[#1B2A22]/20 bg-transparent px-0 py-3 text-[#1B2A22] focus:border-[#00a877] focus:outline-none transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-[#1B2A22]">Comment*</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border-b border-[#1B2A22]/20 bg-transparent px-0 py-3 text-[#1B2A22] focus:border-[#00a877] focus:outline-none transition-colors resize-none"
                  placeholder="Tell us more about your requirements..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#00a877] text-white py-4 text-sm font-medium hover:bg-[#008f65] transition-colors mt-4"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="space-y-12 order-1 lg:order-2">
            <div>
              <h2 className="font-serif text-3xl mb-4">Contact Information</h2>
              <p className="text-[#1B2A22]/70 font-medium text-sm leading-relaxed mb-10 max-w-md">
                We're always here to help you find the perfect farmhouse experience. Reach out to us through any of the channels below.
              </p>

              <div className="space-y-8">
                
                {/* Phone */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#00a877] rounded-full flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-1">Phone</h3>
                    <p className="text-[#1B2A22]/60 text-sm mb-2">Call us for immediate assistance</p>
                    <a href="tel:+918780493615" className="text-lg font-medium hover:text-[#00a877] transition-colors">+91 8780493615</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#00a877] rounded-full flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-1">Email</h3>
                    <p className="text-[#1B2A22]/60 text-sm mb-2">Send us an email anytime</p>
                    <a href="mailto:info@enjoyfarm.in" className="text-lg font-medium hover:text-[#00a877] transition-colors">info@enjoyfarm.in</a>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#00a877] rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-1">Office</h3>
                    <p className="text-[#1B2A22]/60 text-sm mb-2">Visit our main office</p>
                    <p className="text-[#1B2A22] font-medium text-sm leading-relaxed max-w-sm">
                      The Galleria Business Hub, Shopping Hub, 129, beside Sanjeev Kumar Auditorium Road, Adajan Gam, Pal Gam, Surat, Gujarat 394510
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#00a877] rounded-full flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-1">Business Hours</h3>
                    <p className="text-[#1B2A22]/60 text-sm mb-2">We are here to help</p>
                    <p className="text-[#1B2A22] font-medium text-sm leading-relaxed">
                      Mon - Fri: 9:00 AM - 7:00 PM<br/>
                      Sat - Sun: 10:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

              </div>

              {/* Quick Actions */}
              <div className="mt-12 pt-10 border-t border-[#1B2A22]/10">
                <h3 className="font-serif text-xl font-medium mb-6">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <a href="tel:+918780493615" className="inline-flex items-center gap-2 bg-[#00a877] text-white px-5 py-3 text-sm font-medium hover:bg-[#008f65] transition-colors">
                    <PhoneCall className="h-4 w-4" /> Call Now
                  </a>
                  <a href="https://wa.me/918780493615" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-transparent border border-[#1B2A22] text-[#1B2A22] px-5 py-3 text-sm font-medium hover:bg-[#1B2A22] hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  <a href="mailto:info@enjoyfarm.in" className="inline-flex items-center gap-2 bg-transparent border border-[#1B2A22] text-[#1B2A22] px-5 py-3 text-sm font-medium hover:bg-[#1B2A22] hover:text-white transition-colors">
                    <Mail className="h-4 w-4" /> Email Us
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
