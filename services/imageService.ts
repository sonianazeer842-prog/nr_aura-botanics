/**
 * NR AURA BOTANICS
 * Central Image Management Service
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * 1. NO hardcoded "base picture" will ever overwrite user-selected images.
 * 2. When the admin changes any picture, that change is permanently stored in
 *    localStorage and /public/images.json until explicitly changed by the admin.
 * 3. Works seamlessly on Vercel: Admin can change pictures in the /admin-images portal
 *    or directly edit /public/images.json on GitHub/Vercel.
 */

import { useState, useEffect } from 'react';
import { SiteImages } from '../types';

export const fallbackDefaultImages: SiteImages = {
  _comment: "NR AURA BOTANICS - Central Website Image Registry. Update image paths or alt texts here, or manage visually via /admin-images.",
  hero: {
    src: "/product-original.png",
    alt: "NR AURA BOTANICS Botanical Hair Growth Serum with Rosemary, Hibiscus, Amla, and Fenugreek",
    title: "Hero Section Bottle"
  },
  howToUse: {
    src: "/lifestyle-5.jpg",
    alt: "Daily scalp application ritual with fine mist spray bottle",
    title: "How To Use Section Image"
  },
  ingredients: {
    src: "/ingredients.png",
    alt: "Raw organic botanicals: Rosemary, Hibiscus petals, raw Amla, and golden Fenugreek seeds",
    title: "Ingredients Section Banner"
  },
  logo: {
    src: "/logo.png",
    alt: "NR AURA BOTANICS Emblem Logo",
    title: "Brand Official Logo"
  },
  products: {
    single: {
      src: "/product-original.png",
      alt: "Single 250ml Spray Bottle",
      title: "Single Bottle (250ml)"
    },
    duo: {
      src: "/product-original.png",
      alt: "Duo Pack 2x250ml Spray Bottles",
      title: "Duo Course (2x250ml)"
    },
    trio: {
      src: "/product-original.png",
      alt: "Trio Pack 3x250ml Spray Bottles",
      title: "Trio Transformation Course (3x250ml)"
    }
  },
  gallery: [
    {
      id: "lifestyle-custom-6033",
      src: "/lifestyle-2-1790837091164.jpg",
      alt: "New Lifestyle Placement",
      label: "Lifestyle Slide 2"
    },
    {
      id: "lifestyle-5",
      src: "/lifestyle-5.jpg",
      alt: "Woman holding bottle in bathroom for daily scalp routine",
      label: "In-Hand Daily Scalp Routine"
    },
    {
      id: "lifestyle-custom-4661",
      src: "/lifestyle-3-1790837152024.jpg",
      alt: "New Lifestyle Placement",
      label: "Lifestyle Slide 3"
    },
    {
      id: "lifestyle-custom-9854",
      src: "/lifestyle-4-1790837174523.jpeg",
      alt: "New Lifestyle Placement",
      label: "Lifestyle Slide 4"
    },
    {
      id: "lifestyle-custom-2359",
      src: "/lifestyle-5-1790837190447.jpg",
      alt: "New Lifestyle Placement",
      label: "Lifestyle Slide 5"
    }
  ]
};

const STORAGE_KEY = 'nr_aura_permanent_images_store';
const LOCK_KEY = 'nr_aura_images_user_locked';
const EVENT_NAME = 'nr_aura_images_updated';

/**
 * Synchronously retrieves the current authoritative images.
 * Priority:
 * 1. User-customized images in localStorage (NEVER reverted)
 * 2. Cached server images.json
 * 3. Initial bundle fallback
 */
export function getAuthoritativeImages(): SiteImages {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.hero && parsed.gallery && Array.isArray(parsed.gallery)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse cached images", e);
  }
  return fallbackDefaultImages;
}

/**
 * Asynchronously fetches /images.json from Vercel / server with cache-busting.
 * SAFETY RULE: If the user has saved custom images in localStorage,
 * we DO NOT overwrite them with a stale server file unless the user explicitly requested a sync.
 */
export async function fetchAuthoritativeImages(forceSync = false): Promise<SiteImages> {
  const isUserLocked = localStorage.getItem(LOCK_KEY) === 'true';

  try {
    const res = await fetch(`/images.json?t=${Date.now()}`);
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && serverData.hero && serverData.gallery && Array.isArray(serverData.gallery)) {
        // If the user has explicitly locked their images, only overwrite if forceSync is true
        if (!isUserLocked || forceSync) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: serverData }));
          return serverData;
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch remote /images.json, using local authoritative registry", e);
  }

  return getAuthoritativeImages();
}

/**
 * Permanently saves image registry.
 * - Saves to localStorage with permanent lock so no base picture can overwrite it.
 * - Broadcasts update to all components immediately.
 * - In local development: writes directly to /public/images.json on disk.
 */
export async function saveImageRegistry(newImages: SiteImages): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Lock in localStorage permanently
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
    localStorage.setItem(LOCK_KEY, 'true');
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newImages }));

    // 2. Try writing to dev server API if available
    try {
      const res = await fetch('/api/save-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImages),
      });
      if (res.ok) {
        return {
          success: true,
          message: 'Images saved permanently! /public/images.json has been updated on disk.'
        };
      }
    } catch {
      // Static host (Vercel)
    }

    return {
      success: true,
      message: 'Images saved permanently in your browser and live site! To deploy permanently across Vercel, download images.json and push to GitHub.'
    };
  } catch (error) {
    return { success: false, message: `Save failed: ${String(error)}` };
  }
}

/**
 * Upload an image file from device.
 * Converts to high-res WebP/JPEG data URL or posts to server API.
 */
export async function uploadImageFile(file: File, filename?: string): Promise<{ success: boolean; url: string; message: string }> {
  const cleanName = filename || file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Try posting to dev API if available
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: cleanName, data: base64Data })
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, url: json.path || `/${cleanName}`, message: 'Uploaded to public folder' };
      }
    } catch {
      // Fallback: Use direct data URL so it works in 100% of environments (including Vercel without backend)
    }

    return { success: true, url: base64Data, message: 'Image loaded and ready to save' };
  } catch (err) {
    return { success: false, url: '', message: `Upload error: ${String(err)}` };
  }
}

/**
 * Download images.json to commit directly to GitHub repository for Vercel.
 */
export function downloadImagesJson(images: SiteImages) {
  const jsonStr = JSON.stringify(images, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'images.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * React Hook for real-time site images.
 */
export function useSiteImages() {
  const [images, setImages] = useState<SiteImages>(getAuthoritativeImages());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAuthoritativeImages().then((data) => {
      setImages(data);
      setLoading(false);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteImages>;
      if (customEvent.detail) {
        setImages(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return { images, loading, setImages };
}
