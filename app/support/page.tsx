'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I book a farmhouse?',
    answer: 'Browse farmhouses, select your dates, choose guests, and complete the payment process. You\'ll receive a confirmation email instantly.'
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours may incur a fee of up to 50% of the booking amount.'
  },
  {
    question: 'How do I become a farmhouse owner?',
    answer: 'Register as an owner, submit your farmhouse details, and our team will verify and approve your listing within 24-48 hours.'
  },
  {
    question: 'Is payment secure?',
    answer: 'Yes, all payments are processed through Razorpay and Stripe, which are PCI-DSS compliant. Your financial data is encrypted and secure.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us at +91 98765 43210 or email us at support@agristay.com. Our support team is available 24/7.'
  },
  {
    question: 'Can I modify my booking?',
    answer: 'Yes, you can modify your booking dates or guest count by contacting the owner or through our support team. Changes are subject to availability.'
  }
];

export default function HelpSupportPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1b22] font-sans antialiased">
      <main className="max-w-[800px] mx-auto px-6 pt-32 pb-24">
        
        {/* Title */}
        <h1 className="font-serif text-3xl font-semibold text-[#003527] mb-8">
          Help & Support
        </h1>

        {/* FAQs List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-base font-semibold text-[#003527]">
                    {faq.question}
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#003527]' : ''}`} />
                </div>
                
                {/* Always visible as in mockup, but animated padding and expansion can also work nicely! */}
                <div className={`mt-3 text-sm text-gray-500 font-medium leading-relaxed transition-all duration-300`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
