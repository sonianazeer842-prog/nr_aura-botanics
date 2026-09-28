/**
 * NR AURA BOTANICS
 * Sticky Header & Navigation Bar
 *
 * WhatsApp box directly opens WhatsApp without showing phone number digits.
*/

import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';
import { FACEBOOK_PAGE_URL, WHATSAPP_NUMBER } from '../constants';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavClick,
  cartCount,
  onOpenCart,
  onNavigateHome,
  onNavigateAdmin
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileNav = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const whatsappOrderUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Assalam o Alaikum, I would like to order NR AURA BOTANICS Botanical Hair Growth Spray (250ml - Rs. 700).")}`;

  return (
    <>
      {/* Top Announcement Bar with direct clickable WhatsApp box (no raw digits shown) */}
      <div className="bg-botanic-wood text-[#FAF8F5] text-xs py-2 px-4 text-center font-medium tracking-wide border-b border-[#3E271C] flex flex-wrap items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-botanic-leaf animate-pulse"></span>
        <span>
          250ml Botanical Hair Growth Spray now <strong>Rs. 700/-</strong> · Free Delivery over Rs. 2,000
        </span>
        {/* Clickable WhatsApp Box */}
        <a
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold shadow-xs transition-transform hover:scale-105"
          title="Direct WhatsApp Order"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
          </svg>
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#d7f4d2]/95 backdrop-blur-md shadow-sm border-b border-[#c1e8bc] py-3'
            : 'bg-[#d7f4d2]/90 backdrop-blur-sm border-b border-[#c1e8bc] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Zone 1: Logo with Bespoke Botanical Hibiscus & Spray SVG */}
            <button
              onClick={onNavigateHome}
              className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-botanic-leaf rounded"
            >
              <BrandLogo />
            </button>

            {/* Zone 2: Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-botanic-wood/80">
              <a
                href="#home"
                onClick={(e) => onNavClick(e, 'home')}
                className="hover:text-botanic-leaf transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-botanic-leaf hover:after:w-full after:transition-all"
              >
                Home
              </a>
              <a
                href="#shop"
                onClick={(e) => onNavClick(e, 'shop')}
                className="hover:text-botanic-leaf transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-botanic-leaf hover:after:w-full after:transition-all"
              >
                Shop Spray (250ml)
              </a>
              <a
                href="#story"
                onClick={(e) => onNavClick(e, 'story')}
                className="hover:text-botanic-leaf transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-botanic-leaf hover:after:w-full after:transition-all"
              >
                Our Story
              </a>
              <a
                href="#ingredients"
                onClick={(e) => onNavClick(e, 'ingredients')}
                className="hover:text-botanic-leaf transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-botanic-leaf hover:after:w-full after:transition-all"
              >
                Ingredients
              </a>
              <a
                href="#how-to-use"
                onClick={(e) => onNavClick(e, 'how-to-use')}
                className="hover:text-botanic-leaf transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-botanic-leaf hover:after:w-full after:transition-all"
              >
                How to Use
              </a>
              <a
                href="#reviews"
                onClick={(e) => onNavClick(e, 'reviews')}
                className="hover:text-botanic-leaf transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-botanic-leaf hover:after:w-full after:transition-all"
              >
                Reviews
              </a>
            </nav>

            {/* Zone 3: Actions (WhatsApp Box, Cart & Mobile Toggle) */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* WhatsApp Box Button (Direct click opens WhatsApp) */}
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-full transition-all shadow-xs hover:shadow-md hover:scale-102"
                title="Direct WhatsApp Order"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                </svg>
                <span>WhatsApp Order</span>
              </a>

              {/* Shopping Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-botanic-wood hover:text-botanic-leaf transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-botanic-leaf rounded-full"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-botanic-pink text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-botanic-wood hover:text-botanic-leaf transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-botanic-leaf rounded"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#d7f4d2] border-b border-[#c1e8bc] px-4 pt-3 pb-6 space-y-3 animate-fade-in-up">
            <a
              href="#home"
              onClick={(e) => handleMobileNav(e, 'home')}
              className="block py-2 text-base font-medium text-botanic-wood hover:text-botanic-leaf border-b border-[#DCE8DB]"
            >
              Home
            </a>
            <a
              href="#shop"
              onClick={(e) => handleMobileNav(e, 'shop')}
              className="block py-2 text-base font-medium text-botanic-wood hover:text-botanic-leaf border-b border-[#DCE8DB]"
            >
              Shop Spray Serum (250ml - Rs. 700)
            </a>
            <a
              href="#story"
              onClick={(e) => handleMobileNav(e, 'story')}
              className="block py-2 text-base font-medium text-botanic-wood hover:text-botanic-leaf border-b border-[#DCE8DB]"
            >
              Our Story
            </a>
            <a
              href="#ingredients"
              onClick={(e) => handleMobileNav(e, 'ingredients')}
              className="block py-2 text-base font-medium text-botanic-wood hover:text-botanic-leaf border-b border-[#DCE8DB]"
            >
              Key Ingredients
            </a>
            <a
              href="#how-to-use"
              onClick={(e) => handleMobileNav(e, 'how-to-use')}
              className="block py-2 text-base font-medium text-botanic-wood hover:text-botanic-leaf border-b border-[#DCE8DB]"
            >
              How to Use Spray Ritual
            </a>
            <a
              href="#reviews"
              onClick={(e) => handleMobileNav(e, 'reviews')}
              className="block py-2 text-base font-medium text-botanic-wood hover:text-botanic-leaf border-b border-[#DCE8DB]"
            >
              Customer Reviews
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 text-sm font-bold rounded-lg bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                </svg>
                <span>Direct WhatsApp Order Box</span>
              </a>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 px-4 text-xs font-medium rounded-lg text-botanic-wood bg-[#DFECDE] hover:bg-[#D5E5D4] transition-colors"
              >
                Visit Facebook Page
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
