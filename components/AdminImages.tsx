import React, { useState } from 'react';
import { SiteImages, GalleryImageItem, ImageItem } from '../types';
import {
  saveImageRegistry,
  uploadImageFile,
  downloadImagesJson,
  fetchAuthoritativeImages,
  fallbackDefaultImages
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

  // Local editable draft of site images
  const [siteImages, setSiteImages] = useState<SiteImages>(() => {
    return {
      ...initialImages,
      products: initialImages.products || {
        single: { src: initialImages.hero.src, alt: "Single 250ml Spray Bottle", title: "Single Bottle (250ml)" },
        duo: { src: initialImages.hero.src, alt: "Duo Pack 2x250ml", title: "Duo Course (2x250ml)" },
        trio: { src: initialImages.hero.src, alt: "Trio Pack 3x250ml", title: "Trio Course (3x250ml)" }
      }
    };
  });

  const [activeTab, setActiveTab] = useState<'gallery' | 'core' | 'products' | 'guide'>('gallery');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSCODE) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Please enter the valid admin passcode.');
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
    }, 5000);
  };

  // Update Core Images
  const handleUpdateCore = (key: 'hero' | 'howToUse' | 'ingredients' | 'logo', field: keyof ImageItem, value: string) => {
    setSiteImages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Upload Core Image
  const handleUploadCore = async (key: 'hero' | 'howToUse' | 'ingredients' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImageFile(file, `${key}-${Date.now()}.${file.name.split('.').pop()}`);
    if (res.success) {
      handleUpdateCore(key, 'src', res.url);
      showNotification(`Image uploaded! Click "Save Changes Permanently" to lock it into your site.`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  // Update Product Pack Images
  const handleUpdateProductPack = (pack: 'single' | 'duo' | 'trio', field: keyof ImageItem, value: string) => {
    setSiteImages(prev => ({
      ...prev,
      products: {
        ...(prev.products || fallbackDefaultImages.products!),
        [pack]: {
          ...(prev.products?.[pack] || { src: '', alt: '' }),
          [field]: value
        }
      }
    }));
  };

  // Upload Product Pack Image
  const handleUploadProductPack = async (pack: 'single' | 'duo' | 'trio', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImageFile(file, `pack-${pack}-${Date.now()}.${file.name.split('.').pop()}`);
    if (res.success) {
      handleUpdateProductPack(pack, 'src', res.url);
      showNotification(`Product pack photo uploaded!`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  // Gallery Drag & Drop Reordering
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

  const handleMoveGallery = (index: number, direction: 'up' | 'down') => {
    const newGallery = [...siteImages.gallery];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newGallery.length) return;

    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;
    setSiteImages(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleUpdateGalleryItem = (index: number, field: keyof GalleryImageItem, value: string) => {
    setSiteImages(prev => {
      const updated = [...prev.gallery];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, gallery: updated };
    });
  };

  const handleUploadGalleryItem = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImageFile(file, `lifestyle-${index + 1}-${Date.now()}.${file.name.split('.').pop()}`);
    if (res.success) {
      handleUpdateGalleryItem(index, 'src', res.url);
      showNotification(`Slide ${index + 1} photo loaded!`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleDeleteGalleryItem = (index: number) => {
    if (siteImages.gallery.length <= 1) {
      showNotification('At least 1 slide is required in the slider.', 'error');
      return;
    }
    const item = siteImages.gallery[index];
    if (window.confirm(`Are you sure you want to remove "${item.label || `Slide ${index + 1}`}" from the slider?`)) {
      setSiteImages(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, idx) => idx !== index)
      }));
      showNotification('Slide removed from gallery.', 'info');
    }
  };

  const handleAddGalleryItem = () => {
    const newId = `lifestyle-custom-${Date.now().toString().slice(-4)}`;
    const newItem: GalleryImageItem = {
      id: newId,
      src: '/lifestyle-1.jpg',
      alt: 'New Lifestyle Placement',
      label: `Lifestyle Slide ${siteImages.gallery.length + 1}`
    };
    setSiteImages(prev => ({
      ...prev,
      gallery: [...prev.gallery, newItem]
    }));
    showNotification('New slide added to gallery! You can now upload your custom image.', 'success');
  };

  // SAVE CHANGES PERMANENTLY
  const handleSaveAll = async () => {
    setIsSaving(true);
    const result = await saveImageRegistry(siteImages);
    setIsSaving(false);

    if (result.success) {
      onUpdateImages(siteImages);
      showNotification('All images saved permanently! Changes will never revert to an old base picture.', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  // Force sync from Vercel / server
  const handleForceSyncServer = async () => {
    if (window.confirm('Do you want to reload the latest images.json from Vercel / server?')) {
      const serverImgs = await fetchAuthoritativeImages(true);
      setSiteImages(serverImgs);
      onUpdateImages(serverImgs);
      showNotification('Refreshed images from server images.json.', 'success');
    }
  };

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C120D] text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#162018] rounded-3xl p-8 border border-[#27382A] shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block mb-1">
              Store Owner & Admin Portal
            </span>
            <h1 className="font-serif text-2xl font-bold text-white">Central Image Manager</h1>
            <p className="text-xs text-stone-400 mt-2">
              Sign in to manage all website images and permanently customize product placements.
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
                className="w-full px-4 py-2.5 bg-black/50 border border-stone-600 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#D4AF37]"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#1D4A2B] hover:bg-[#256138] text-[#D4AF37] font-bold rounded-xl border border-[#D4AF37]/40 shadow-lg transition-all"
            >
              Open Owner Portal
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl transition-all"
            >
              Quick Unlock (1-Click Session)
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
    <div className="min-h-screen bg-[#0C120D] text-stone-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#141E15]/95 backdrop-blur-md border-b border-[#253828] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2B1E] border border-[#3E5C42] flex items-center justify-center text-[#9ED8A2]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#9ED8A2] font-bold">
                NR AURA BOTANICS · ADMIN IMAGE CONTROLLER
              </span>
              <h1 className="text-base sm:text-lg font-serif font-bold text-white">
                Central Image Management (Zero Base Images — All Custom & Permanent)
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2.5 bg-[#2E7D46] hover:bg-[#389755] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 ring-2 ring-[#4CAF50]/30"
              title="Save changes permanently in browser and disk"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{isSaving ? 'Saving...' : 'Save Changes Permanently'}</span>
            </button>

            <button
              type="button"
              onClick={() => downloadImagesJson(siteImages)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-[#9ED8A2] text-xs font-semibold rounded-xl border border-[#3E5C42] transition-all flex items-center gap-1.5"
              title="Download images.json to commit to GitHub"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download images.json for Vercel</span>
            </button>

            <button
              type="button"
              onClick={handleForceSyncServer}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl border border-stone-700 transition-all"
              title="Sync latest from Vercel"
            >
              Sync from Vercel
            </button>

            <button
              type="button"
              onClick={onExit}
              className="px-3.5 py-2 bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold rounded-xl transition-all"
            >
              &larr; Return to Store
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 border-t border-[#233526] pt-2 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-[#2E7D46] text-white shadow-xs'
                : 'text-stone-400 hover:text-white bg-stone-800/60'
            }`}
          >
            🌸 Lifestyle Slider ({siteImages.gallery.length} Images)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'core'
                ? 'bg-[#2E7D46] text-white shadow-xs'
                : 'text-stone-400 hover:text-white bg-stone-800/60'
            }`}
          >
            🌿 Core Sections (Hero, How-To, Ingredients, Logo)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#2E7D46] text-white shadow-xs'
                : 'text-stone-400 hover:text-white bg-stone-800/60'
            }`}
          >
            📦 Product Packages (Single, Duo, Trio)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeTab === 'guide'
                ? 'bg-[#2E7D46] text-white shadow-xs'
                : 'text-stone-400 hover:text-white bg-stone-800/60'
            }`}
          >
            💡 Vercel & GitHub Guide
          </button>
        </div>
      </header>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs sm:text-sm font-medium transition-all max-w-md ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/20'
            : statusMessage.type === 'error'
            ? 'bg-rose-950/95 border-rose-500 text-rose-100'
            : 'bg-blue-950/95 border-blue-500 text-blue-100'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* TAB 1: Lifestyle Carousel Slider */}
        {activeTab === 'gallery' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141F16] p-4 rounded-2xl border border-[#253A28]">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                  Featured Product Slider Placements
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  Replace any slide image, upload new photos from your phone/computer, reorder slides using drag-and-drop, or customize slide labels.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddGalleryItem}
                className="px-3.5 py-2 bg-[#2E7D46] hover:bg-[#389755] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Add New Slide</span>
              </button>
            </div>

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
                    className={`bg-[#152017] rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between cursor-move ${
                      isBeingDragged
                        ? 'border-[#9ED8A2] ring-2 ring-[#9ED8A2]/40 scale-102 bg-[#1E2E20]'
                        : 'border-[#283C2A] hover:border-[#4B6B52]'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Slide Number & Move Controls */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-1 bg-black/60 rounded-full font-bold text-[#9ED8A2] border border-[#3E5C42]">
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
                            title="Delete this slide"
                          >
                            &times;
                          </button>
                        </div>
                      </div>

                      {/* Image Preview with direct upload overlay */}
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-full object-cover object-center"
                          referrerPolicy="no-referrer"
                        />
                        <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                          <span>Upload New Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadGalleryItem(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Form Fields: URL or File */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-stone-400 font-semibold mb-0.5">
                            Slide Label (Shown in slider)
                          </label>
                          <input
                            type="text"
                            value={item.label || ''}
                            onChange={(e) => handleUpdateGalleryItem(idx, 'label', e.target.value)}
                            placeholder="e.g. Fine Micro-Mist Spray"
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-white focus:outline-none focus:border-[#9ED8A2]"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-0.5">
                            Image Path or Web Link URL
                          </label>
                          <input
                            type="text"
                            value={item.src}
                            onChange={(e) => handleUpdateGalleryItem(idx, 'src', e.target.value)}
                            placeholder="/lifestyle-1.jpg or https://..."
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-0.5">
                            Alt Description (SEO & Accessibility)
                          </label>
                          <input
                            type="text"
                            value={item.alt}
                            onChange={(e) => handleUpdateGalleryItem(idx, 'alt', e.target.value)}
                            placeholder="Describe image..."
                            className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-3 pt-2 border-t border-[#233526] flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">Drag card to reorder</span>
                      <label className="px-2.5 py-1 bg-[#2E7D46]/80 hover:bg-[#2E7D46] text-white rounded-md cursor-pointer font-medium transition-all">
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
        )}

        {/* TAB 2: Core Website Images */}
        {activeTab === 'core' && (
          <section className="space-y-4">
            <div className="bg-[#141F16] p-4 rounded-2xl border border-[#253A28]">
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Core Website Section Images
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                Customize key imagery powering the Hero header, How-To-Use routine, Botanical Ingredients banner, and Official Brand Logo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 1. Hero Bottle */}
              <div className="bg-[#152017] rounded-2xl p-4 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">1. Hero Bottle</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    Header
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                  <img
                    src={siteImages.hero.src}
                    alt={siteImages.hero.alt}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                    <span>Replace Hero Photo</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.hero.src}
                      onChange={(e) => handleUpdateCore('hero', 'src', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                    <input
                      type="text"
                      value={siteImages.hero.alt}
                      onChange={(e) => handleUpdateCore('hero', 'alt', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('hero', e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 2. How To Use */}
              <div className="bg-[#152017] rounded-2xl p-4 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">2. How To Use Routine</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    Ritual
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                  <img
                    src={siteImages.howToUse.src}
                    alt={siteImages.howToUse.alt}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                    <span>Replace Routine Photo</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.howToUse.src}
                      onChange={(e) => handleUpdateCore('howToUse', 'src', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                    <input
                      type="text"
                      value={siteImages.howToUse.alt}
                      onChange={(e) => handleUpdateCore('howToUse', 'alt', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('howToUse', e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 3. Ingredients Banner */}
              <div className="bg-[#152017] rounded-2xl p-4 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">3. Ingredients Banner</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    Botanicals
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                  <img
                    src={siteImages.ingredients.src}
                    alt={siteImages.ingredients.alt}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                    <span>Replace Banner Photo</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.ingredients.src}
                      onChange={(e) => handleUpdateCore('ingredients', 'src', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                    <input
                      type="text"
                      value={siteImages.ingredients.alt}
                      onChange={(e) => handleUpdateCore('ingredients', 'alt', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('ingredients', e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 4. Brand Official Logo */}
              <div className="bg-[#152017] rounded-2xl p-4 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">4. Official Logo</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    Emblem
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group flex items-center justify-center p-3">
                  <img
                    src={siteImages.logo.src}
                    alt={siteImages.logo.alt}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
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
                    <label className="block text-stone-400 font-semibold mb-0.5">Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.logo.src}
                      onChange={(e) => handleUpdateCore('logo', 'src', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Alt Text</label>
                    <input
                      type="text"
                      value={siteImages.logo.alt}
                      onChange={(e) => handleUpdateCore('logo', 'alt', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCore('logo', e)}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </section>
        )}

        {/* TAB 3: Product Package Images */}
        {activeTab === 'products' && (
          <section className="space-y-4">
            <div className="bg-[#141F16] p-4 rounded-2xl border border-[#253A28]">
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Product Package Images (Single, Duo, Trio)
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                Customize separate dedicated pack images for 1 bottle (Rs. 700), 2 bottles (Rs. 1,300), or 3 bottles (Rs. 1,950).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Single Bottle Pack */}
              <div className="bg-[#152017] rounded-2xl p-5 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Single 250ml Spray Bottle</span>
                  <span className="text-[#9ED8A2] font-semibold">Rs. 700/-</span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                  <img
                    src={siteImages.products?.single?.src || siteImages.hero.src}
                    alt={siteImages.products?.single?.alt || "Single Bottle"}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadProductPack('single', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Image Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.products?.single?.src || ''}
                      onChange={(e) => handleUpdateProductPack('single', 'src', e.target.value)}
                      placeholder="/lifestyle-1.jpg or https://..."
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadProductPack('single', e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Duo Pack */}
              <div className="bg-[#152017] rounded-2xl p-5 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Duo Pack (2x 250ml)</span>
                  <span className="text-[#9ED8A2] font-semibold">Rs. 1,300/-</span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                  <img
                    src={siteImages.products?.duo?.src || siteImages.hero.src}
                    alt={siteImages.products?.duo?.alt || "Duo Pack"}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                    <span>Upload Duo Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadProductPack('duo', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Image Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.products?.duo?.src || ''}
                      onChange={(e) => handleUpdateProductPack('duo', 'src', e.target.value)}
                      placeholder="/lifestyle-2.jpg or https://..."
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadProductPack('duo', e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Trio Pack */}
              <div className="bg-[#152017] rounded-2xl p-5 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Trio Course (3x 250ml)</span>
                  <span className="text-[#9ED8A2] font-semibold">Rs. 1,950/-</span>
                </div>

                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black/60 border border-stone-700 group">
                  <img
                    src={siteImages.products?.trio?.src || siteImages.hero.src}
                    alt={siteImages.products?.trio?.alt || "Trio Pack"}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-opacity">
                    <span>Upload Trio Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadProductPack('trio', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-0.5">Image Path or URL</label>
                    <input
                      type="text"
                      value={siteImages.products?.trio?.src || ''}
                      onChange={(e) => handleUpdateProductPack('trio', 'src', e.target.value)}
                      placeholder="/lifestyle-3.jpg or https://..."
                      className="w-full px-2.5 py-1.5 bg-black/40 border border-[#283C2A] rounded-lg text-stone-200 font-mono text-[11px] focus:outline-none focus:border-[#9ED8A2]"
                    />
                  </div>
                </div>

                <label className="block w-full text-center py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadProductPack('trio', e)}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </section>
        )}

        {/* TAB 4: Owner Guide for Vercel & GitHub */}
        {activeTab === 'guide' && (
          <section className="bg-[#141F16] rounded-2xl p-6 border border-[#253A28] space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#9ED8A2] font-semibold">
                Owner Instructions
              </span>
              <h2 className="text-lg font-serif font-bold text-white mt-1">
                How to Keep Images Permanently Live on Vercel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
              <div className="p-4 rounded-xl bg-black/40 border border-[#283C2A] space-y-2">
                <span className="font-bold text-[#9ED8A2] text-sm block">
                  Method 1: Direct Live Updates from This Panel
                </span>
                <p className="leading-relaxed">
                  Upload any photo from your phone/laptop or paste any image URL into this portal, then click <strong>"Save Changes Permanently"</strong>.
                </p>
                <p className="leading-relaxed text-stone-400">
                  Your customized images are locked in your browser and will never revert to an old base picture.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-[#283C2A] space-y-2">
                <span className="font-bold text-[#9ED8A2] text-sm block">
                  Method 2: Permanent Live Deployment for All Vercel Customers
                </span>
                <p className="leading-relaxed">
                  After customizing your pictures here, click <strong>"Download images.json for Vercel"</strong> in the top bar.
                </p>
                <p className="leading-relaxed">
                  Upload that <code>images.json</code> file to replace <code>public/images.json</code> in your GitHub repository.
                </p>
                <p className="leading-relaxed text-[#9ED8A2]">
                  Vercel will auto-deploy within 10 seconds for all visitors worldwide without touching a single line of code!
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#233526]">
              <span className="text-xs font-semibold text-stone-300 block mb-2">
                Copy current JSON payload to clipboard:
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(siteImages, null, 2));
                  showNotification('images.json copied to clipboard!', 'success');
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-[#9ED8A2] font-semibold text-xs rounded-xl border border-stone-600 transition-all"
              >
                Copy images.json Content
              </button>
            </div>
          </section>
        )}

        {/* Global Save Button at bottom */}
        <div className="p-4 bg-[#141F16] rounded-2xl border border-[#253A28] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-300">
            Remember: Click <strong>"Save Changes Permanently"</strong> after updating any image to lock it into your site.
          </span>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-[#2E7D46] hover:bg-[#389755] text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{isSaving ? 'Saving...' : 'Save Changes Permanently'}</span>
          </button>
        </div>

      </main>
    </div>
  );
};

export default AdminImages;
