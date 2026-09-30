import React, { useState } from 'react';
import { SiteImages, GalleryImageItem, ImageItem } from '../types';
import {
  saveImageRegistry,
  uploadImageFile,
  downloadImagesJson,
  defaultSiteImages
} from '../services/imageService';

interface AdminImagesProps {
  images: SiteImages;
  onUpdateImages: (newImages: SiteImages) => void;
  onExit: () => void;
}

const ADMIN_PASSCODE = 'nr-aura-admin';
const AUTH_STORAGE_KEY = 'nr_aura_admin_session';

export const AdminImages: React.FC<AdminImagesProps> = ({
  images: initialImages,
  onUpdateImages,
  onExit
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Local draft state of site images
  const [siteImages, setSiteImages] = useState<SiteImages>(initialImages);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSCODE) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passcode. Use the admin secret to manage images.');
    }
  };

  const handleQuickUnlock = () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    setIsAuthenticated(true);
  };

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Update Core Section Image
  const handleUpdateCore = (key: 'hero' | 'howToUse' | 'ingredients' | 'logo', field: keyof ImageItem, value: string) => {
    setSiteImages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Handle file upload for core section image
  const handleUploadCore = async (key: 'hero' | 'howToUse' | 'ingredients' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImageFile(file, `${key}-${Date.now()}.${file.name.split('.').pop()}`);
    if (res.success) {
      handleUpdateCore(key, 'src', res.url);
      showNotification(`Uploaded new ${key} image: ${res.url}`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  // Gallery Drag & Drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newGallery = [...siteImages.gallery];
    const draggedItem = newGallery[draggedIndex];
    newGallery.splice(draggedIndex, 1);
    newGallery.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setSiteImages(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move item manually up or down
  const handleMoveGallery = (index: number, direction: 'up' | 'down') => {
    const newGallery = [...siteImages.gallery];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newGallery.length) return;

    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;
    setSiteImages(prev => ({ ...prev, gallery: newGallery }));
  };

  // Update gallery item details
  const handleUpdateGalleryItem = (index: number, field: keyof GalleryImageItem, value: string) => {
    setSiteImages(prev => {
      const updated = [...prev.gallery];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, gallery: updated };
    });
  };

  // Upload replacement for gallery item
  const handleUploadGalleryItem = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImageFile(file, `lifestyle-uploaded-${Date.now()}.${file.name.split('.').pop()}`);
    if (res.success) {
      handleUpdateGalleryItem(index, 'src', res.url);
      showNotification(`Replaced slide ${index + 1} with ${res.url}`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  // Delete gallery item
  const handleDeleteGalleryItem = (index: number) => {
    if (siteImages.gallery.length <= 1) {
      showNotification('Cannot delete the last remaining gallery image.', 'error');
      return;
    }
    const item = siteImages.gallery[index];
    if (window.confirm(`Are you sure you want to remove "${item.label || item.src}" from the slider?`)) {
      setSiteImages(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, idx) => idx !== index)
      }));
      showNotification('Slide removed from gallery.', 'info');
    }
  };

  // Add new gallery slide
  const handleAddGalleryItem = () => {
    const newId = `lifestyle-${siteImages.gallery.length + 1}-${Date.now().toString().slice(-4)}`;
    const newItem: GalleryImageItem = {
      id: newId,
      src: '/lifestyle-1.jpg',
      alt: 'New Lifestyle Placement',
      label: `Lifestyle Placement ${siteImages.gallery.length + 1}`
    };
    setSiteImages(prev => ({
      ...prev,
      gallery: [...prev.gallery, newItem]
    }));
    showNotification('New slide added to gallery. You can now edit its path, label, or upload a photo.', 'success');
  };

  // Save All Changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    const result = await saveImageRegistry(siteImages);
    setIsSaving(false);

    if (result.success) {
      onUpdateImages(siteImages);
      showNotification('All changes saved! /public/images.json updated and active.', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  // Reset to default bundled images
  const handleResetDefaults = () => {
    if (window.confirm('Reset all website images back to initial default values?')) {
      setSiteImages(defaultSiteImages);
      showNotification('Reset to defaults. Remember to click "Save All Changes" to persist.', 'info');
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(siteImages, null, 2));
    showNotification('Copied images.json content to clipboard!', 'success');
  };

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-800 rounded-3xl p-8 border border-stone-700 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block mb-1">
              Protected Administrative Area
            </span>
            <h1 className="font-serif text-2xl font-bold text-white">Central Image Management</h1>
            <p className="text-xs text-stone-400 mt-2">
              Manage website images, reorder lifestyle sliders, and configure paths for /public/images.json.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full px-4 py-2.5 bg-stone-900 border border-stone-600 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#D4AF37]"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#163821] hover:bg-[#1f4e2e] text-[#D4AF37] font-bold rounded-xl border border-[#D4AF37]/40 shadow-lg transition-all"
            >
              Access Image Manager
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 bg-stone-700/60 hover:bg-stone-700 text-stone-300 text-xs rounded-xl transition-all"
            >
              Quick Unlock (Preview Session)
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onExit}
              className="text-xs text-stone-400 hover:text-white underline"
            >
              &larr; Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1410] text-stone-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#161D17]/95 backdrop-blur-md border-b border-[#2C3B2E] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D2A1F] border border-[#3E5540] flex items-center justify-center text-[#9ED8A2]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#9ED8A2] font-bold">
                NR AURA BOTANICS
              </span>
              <h1 className="text-lg font-serif font-bold text-white">Central Image Manager (/admin-images)</h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 bg-[#2D733E] hover:bg-[#388D4D] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </button>

            <button
              type="button"
              onClick={() => downloadImagesJson(siteImages)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-[#9ED8A2] text-xs font-semibold rounded-xl border border-[#3E5540] transition-all flex items-center gap-1.5"
              title="Download images.json for GitHub commit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download images.json</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 transition-all"
            >
              {showJsonRaw ? 'Hide JSON' : 'View JSON'}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-stone-800 hover:bg-rose-900/60 text-stone-400 hover:text-rose-200 text-xs rounded-xl border border-stone-700 transition-all"
            >
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={onExit}
              className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold rounded-xl transition-all"
            >
              &larr; Exit to Store
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-medium transition-all ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
            : statusMessage.type === 'error'
            ? 'bg-rose-950 border-rose-500 text-rose-200'
            : 'bg-blue-950 border-blue-500 text-blue-200'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        
        {/* Architecture & GitHub Workflow Info Banner */}
        <div className="bg-[#17221A] rounded-2xl p-5 border border-[#2B3F30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#9ED8A2] font-bold">
              Central Registry Status: Synchronized with /public/images.json
            </span>
            <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
              All website sections (Hero, How-To-Use, Ingredients, Logo, and the Product Slider) read dynamically from <code className="text-[#9ED8A2] bg-black/40 px-1 py-0.5 rounded">/public/images.json</code>. After pushing to GitHub, you can simply replace image files in the <code className="text-[#9ED8A2] bg-black/40 px-1 py-0.5 rounded">public/</code> directory or edit <code className="text-[#9ED8A2] bg-black/40 px-1 py-0.5 rounded">images.json</code> to update the live website without altering component code.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyJson}
            className="shrink-0 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 rounded-xl border border-stone-600 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>Copy images.json</span>
          </button>
        </div>

        {/* SECTION 1: Product Slider Gallery (Drag & Drop Reordering) */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#9ED8A2] font-semibold">
                Interactive Slider Placements
              </span>
              <h2 className="text-xl font-serif font-bold text-white">
                Featured Product Slider Gallery ({siteImages.gallery.length} Images)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Drag and drop cards to reorder slides, replace with new photos, or edit slide labels and alt text.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddGalleryItem}
              className="px-3.5 py-2 bg-[#2D733E] hover:bg-[#388D4D] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Slide</span>
            </button>
          </div>

          {/* Gallery Drag & Drop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {siteImages.gallery.map((item, idx) => {
              const isBeingDragged = draggedIndex === idx;
              return (
                <div
                  key={item.id || idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-[#17221A] rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between cursor-move ${
                    isBeingDragged
                      ? 'border-[#9ED8A2] ring-2 ring-[#9ED8A2]/40 scale-102 bg-[#1F2E23]'
                      : 'border-[#2B3F30] hover:border-[#4B6B52]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header bar: Slide number & order buttons */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 bg-black/60 rounded-full font-bold text-[#9ED8A2] border border-[#3E5540]">
                        Slide #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveGallery(idx, 'up')}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 flex items-center justify-center"
                          title="Move earlier"
                        >
                          &larr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveGallery(idx, 'down')}
                          disabled={idx === siteImages.gallery.length - 1}
                          className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 flex items-center justify-center"
                          title="Move later"
                        >
                          &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryItem(idx)}
                          className="w-7 h-7 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 flex items-center justify-center ml-1"
                          title="Delete slide"
                        >
                          &times;
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Frame */}
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50 border border-stone-700 group">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                        <span>Click to Replace File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadGalleryItem(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Form Controls */}
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <label className="block text-stone-400 font-semibold mb-0.5">Label (Shown in slider)</label>
                        <input
                          type="text"
                          value={item.label || ''}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'label', e.target.value)}
                          placeholder="e.g. Fine Micro-Mist Spray"
                          className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-white focus:outline-none focus:border-[#9ED8A2]"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 font-semibold mb-0.5">Image Path</label>
                        <input
                          type="text"
                          value={item.src}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'src', e.target.value)}
                          placeholder="/lifestyle-X.jpg"
                          className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 font-semibold mb-0.5">Alt Description (SEO & A11y)</label>
                        <input
                          type="text"
                          value={item.alt}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'alt', e.target.value)}
                          placeholder="Describe the image..."
                          className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Drag Handle Hint */}
                  <div className="mt-3 pt-2 border-t border-[#233527] flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                      Drag card to reorder
                    </span>
                    <label className="text-[#9ED8A2] hover:underline cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadGalleryItem(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Core Website Section Images */}
        <section className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#9ED8A2] font-semibold">
              Global Sections
            </span>
            <h2 className="text-xl font-serif font-bold text-white">
              Core Website Images
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Images powering the Hero, How-To-Use section, Ingredients banner, and Official Brand Logo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Hero Bottle */}
            <div className="bg-[#17221A] rounded-2xl p-4 border border-[#2B3F30] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Hero Bottle</span>
                <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-[#1D2A1F] px-2 py-0.5 rounded">
                  Top Header
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50 border border-stone-700 group">
                <img
                  src={siteImages.hero.src}
                  alt={siteImages.hero.alt}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                  <span>Replace Hero Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('hero', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Path</label>
                  <input
                    type="text"
                    value={siteImages.hero.src}
                    onChange={(e) => handleUpdateCore('hero', 'src', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                  <input
                    type="text"
                    value={siteImages.hero.alt}
                    onChange={(e) => handleUpdateCore('hero', 'alt', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
              </div>
            </div>

            {/* 2. How To Use Image */}
            <div className="bg-[#17221A] rounded-2xl p-4 border border-[#2B3F30] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">How To Use</span>
                <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-[#1D2A1F] px-2 py-0.5 rounded">
                  Ritual
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50 border border-stone-700 group">
                <img
                  src={siteImages.howToUse.src}
                  alt={siteImages.howToUse.alt}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                  <span>Replace How-To Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('howToUse', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Path</label>
                  <input
                    type="text"
                    value={siteImages.howToUse.src}
                    onChange={(e) => handleUpdateCore('howToUse', 'src', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                  <input
                    type="text"
                    value={siteImages.howToUse.alt}
                    onChange={(e) => handleUpdateCore('howToUse', 'alt', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Ingredients Banner */}
            <div className="bg-[#17221A] rounded-2xl p-4 border border-[#2B3F30] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Ingredients Banner</span>
                <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-[#1D2A1F] px-2 py-0.5 rounded">
                  Raw Botanicals
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50 border border-stone-700 group">
                <img
                  src={siteImages.ingredients.src}
                  alt={siteImages.ingredients.alt}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                  <span>Replace Ingredients Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('ingredients', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Path</label>
                  <input
                    type="text"
                    value={siteImages.ingredients.src}
                    onChange={(e) => handleUpdateCore('ingredients', 'src', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                  <input
                    type="text"
                    value={siteImages.ingredients.alt}
                    onChange={(e) => handleUpdateCore('ingredients', 'alt', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Brand Logo */}
            <div className="bg-[#17221A] rounded-2xl p-4 border border-[#2B3F30] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Brand Logo</span>
                <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-[#1D2A1F] px-2 py-0.5 rounded">
                  Emblem
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/50 border border-stone-700 group flex items-center justify-center p-3">
                <img
                  src={siteImages.logo.src}
                  alt={siteImages.logo.alt}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                  <span>Replace Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('logo', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Path</label>
                  <input
                    type="text"
                    value={siteImages.logo.src}
                    onChange={(e) => handleUpdateCore('logo', 'src', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                  <input
                    type="text"
                    value={siteImages.logo.alt}
                    onChange={(e) => handleUpdateCore('logo', 'alt', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-[#2B3F30] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: Raw JSON Inspector (When toggled) */}
        {showJsonRaw && (
          <section className="bg-[#17221A] rounded-2xl p-6 border border-[#2B3F30] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Raw /public/images.json Payload</h3>
                <p className="text-xs text-stone-400">Direct representation of the image manifest.</p>
              </div>
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-[#9ED8A2] rounded-lg border border-stone-600"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="p-4 bg-black/60 rounded-xl text-[11px] text-stone-300 font-mono overflow-x-auto max-h-96 border border-[#233527]">
              {JSON.stringify(siteImages, null, 2)}
            </pre>
          </section>
        )}

      </main>
    </div>
  );
};

export default AdminImages;
