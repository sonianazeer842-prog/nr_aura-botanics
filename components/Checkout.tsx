/**
 * NR AURA BOTANICS
 * Checkout Module: Cash on Delivery & WhatsApp Order for Pakistan
 *
 * CRITICAL SECURITY ASSURANCE:
 * Prices and totals are recalculated strictly using the authoritative catalog
 * in products.json. Any frontend tampering with prices is blocked.
*/

import React, { useState, useEffect } from 'react';
import { CartItem, ProductsData, OrderSubmission } from '../types';
import { calculateOrderSecurity, buildWhatsAppOrderUrl } from '../services/productService';
import { PAKISTAN_MAJOR_CITIES, WHATSAPP_NUMBER } from '../constants';
import { trackMetaPurchase } from '../services/metaPixelService';
import { getStoredAffiliateId } from '../services/referralService';
import { trackGoAffProConversion } from '../services/goaffproService';

interface CheckoutProps {
  cart: CartItem[];
  catalog: ProductsData;
  onBackToStore: () => void;
  onOrderCompleted: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  cart,
  catalog,
  onBackToStore,
  onOrderCompleted
}) => {
  // Authoritative calculations
  const { verifiedItems, subtotal, shippingFee, grandTotal, currencySymbol } =
    calculateOrderSecurity(cart, catalog);

  const activeAffiliateId = getStoredAffiliateId();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [customCity, setCustomCity] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WHATSAPP'>('COD');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderSubmission | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // GoAffPro Conversion Tracking for Order Success / Thank You screen
  useEffect(() => {
    if (confirmedOrder) {
      const order_id = confirmedOrder.orderId || ("AURA-" + Date.now());
      const order_total = confirmedOrder.grandTotal;

      const win = window as any;
      win.goaffpro_order = {
        order_id: order_id,
        total: order_total
      };

      if (win.goaffproTrackConversion) {
        win.goaffproTrackConversion(win.goaffpro_order);
      }

      trackGoAffProConversion(confirmedOrder);
    }
  }, [confirmedOrder?.orderId]);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errors.name = "Please enter your full name.";
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = "Please enter a valid 11-digit mobile number (e.g., 0300 1234567).";
    }
    if (!address.trim()) {
      errors.address = "Please enter your complete street and house delivery address.";
    }
    const finalCity = city === 'Other City' ? customCity.trim() : city;
    if (!finalCity) {
      errors.city = "Please select or enter your delivery city.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (verifiedItems.length === 0) return;

    setIsSubmitting(true);

    const finalCity = city === 'Other City' ? customCity.trim() : city;
    const orderId = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
    const affiliateId = getStoredAffiliateId();

    const orderData: OrderSubmission = {
      orderId,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: finalCity,
      notes: notes.trim(),
      affiliateId: affiliateId || undefined,
      paymentMethod,
      items: verifiedItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal,
      shippingFee,
      grandTotal
    };

    // Track Meta Pixel Purchase event with catalog match content_ids
    const purchasedProducts = cart
      .map(item => {
        const p = catalog.products.find(prod => prod.id === item.productId);
        return p ? { product: p, quantity: item.quantity } : null;
      })
      .filter((item): item is { product: any; quantity: number } => item !== null);
    trackMetaPurchase(orderData.orderId, purchasedProducts, grandTotal);

    // Track GoAffPro affiliate sale conversion (Shop ID: eajljgybld)
    trackGoAffProConversion(orderData);

    // Store recent order locally for receipt
    try {
      const existing = JSON.parse(localStorage.getItem('nr_aura_orders') || '[]');
      existing.unshift(orderData);
      localStorage.setItem('nr_aura_orders', JSON.stringify(existing.slice(0, 10)));
    } catch (e) {
      console.warn("Could not save local order copy", e);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedOrder(orderData);
      onOrderCompleted();

      // If customer opted for direct WhatsApp order, open it immediately
      if (paymentMethod === 'WHATSAPP') {
        const waUrl = buildWhatsAppOrderUrl(orderData, catalog.storeInfo);
        window.open(waUrl, '_blank');
      }
    }, 600);
  };

  // Receipt Modal upon successful order
  if (confirmedOrder) {
    const waUrl = buildWhatsAppOrderUrl(confirmedOrder, catalog.storeInfo);

    // Immediate assignment and trigger for GoAffPro tracking on Thank You screen
    if (typeof window !== 'undefined') {
      const win = window as any;
      win.goaffpro_order = {
        order_id: confirmedOrder.orderId || ("AURA-" + Date.now()),
        total: confirmedOrder.grandTotal
      };
      if (typeof win.goaffproTrackConversion === 'function') {
        try {
          win.goaffproTrackConversion(win.goaffpro_order);
        } catch {
          // safe
        }
      }
    }

    return (
      <div className="min-h-screen bg-botanic-cream py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E5DDD2] shadow-lg text-center space-y-6 animate-fade-in-up">
          
          {/* Success Checkmark Emblem */}
          <div className="w-16 h-16 rounded-full bg-botanic-leafSoft text-botanic-leaf mx-auto flex items-center justify-center shadow-xs">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-1">
              Order Confirmed Successfully
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-botanic-wood">
              Thank You, {confirmedOrder.customerName.split(' ')[0]}!
            </h2>
            <p className="text-sm text-botanic-woodMuted mt-1">
              Order Reference: <strong className="text-botanic-wood">#{confirmedOrder.orderId}</strong>
            </p>
          </div>

          <div className="bg-botanic-cream/70 rounded-2xl p-5 border border-[#EBE3D8] text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-[#E0D7CB] pb-2">
              <span className="text-botanic-woodMuted">Payment Mode:</span>
              <span className="font-semibold text-botanic-wood">
                {confirmedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'WhatsApp Order (COD)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E0D7CB] pb-2">
              <span className="text-botanic-woodMuted">Delivery Address:</span>
              <span className="font-semibold text-botanic-wood text-right max-w-xs truncate">
                {confirmedOrder.address}, {confirmedOrder.city}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E0D7CB] pb-2">
              <span className="text-botanic-woodMuted">Phone Number:</span>
              <span className="font-semibold text-botanic-wood">{confirmedOrder.phone}</span>
            </div>
            <div className="flex justify-between border-b border-[#E0D7CB] pb-2">
              <span className="text-botanic-woodMuted">Estimated Delivery:</span>
              <span className="font-semibold text-botanic-leaf">
                {catalog.storeInfo.deliveryEstimate || '2-4 Working Days'}
              </span>
            </div>
            {confirmedOrder.affiliateId && (
              <div className="flex justify-between border-b border-[#E0D7CB] pb-2">
                <span className="text-botanic-woodMuted">Referral / Affiliate Partner:</span>
                <span className="font-semibold text-botanic-leaf font-mono">
                  {confirmedOrder.affiliateId}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 font-serif text-base font-bold text-botanic-wood">
              <span>Total Payable at Doorstep:</span>
              <span className="tabular-nums">Rs. {confirmedOrder.grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-xs text-botanic-wood/80 leading-relaxed text-left p-3.5 bg-botanic-sand/50 rounded-xl">
            📦 Your 250ml botanical hair growth spray bottle is being carefully prepared and packaged in sealed, tamper-evident protective packaging. Our dispatch partner will contact your phone before doorstep arrival.
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
              </svg>
              <span>Track or Chat with us on WhatsApp</span>
            </a>

            <button
              onClick={onBackToStore}
              className="w-full py-3 px-4 bg-botanic-sand text-botanic-wood hover:bg-[#EAE4DC] font-semibold text-xs rounded-xl transition-colors"
            >
              Return to Store
            </button>
          </div>

        </div>
      </div>
    );
  }

  // If cart is empty
  if (verifiedItems.length === 0) {
    return (
      <div className="min-h-screen bg-botanic-cream py-20 px-4 text-center flex flex-col items-center justify-center">
        <h2 className="font-serif text-2xl font-bold text-botanic-wood mb-2">Your Bag is Empty</h2>
        <p className="text-sm text-botanic-woodMuted mb-6 max-w-sm">
          Please add our Botanical Hair Growth Serum to proceed with checkout.
        </p>
        <button
          onClick={onBackToStore}
          className="px-6 py-2.5 bg-botanic-leaf text-white font-semibold text-xs rounded-lg hover:bg-botanic-leafDark"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botanic-cream py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-botanic-wood hover:text-botanic-leaf transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Shopping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Pakistan Delivery & Order Details Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD2] shadow-xs space-y-6">
            
            <div>
              <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-1">
                Fast & Secure Delivery
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-botanic-wood">
                Delivery Details (Pakistan)
              </h1>
              <p className="text-xs sm:text-sm text-botanic-woodMuted mt-1">
                Cash on Delivery available nationwide across all cities and towns.
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-botanic-wood mb-1">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Fatima Ali / Ahmad Khan"
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white ${
                    formErrors.name ? 'border-red-400' : 'border-[#D9D1C3]'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-botanic-wood mb-1">
                  Mobile / WhatsApp Number * (For Courier Verification)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white ${
                      formErrors.phone ? 'border-red-400' : 'border-[#D9D1C3]'
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-botanic-wood mb-1">
                  Street & House Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House / Apartment #, Street #, Sector / Colony / Area"
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white ${
                    formErrors.address ? 'border-red-400' : 'border-[#D9D1C3]'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                )}
              </div>

              {/* City Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-[#D9D1C3] rounded-xl focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white text-botanic-wood"
                  >
                    {PAKISTAN_MAJOR_CITIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {city === 'Other City' && (
                  <div>
                    <label className="block text-xs font-semibold text-botanic-wood mb-1">
                      Specify City Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customCity}
                      onChange={e => setCustomCity(e.target.value)}
                      placeholder="Enter city or town name"
                      className="w-full px-4 py-3 text-sm border border-[#D9D1C3] rounded-xl focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-botanic-wood mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, deliver in afternoon"
                  className="w-full px-4 py-2.5 text-sm border border-[#D9D1C3] rounded-xl focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-[#E8E1D5] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-botanic-wood">
                  Select Payment Option:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-botanic-leaf bg-botanic-leafSoft/40 ring-1 ring-botanic-leaf'
                        : 'border-[#E0D7CB] bg-white hover:border-botanic-woodMuted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="text-botanic-leaf focus:ring-botanic-leaf"
                      />
                      <div>
                        <span className="block font-semibold text-xs sm:text-sm text-botanic-wood">
                          Cash on Delivery (COD)
                        </span>
                        <span className="block text-[11px] text-botanic-woodMuted mt-0.5">
                          Pay courier upon delivery
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Order Option */}
                  <div
                    onClick={() => setPaymentMethod('WHATSAPP')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'WHATSAPP'
                        ? 'border-[#25D366] bg-[#EAF7EE] ring-1 ring-[#25D366]'
                        : 'border-[#E0D7CB] bg-white hover:border-[#25D366]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'WHATSAPP'}
                        onChange={() => setPaymentMethod('WHATSAPP')}
                        className="text-[#25D366] focus:ring-[#25D366]"
                      />
                      <div>
                        <span className="block font-semibold text-xs sm:text-sm text-botanic-wood">
                          WhatsApp Order Confirmation
                        </span>
                        <span className="block text-[11px] text-botanic-woodMuted mt-0.5">
                          Instant chat & courier dispatch
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-botanic-leaf text-white font-semibold text-sm rounded-xl hover:bg-botanic-leafDark transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Your Order...</span>
                  ) : paymentMethod === 'COD' ? (
                    <>
                      <span>Confirm Cash on Delivery Order · Rs. {grandTotal.toLocaleString()}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Place Order & Open in WhatsApp · Rs. {grandTotal.toLocaleString()}</span>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Right Column: Order Summary (Authoritative) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD2] shadow-xs space-y-6">
            
            <h2 className="font-serif text-xl font-semibold text-botanic-wood pb-3 border-b border-[#E8E1D5]">
              Order Summary
            </h2>

            {/* Items list */}
            <div className="space-y-3">
              {verifiedItems.map(item => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-14 h-14 rounded-lg object-cover border border-[#E0D7CB]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-botanic-wood text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-semibold text-botanic-wood truncate">
                      {item.productName}
                    </h4>
                    <span className="text-[11px] text-botanic-woodMuted block">{item.size}</span>
                  </div>
                  <span className="font-serif text-xs font-bold text-botanic-wood tabular-nums">
                    {currencySymbol} {item.totalPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Active Affiliate / Referral Badge */}
            {activeAffiliateId && (
              <div className="pt-3 border-t border-[#E8E1D5]">
                <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-semibold">Referral Partner Applied:</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 bg-white/90 px-2 py-0.5 rounded text-[11px] border border-emerald-300">
                    {activeAffiliateId}
                  </span>
                </div>
              </div>
            )}

            {/* Pricing details */}
            <div className="pt-4 border-t border-[#E8E1D5] space-y-2 text-xs text-botanic-wood">
              <div className="flex justify-between">
                <span className="text-botanic-woodMuted">Subtotal</span>
                <span className="font-medium tabular-nums">{currencySymbol} {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-botanic-woodMuted">Nationwide Shipping</span>
                <span className="font-medium tabular-nums">
                  {shippingFee === 0 ? (
                    <span className="text-botanic-leaf font-bold">FREE</span>
                  ) : (
                    `${currencySymbol} ${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-botanic-wood pt-3 border-t border-[#E8E1D5]">
                <span>Total Amount</span>
                <span className="tabular-nums">{currencySymbol} {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-botanic-cream rounded-xl border border-[#EBE3D8] text-[11px] text-botanic-wood/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-botanic-wood">
                <svg className="w-3.5 h-3.5 text-botanic-leaf" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified Buyer Protection</span>
              </div>
              <p>You pay zero in advance. Inspect package upon arrival and pay cash directly to the courier.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
