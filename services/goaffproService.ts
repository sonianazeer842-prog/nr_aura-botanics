/**
 * NR AURA BOTANICS
 * GoAffPro Affiliate Tracking Service
 *
 * Shop ID: eajljgybld
 * Affiliate Portal: https://eajljgybld.goaffpro.com/
 *
 * Automatically tracks order conversions on the Thank You / Order Success page
 * so that referring affiliates earn their 10% commission.
 */

import { OrderSubmission } from '../types';

export const GOAFFPRO_SHOP_ID = 'eajljgybld';
export const GOAFFPRO_PORTAL_URL = 'https://eajljgybld.goaffpro.com/';

declare global {
  interface Window {
    goaffpro_order?: any;
    goaffproOrder?: any;
    goaffproTrackConversion?: (order: any) => void;
  }
}

/**
 * Fires the GoAffPro conversion tracking code upon order completion.
 * Populates window.goaffpro_order and calls window.goaffproTrackConversion(window.goaffpro_order)
 */
export function trackGoAffProConversion(order: OrderSubmission): void {
  if (typeof window === 'undefined') return;

  const order_id = order.orderId || ("AURA-" + Date.now());
  const order_total = Number(order.grandTotal) || 0;

  // Exact object requested:
  const goaffpro_order = {
    order_id: order_id,
    total: order_total
  };

  const names = (order.customerName || '').trim().split(' ');
  const firstName = names[0] || 'Customer';
  const lastName = names.slice(1).join(' ') || '';

  const goaffproOrderData = {
    id: order_id,
    number: order_id,
    order_id: order_id,
    order_number: order_id,
    total: order_total,
    subtotal: Number(order.subtotal) || order_total,
    tax: 0,
    shipping: Number(order.shippingFee) || 0,
    currency: 'PKR',
    financial_status: 'paid',
    customer: {
      first_name: firstName,
      last_name: lastName,
      phone: order.phone,
      address: order.address,
      city: order.city
    },
    line_items: order.items.map(item => ({
      name: item.productName,
      title: item.productName,
      price: Number(item.unitPrice) || 0,
      quantity: Number(item.quantity) || 1,
      total: Number(item.totalPrice) || 0,
      sku: item.productId,
      product_id: item.productId
    }))
  };

  // 1. Assign to window.goaffpro_order AND window.goaffproOrder
  window.goaffpro_order = goaffpro_order;
  window.goaffproOrder = goaffproOrderData;

  // 2. Call window.goaffproTrackConversion
  const executeConversion = (retriesLeft: number = 10) => {
    if (typeof window.goaffproTrackConversion === 'function') {
      try {
        window.goaffproTrackConversion(window.goaffpro_order);
        console.log('🌿 [GoAffPro] 10% Commission Conversion Tracked Successfully:', {
          shopId: GOAFFPRO_SHOP_ID,
          goaffpro_order: window.goaffpro_order,
          portal: GOAFFPRO_PORTAL_URL
        });
      } catch (err) {
        console.warn('⚠️ [GoAffPro] Error running goaffproTrackConversion:', err);
      }
    } else if (retriesLeft > 0) {
      setTimeout(() => executeConversion(retriesLeft - 1), 300);
    } else {
      console.log('🌿 [GoAffPro] window.goaffpro_order ready for tracking: Order #' + order_id);
    }
  };

  executeConversion();
}
