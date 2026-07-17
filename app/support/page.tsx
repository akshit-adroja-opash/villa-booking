'use client';

import React, { useState } from 'react';
import { ChevronDown, MessageCircle, PhoneCall, Mail } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I book a farmhouse?',
    answer: 'Browse our exclusive collection of farmhouses, select your preferred dates, choose the number of guests, and submit a booking request. Our team will contact you shortly to confirm your reservation.'
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Cancellation policies vary depending on the specific farmhouse and how close your cancellation is to the check-in date. Please contact our support team at +91 8780493615 for detailed information regarding your specific booking.'
  },
  {
    question: 'Can I visit the farmhouse before booking?',
    answer: 'To ensure the privacy and security of our current guests, we do not allow pre-booking visits. However, we provide comprehensive, high-quality photos and accurate descriptions for all our properties so you know exactly what to expect.'
  },
  {
    question: 'Are the farmhouses pet-friendly?',
    answer: 'Many of our farmhouses welcome pets! Please check the specific amenities list on the farmhouse details page to confirm if pets are allowed before making your reservation.'
  },
  {
    question: 'Is there a limit to the number of guests?',
    answer: 'Yes, every farmhouse has a strict maximum guest capacity to ensure a comfortable and safe stay for everyone. Please refer to the specific property details for its maximum guest limit.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can easily reach our support team by calling or WhatsApping us at +91 8780493615, or by emailing us at info@enjoyfarm.in. We are always happy to help!'
  }
];

export default function HelpSupportPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Open first one by default

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22] font-sans antialiased">
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-[1280px] mx-auto text-center">
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#002E1E] tracking-tight mb-4">
          Help & <span className="text-[#00a877]">Support</span>
        </h1>
        <p className="text-gray-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Find answers to frequently asked questions about booking, policies, and your stay at Enjoy Farm.
        </p>
      </section>

      <main className="max-w-[1000px] mx-auto px-6 pb-32">
        
        {/* FAQs List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx}
                className={`bg-white border rounded-2xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                  isExpanded ? 'border-[#00a877]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <button
                  className="w-full px-6 py-5 flex justify-between items-center bg-white text-left focus:outline-none"
                  onClick={() => toggleExpand(idx)}
                >
                  <h3 className={`font-serif text-[17px] font-bold transition-colors duration-200 ${
                    isExpanded ? 'text-[#00a877]' : 'text-[#002E1E]'
                  }`}>
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    isExpanded ? 'bg-[#e6f4ea]' : 'bg-gray-50'
                  }`}>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-[#00a877]' : 'text-gray-400'
                    }`} />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[14px] text-gray-500 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
