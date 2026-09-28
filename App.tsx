/**
 * NR AURA BOTANICS
 * Main Application Root
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. Product price & catalog are authoritative from products.json / productService.
 * 2. Customer frontend can ONLY perform "Add to Cart" and "Checkout".
 * 3. Cash on Delivery & WhatsApp Orders integrated for Pakistan.
 * 4. Hidden Admin Portal at /admin with password authentication.
*/

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProduct from './components/FeaturedProduct';
import IngredientsSection from './components/IngredientsSection';
import HowToUseSection from './components/HowToUseSection';
import ReviewsSection from './components/ReviewsSection';
import OurStorySection from './components/OurStorySection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import AdminPortal from './components/AdminPortal';

import { CartItem, ProductsData, ViewType } from './types';
import {
  getAuthoritativeCatalog,
  fetchAuthoritativeCatalog,
  calculateOrderSecurity
} from './services/productService';

export function App() {
  // Store Catalog loaded from products.json / local authoritative service
  const [catalog, setCatalog] = useState<ProductsData>(getAuthoritativeCatalog());
  
  // Current active view
  const [view, setView] = useState<ViewType>('store');
  
  // Secure cart: Only stores { productId, quantity }
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nr_aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync catalog from /products.json on initial mount
  useEffect(() => {
    fetchAuthoritativeCatalog().then(data => {
      setCatalog(data);
    });

    // Check if initial route is /admin or hash #admin
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || hash === '#admin') {
      setView('admin');
    }

    const handleHashChange = () => {
      if (window.location.hash.toLowerCase() === '#admin') {
        setView('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nr_aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not cache cart", e);
    }
  }, [cart]);

  // Handle smooth scroll navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (view !== 'store') {
      setView('store');
      setTimeout(() => scrollToSection(targetId), 50);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (targetId: string) => {
    if (!targetId || targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      try {
        window.history.pushState(null, '', `#${targetId}`);
      } catch (err) {}
    }
  };

  /**
   * Add to Cart handler
   * SECURITY: Only takes productId and quantity. Price is NEVER passed from UI.
   */
  const handleAddToCart = (productId: string, quantity: number) => {
    const safeQty = Math.max(1, Math.min(99, Math.floor(quantity)));
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.productId === productId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + safeQty
        };
        return updated;
      } else {
        return [...prev, { productId, quantity: safeQty }];
      }
    });
    setIsCartOpen(true);
  };

  /**
   * Direct Buy Now handler
   */
  const handleBuyNow = (productId: string, quantity: number) => {
    handleAddToCart(productId, quantity);
    setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('checkout');
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleOrderCompleted = () => {
    // Clear cart after successful order
    setCart([]);
    try {
      localStorage.removeItem('nr_aura_cart');
    } catch {}
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-pastel-hibiscus font-sans text-botanic-charcoal selection:bg-botanic-pinkLight selection:text-botanic-wood flex flex-col justify-between">
      
      {/* Top Navbar rendered except on checkout or admin */}
      {view !== 'checkout' && view !== 'admin' && (
        <Navbar
          onNavClick={handleNavClick}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigateHome={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView('store');
          }}
          onNavigateAdmin={() => setView('admin')}
        />
      )}

      {/* Main View Port */}
      <main className="flex-grow">
        
        {/* VIEW 1: Storefront */}
        {view === 'store' && (
          <>
            <Hero onShopClick={() => scrollToSection('shop')} />
            <FeaturedProduct
              catalog={catalog}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
            <IngredientsSection />
            <HowToUseSection />
            <ReviewsSection />
            <OurStorySection />
            <FAQSection />
          </>
        )}

        {/* VIEW 2: Checkout (Cash on Delivery & WhatsApp Order for Pakistan) */}
        {view === 'checkout' && (
          <Checkout
            cart={cart}
            catalog={catalog}
            onBackToStore={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setView('store');
            }}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {/* VIEW 3: Hidden Admin Portal (/admin) */}
        {view === 'admin' && (
          <AdminPortal
            catalog={catalog}
            onUpdateCatalog={(newCatalog) => setCatalog(newCatalog)}
            onExitAdmin={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setView('store');
            }}
          />
        )}

      </main>

      {/* Footer rendered except in Admin portal */}
      {view !== 'admin' && (
        <>
          <Footer
            onLinkClick={handleNavClick}
            onNavigateAdmin={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setView('admin');
              try {
                window.location.hash = 'admin';
              } catch {}
            }}
          />

          {/* Floating WhatsApp Quick Action Box */}
          <a
            href={`https://wa.me/${catalog.storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Assalam o Alaikum, I would like to order NR AURA BOTANICS 250ml Hair Growth Spray.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group font-bold text-xs"
            title="Chat & Order on WhatsApp"
            aria-label="Order on WhatsApp"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
            </svg>
            <span className="hidden sm:inline">Order on WhatsApp</span>
          </a>
        </>
      )}

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        catalog={catalog}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView('checkout');
        }}
      />

    </div>
  );
}

export default App;
