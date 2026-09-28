/**
 * NR AURA BOTANICS
 * Footer with Facebook link, Instagram, WhatsApp contact (0334-3562833), newsletter, and discreet /admin link
*/

import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import {
  FACEBOOK_PAGE_URL,
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  BRAND_NAME,
  BRAND_DOMAIN,
  BRAND_TAGLINE
} from '../constants';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onLinkClick, onNavigateAdmin }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-botanic-wood text-[#FAF8F5] pt-16 pb-12 border-t border-[#3E271C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Brand & Purpose (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo textColor="text-[#FAF8F5]" />

            <p className="font-serif italic text-sm text-[#FCEEF2]">
              "{BRAND_TAGLINE}"
            </p>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Cold-pressed organic hair wellness in a 250ml fine mist spray bottle. Infused with Rosemary, Hibiscus, Amla & Fenugreek. Each bottle priced at Rs. 700/-. Delivered nationwide across Pakistan via Cash on Delivery.
            </p>

            {/* Social Channels */}
            <div className="pt-2 flex items-center gap-3">
              {/* Facebook Page link */}
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Follow NR AURA BOTANICS on Facebook"
                aria-label="Facebook Page"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Follow NR AURA BOTANICS on Instagram"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* WhatsApp Contact with 0334-3562833 */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Assalam o Alaikum, I would like to inquire about NR AURA BOTANICS 250ml Hair Growth Spray.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-transform hover:scale-105"
                title={`Chat on WhatsApp ${WHATSAPP_DISPLAY}`}
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FCEEF2]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <a
                  href="#home"
                  onClick={(e) => onLinkClick(e, 'home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#shop"
                  onClick={(e) => onLinkClick(e, 'shop')}
                  className="hover:text-white transition-colors"
                >
                  Shop Spray Serum (250ml)
                </a>
              </li>
              <li>
                <a
                  href="#ingredients"
                  onClick={(e) => onLinkClick(e, 'ingredients')}
                  className="hover:text-white transition-colors"
                >
                  Rosemary, Hibiscus, Amla, Fenugreek
                </a>
              </li>
              <li>
                <a
                  href="#how-to-use"
                  onClick={(e) => onLinkClick(e, 'how-to-use')}
                  className="hover:text-white transition-colors"
                >
                  How to Use Spray Ritual
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  onClick={(e) => onLinkClick(e, 'reviews')}
                  className="hover:text-white transition-colors"
                >
                  Customer Reviews
                </a>
              </li>
              <li>
                <a
                  href="#story"
                  onClick={(e) => onLinkClick(e, 'story')}
                  className="hover:text-white transition-colors"
                >
                  Our Story & Philosophy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter & WhatsApp Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FCEEF2]">
              Join the Hair Wellness Circle
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Receive tips on herbal scalp care, seasonal hair routines, and exclusive restock alerts.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-botanic-leaf hover:bg-botanic-leafDark text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-[#89F0A2] font-medium">✓ Thank you for subscribing to NR AURA BOTANICS.</p>
              )}
            </form>

            <div className="pt-2 text-xs text-white/70 space-y-2">
              <div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Assalam o Alaikum, I would like to order NR AURA BOTANICS 250ml Hair Growth Spray.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-sm transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                  </svg>
                  <span>Chat & Order on WhatsApp</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40">Official Website:</span>
                <span className="text-white font-medium">{BRAND_DOMAIN}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40">Facebook Page:</span>
                <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline truncate max-w-xs">
                  facebook.com/share/1F9k6wEBvE
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Admin Portal Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            © {new Date().getFullYear()} {BRAND_NAME} ({BRAND_DOMAIN}). All Rights Reserved. Cash on Delivery across Pakistan.
          </div>

          <div className="flex items-center gap-6">
            <span>250ml Spray Head Bottle · Rs. 700/-</span>
            <span className="text-white/20">|</span>
            {/* Discreet Admin Login Link */}
            <button
              onClick={onNavigateAdmin}
              className="text-white/40 hover:text-white/90 transition-colors flex items-center gap-1.5 focus:outline-none"
              title="Store Owner Admin Login"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
