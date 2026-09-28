/**
 * NR AURA BOTANICS
 * Cart Slide-Over Drawer
 *
 * CRITICAL SECURITY ASSURANCE:
 * Item prices and totals are calculated strictly using the authoritative catalog
 * from products.json. The cart only holds { productId, quantity }.
*/

import React from 'react';
import { CartItem, ProductsData } from '../types';
import { calculateOrderSecurity } from '../services/productService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  catalog: ProductsData;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  catalog,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  // Strict secure calculation based on products.json
  const { verifiedItems, subtotal, shippingFee, grandTotal, currencySymbol, freeShippingThreshold } =
    calculateOrderSecurity(cart, catalog);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E5DDD2] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E8E1D5] flex items-center justify-between bg-botanic-cream">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-botanic-wood" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="font-serif text-lg font-semibold text-botanic-wood">
                Your Botanical Bag ({verifiedItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-botanic-woodMuted hover:text-botanic-wood transition-colors rounded-lg"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-botanic-sand/50 border-b border-[#E8E1D5] text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-botanic-wood mb-2 font-medium">
                Add <span className="font-bold text-botanic-leaf">{currencySymbol} {amountNeededForFreeShipping.toLocaleString()}</span> more for <strong className="text-botanic-leaf font-semibold">Free Delivery</strong> across Pakistan!
              </p>
            ) : (
              <p className="text-botanic-leaf font-bold mb-2 flex items-center gap-1.5">
                <span>✓</span> You have unlocked <strong>FREE Nationwide Delivery!</strong>
              </p>
            )}
            <div className="w-full bg-[#E5DDD2] h-2 rounded-full overflow-hidden">
              <div
                className="bg-botanic-leaf h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {verifiedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-botanic-cream flex items-center justify-center text-botanic-woodMuted">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-botanic-wood">Your bag is empty</h3>
                  <p className="text-xs text-botanic-woodMuted mt-1 max-w-xs">
                    Treat your hair to our all-natural Botanical Hair Growth Serum with cold-pressed rosemary and hibiscus.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-botanic-leaf text-white text-xs font-semibold rounded-lg hover:bg-botanic-leafDark transition-colors"
                >
                  Explore Serum
                </button>
              </div>
            ) : (
              verifiedItems.map(item => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3.5 rounded-xl border border-[#EBE3D8] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-lg border border-[#E0D7CB] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-semibold text-botanic-wood leading-snug">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-botanic-woodMuted hover:text-botanic-pink text-xs ml-2 p-1"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="text-[11px] text-botanic-woodMuted">{item.size}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#D9D1C3] rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, -1)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-semibold text-botanic-wood hover:bg-botanic-sand"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-botanic-wood tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-semibold text-botanic-wood hover:bg-botanic-sand"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif text-sm font-bold text-botanic-wood tabular-nums">
                        {currencySymbol} {item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {verifiedItems.length > 0 && (
            <div className="p-5 border-t border-[#E8E1D5] bg-botanic-cream space-y-3">
              <div className="space-y-1.5 text-xs text-botanic-wood">
                <div className="flex justify-between">
                  <span className="text-botanic-woodMuted">Subtotal</span>
                  <span className="font-medium tabular-nums">{currencySymbol} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-botanic-woodMuted">Delivery in Pakistan</span>
                  <span className="font-medium tabular-nums">
                    {shippingFee === 0 ? (
                      <span className="text-botanic-leaf font-bold">FREE</span>
                    ) : (
                      `${currencySymbol} ${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-serif font-bold text-botanic-wood pt-2 border-t border-[#E0D7CB]">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-base">{currencySymbol} {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-center text-botanic-woodMuted flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-botanic-leaf" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Cash on Delivery (COD) across Pakistan</span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-botanic-leaf text-white font-semibold text-sm rounded-lg hover:bg-botanic-leafDark transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
