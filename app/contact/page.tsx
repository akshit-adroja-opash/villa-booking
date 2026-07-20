'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, PhoneCall, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', comment: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
      hasErrors = true;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
      hasErrors = true;
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      hasErrors = true;
    }
    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', comment: '' });
        setErrors({});
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (err) {
      toast.error('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div id="contact-form" className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] order-2 lg:order-2">
            <h2 className="font-serif text-[28px] text-[#002E1E] font-bold mb-8">Send us a Message</h2>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877]'}`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-[11px] font-bold text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877]'}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-[11px] font-bold text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877]'}`}
                    placeholder="+91 8780493615"
                    onChange={(e) => {
                      const val = e.currentTarget.value.replace(/[^0-9+\-\s()]/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                  />
                  {errors.phone && <p className="text-[11px] font-bold text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subject <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:bg-white focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-medium ${errors.subject ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877]'}`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && <p className="text-[11px] font-bold text-red-500">{errors.subject}</p>}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Comment <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={5}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1B2A22] focus:bg-white focus:outline-none transition-all resize-none placeholder:text-gray-400 placeholder:font-medium ${errors.comment ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877]'}`}
                  placeholder="Tell us more about your requirements..."
                ></textarea>
                {errors.comment && <p className="text-[11px] font-bold text-red-500">{errors.comment}</p>}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00a877] text-white py-3.5 rounded-xl text-[14px] font-bold hover:bg-[#009669] transition-colors mt-2 active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
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
            <a href="#contact-form" onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
            }} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#1B2A22] px-6 py-3 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <Mail className="h-4 w-4" /> Email Us
            </a>
          </div>
        </div>

      </section>
    </div>
  );
}
