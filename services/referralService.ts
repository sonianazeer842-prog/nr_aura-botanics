/**
 * NR AURA BOTANICS
 * Client-Side URL Referral & Affiliate Tracking Service
 *
 * Requirements Met:
 * 1. URL Parameter Detection: Detects ?ref=..., ?aff=..., or ?via=...
 * 2. Multi-Tier Storage: Saves in both browser Cookie and LocalStorage with a 30-day expiration window.
 * 3. No Parameter Overwrites: Direct return visits without tracking parameters preserve existing referral until expiry.
 * 4. Checkout/Order Integration: Supplies stored affiliate_id to order payloads and WhatsApp links.
 */

import { useEffect, useState } from 'react';

export const REFERRAL_KEY = 'affiliate_id';
export const REFERRAL_COOKIE_NAME = 'affiliate_id';
export const REFERRAL_EXPIRY_DAYS = 30;
export const REFERRAL_EXPIRY_MS = REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Query parameters recognized as affiliate/referral codes
export const TRACKING_PARAM_KEYS = ['ref', 'aff', 'via', 'referral', 'affiliate'];

interface StoredReferralData {
  id: string;
  paramKey: string;
  capturedAt: number;
  expiresAt: number;
}

/**
 * Read cookie by name safely in client environment
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Set a cookie with a 30-day expiration window
 */
export function setCookie(name: string, value: string, days: number = REFERRAL_EXPIRY_DAYS): void {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  // SameSite=Lax and path=/ ensure the cookie is accessible across the entire domain/checkout
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

/**
 * Capture referral ID from current URL query parameters.
 * Preserves existing referral ID if no parameter is provided on subsequent visits.
 */
export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    let incomingAffiliateId: string | null = null;
    let matchedParam: string = 'ref';

    for (const key of TRACKING_PARAM_KEYS) {
      const val = urlParams.get(key);
      if (val && val.trim().length > 0) {
        incomingAffiliateId = val.trim();
        matchedParam = key;
        break;
      }
    }

    const now = Date.now();

    // CASE 1: New referral parameter present in URL
    if (incomingAffiliateId) {
      const record: StoredReferralData = {
        id: incomingAffiliateId,
        paramKey: matchedParam,
        capturedAt: now,
        expiresAt: now + REFERRAL_EXPIRY_MS
      };

      // Store in LocalStorage
      try {
        localStorage.setItem(REFERRAL_KEY, JSON.stringify(record));
      } catch (err) {
        console.warn('[Referral Tracker] LocalStorage write error', err);
      }

      // Store in Cookie for Vercel/SSR or server cookie fallback
      setCookie(REFERRAL_COOKIE_NAME, incomingAffiliateId, REFERRAL_EXPIRY_DAYS);

      return incomingAffiliateId;
    }

    // CASE 2: No referral parameter in URL. Preserve existing stored referral if unexpired.
    return getStoredAffiliateId();
  } catch (err) {
    console.warn('[Referral Tracker] Error processing URL parameters', err);
    return getStoredAffiliateId();
  }
}

/**
 * Retrieve active affiliate ID from localStorage or Cookie.
 * Automatically discards expired referrals past the 30-day window.
 */
export function getStoredAffiliateId(): string | null {
  if (typeof window === 'undefined') return null;

  const now = Date.now();

  // 1. Try LocalStorage with expiry validation
  try {
    const raw = localStorage.getItem(REFERRAL_KEY);
    if (raw) {
      const parsed: StoredReferralData = JSON.parse(raw);
      if (parsed && parsed.id) {
        // If expired past 30 days, clean up
        if (parsed.expiresAt && now > parsed.expiresAt) {
          localStorage.removeItem(REFERRAL_KEY);
          deleteCookie(REFERRAL_COOKIE_NAME);
        } else {
          return parsed.id;
        }
      }
    }
  } catch (err) {
    // If raw string was stored previously
    const legacyRaw = localStorage.getItem(REFERRAL_KEY);
    if (legacyRaw && !legacyRaw.startsWith('{')) {
      return legacyRaw;
    }
  }

  // 2. Fallback to Cookie
  const cookieVal = getCookie(REFERRAL_COOKIE_NAME);
  if (cookieVal && cookieVal.trim().length > 0) {
    return cookieVal.trim();
  }

  return null;
}

/**
 * React hook to initialize tracking on landing and get the active referral code
 */
export function useReferralTracking(): string | null {
  const [affiliateId, setAffiliateId] = useState<string | null>(null);

  useEffect(() => {
    const captured = captureReferralFromUrl();
    setAffiliateId(captured);
  }, []);

  return affiliateId;
}
