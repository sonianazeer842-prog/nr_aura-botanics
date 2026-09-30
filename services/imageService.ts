/**
 * NR AURA BOTANICS
 * Central Image Management Service
 *
 * Governs all website images from /public/images.json with:
 * 1. Live synchronization in browser (localStorage + custom event broadcast)
 * 2. Vite dev API endpoint writing directly to /public/images.json on disk
 * 3. Fallback to bundled defaults for zero-broken-image resilience
 * 4. Export / download helper for GitHub repo commits
 */

import { useState, useEffect } from 'react';
import { SiteImages } from '../types';

export const defaultSiteImages: SiteImages = {
  _comment: "NR AURA BOTANICS - Central Website Image Registry. Update image paths or alt texts here.",
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
  gallery: [
    {
      id: "lifestyle-1",
      src: "/lifestyle-1.jpg",
      alt: "Fine Micro-Mist Spray releasing from NR AURA BOTANICS bottle",
      label: "Fine Micro-Mist Spray"
    },
    {
      id: "lifestyle-2",
      src: "/lifestyle-2.jpg",
      alt: "Pure Hydration and water splash around the hair growth serum",
      label: "Pure Hydration Splash"
    },
    {
      id: "lifestyle-3",
      src: "/lifestyle-3.jpg",
      alt: "Fresh botanical harvest on wooden pedestal with amla and hibiscus",
      label: "Botanical Harvest & Herbs"
    },
    {
      id: "lifestyle-4",
      src: "/lifestyle-4.jpg",
      alt: "Floral garden infusion with pink roses and botanicals",
      label: "Floral Blossom Infusion"
    },
    {
      id: "lifestyle-5",
      src: "/lifestyle-5.jpg",
      alt: "Woman holding bottle in bathroom for daily scalp routine",
      label: "In-Hand Daily Scalp Routine"
    }
  ]
};

const STORAGE_KEY = 'nr_aura_site_images_v2';
const EVENT_NAME = 'nr_aura_images_updated';

/**
 * Retrieves the cached or default images registry immediately (synchronous).
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
    console.warn("Could not parse cached images, using defaults", e);
  }
  return defaultSiteImages;
}

/**
 * Asynchronously fetches /images.json from the server with cache-busting.
 */
export async function fetchAuthoritativeImages(): Promise<SiteImages> {
  try {
    const res = await fetch(`/images.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.hero && data.gallery && Array.isArray(data.gallery)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
        return data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch remote /images.json, falling back to local registry", e);
  }
  return getAuthoritativeImages();
}

/**
 * Persists updated images registry to localStorage, dispatches update event,
 * and calls dev API endpoint /api/save-images to write directly to /public/images.json.
 */
export async function saveImageRegistry(newImages: SiteImages): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Save to local storage for immediate browser & preview reactivity
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newImages }));

    // 2. Attempt to write to file system via Vite dev server middleware
    try {
      const res = await fetch('/api/save-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImages),
      });
      if (res.ok) {
        return { success: true, message: 'Saved to /public/images.json and synced successfully!' };
      }
    } catch {
      // In static deployment (e.g. Vercel client-only), local storage was updated
    }

    return {
      success: true,
      message: 'Images updated in application. Click "Download images.json" to commit changes to GitHub.'
    };
  } catch (error) {
    return { success: false, message: `Failed to save images: ${String(error)}` };
  }
}

/**
 * Upload an image file (saves via dev server API or falls back to data URL).
 */
export async function uploadImageFile(file: File, filename?: string): Promise<{ success: boolean; url: string; message: string }> {
  const cleanName = filename || file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetPath = `/public/${cleanName}`.replace('/public//', '/');
  const publicUrl = `/${cleanName}`.replace('//', '/');

  try {
    // Convert to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Try posting to dev middleware
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: cleanName, data: base64Data })
      });
      if (res.ok) {
        return { success: true, url: publicUrl, message: `Uploaded to ${targetPath}` };
      }
    } catch {
      // fallback to data URL if API endpoint is not active
    }

    return { success: true, url: base64Data, message: `Loaded image data for ${cleanName}` };
  } catch (err) {
    return { success: false, url: '', message: `Upload failed: ${String(err)}` };
  }
}

/**
 * Downloads current images.json file to user's computer for GitHub repository push.
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
 * React Hook for consuming and updating site images throughout the app.
 */
export function useSiteImages() {
  const [images, setImages] = useState<SiteImages>(getAuthoritativeImages());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial fetch from /images.json
    fetchAuthoritativeImages().then((data) => {
      setImages(data);
      setLoading(false);
    });

    // Listen for custom broadcast event from /admin-images
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
