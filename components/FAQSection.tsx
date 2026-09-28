/**
 * NR AURA BOTANICS
 * FAQ Section
*/

import React, { useState } from 'react';
import { FAQ_LIST } from '../constants';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="py-16 md:py-24 bg-transparent border-b border-[#D4E7D2]/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-2">
            Clear Answers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-botanic-wood">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-botanic-woodMuted">
            Everything you need to know about our 250ml Botanical Hair Growth Spray and delivery in Pakistan.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#D4E7D2] rounded-xl overflow-hidden transition-colors bg-[#F7FAF6]/90 backdrop-blur-xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-botanic-cream/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg font-medium text-botanic-wood">
                    {faq.q}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-botanic-woodMuted shrink-0 border border-[#E0D7CB]">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-botanic-wood/80 leading-relaxed border-t border-[#EFEAE2]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
