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
    // Ensure products sub-object exists
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
      setAuthError('गलत पासवर्ड। सही एडमिन पासकोड दर्ज करें।');
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
      showNotification(`फोटो अपलोड हो गई! सेव करने के लिए नीचे 'परमानेंटली सेव करें' दबाएं।`, 'success');
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
      showNotification(`पैक फोटो अपलोड हो गई!`, 'success');
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
      showNotification(`स्लाइड ${index + 1} की नई फोटो लोड हो गई!`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleDeleteGalleryItem = (index: number) => {
    if (siteImages.gallery.length <= 1) {
      showNotification('कम से कम 1 स्लाइड का होना आवश्यक है।', 'error');
      return;
    }
    const item = siteImages.gallery[index];
    if (window.confirm(`क्या आप इस स्लाइड (${item.label || `स्लाइड ${index + 1}`}) को हटाना चाहते हैं?`)) {
      setSiteImages(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, idx) => idx !== index)
      }));
      showNotification('स्लाइड हटा दी गई।', 'info');
    }
  };

  const handleAddGalleryItem = () => {
    const newId = `lifestyle-custom-${Date.now().toString().slice(-4)}`;
    const newItem: GalleryImageItem = {
      id: newId,
      src: '/lifestyle-1.jpg',
      alt: 'New Lifestyle Presentation',
      label: `Lifestyle Slide ${siteImages.gallery.length + 1}`
    };
    setSiteImages(prev => ({
      ...prev,
      gallery: [...prev.gallery, newItem]
    }));
    showNotification('नई स्लाइड जोड़ दी गई है! आप इसमें अपनी फोटो अपलोड कर सकते हैं।', 'success');
  };

  // SAVE CHANGES PERMANENTLY
  const handleSaveAll = async () => {
    setIsSaving(true);
    const result = await saveImageRegistry(siteImages);
    setIsSaving(false);

    if (result.success) {
      onUpdateImages(siteImages);
      showNotification('✅ आपकी सभी तस्वीरें परमानेंटली सेव हो गई हैं! यह कभी पुरानी बेस पिक्चर पर वापस नहीं जाएंगी।', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  // Force sync from Vercel
  const handleForceSyncServer = async () => {
    if (window.confirm('क्या आप Vercel के images.json फ़ाइल से ताज़ा तस्वीरें लोड करना चाहते हैं?')) {
      const serverImgs = await fetchAuthoritativeImages(true);
      setSiteImages(serverImgs);
      onUpdateImages(serverImgs);
      showNotification('Vercel से नवीनतम images.json तस्वीरें सिंक कर ली गई हैं।', 'success');
    }
  };

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C120D] text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#162018] rounded-3xl p-8 border border-[#27382A] shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block mb-1">
              वेबसाइट ओनर / एडमिन पोर्टल
            </span>
            <h1 className="font-serif text-2xl font-bold text-white">Central Image Manager</h1>
            <p className="text-xs text-stone-400 mt-2">
              वेबसाइट की हर एक तस्वीर बदलने और परमानेंटली सेव करने के लिए लॉगिन करें।
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Admin Passcode (पासकोड)
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
              ओनर पोर्टल खोलें
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl transition-all"
            >
              Quick Unlock (1-क्लिक एक्सेस)
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onExit}
              className="text-xs text-stone-400 hover:text-white underline"
            >
              &larr; वापस वेबसाइट पर जाएं
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
                सेंट्रल इमेज मैनेजमेंट (कोई बेस पिक्चर नहीं - हर तस्वीर आपकी अपनी होगी)
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
              <span>{isSaving ? 'सेव हो रहा है...' : 'परमानेंटली सेव करें (Save Changes)'}</span>
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
              &larr; वापस स्टोर पर जाएं
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
            🌸 लाइफस्टाइल स्लाइडर ({siteImages.gallery.length} तस्वीरें)
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
            🌿 हीरो, इस्तेमाल और सामग्री (Hero, How-To, Ingredients, Logo)
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
            📦 प्रोडक्ट पैकेज तस्वीरें (Single, Duo, Trio)
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
            💡 वर्सेल गाइड (Vercel & GitHub Guide)
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
                  लाइफस्टाइल प्रॉडक्ट स्लाइडर तस्वीरें (Lifestyle Placements)
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  यहाँ आप किसी भी स्लाइड की तस्वीर बदल सकते हैं, नई तस्वीर अपलोड कर सकते हैं, ड्रैग करके आगे-पीछे कर सकते हैं।
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
                <span>+ नई स्लाइड जोड़ें</span>
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
                          स्लाइड #{idx + 1}
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
                          <span>नई फोटो अपलोड करें (Upload Photo)</span>
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
                            स्लाइड का नाम / लेबल (Slide Label)
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
                            तस्वीर का पाथ या वेब लिंक (Image Path or Link URL)
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
                            विवरण (Alt Text)
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
                      <span className="text-stone-400">ड्रैग करके क्रम बदलें</span>
                      <label className="px-2.5 py-1 bg-[#2E7D46]/80 hover:bg-[#2E7D46] text-white rounded-md cursor-pointer font-medium transition-all">
                        अपलोड करें
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
                वेबसाइट के मुख्य सेक्शन्स की तस्वीरें (Core Website Images)
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                हीरो बॉटल, हाउ-टू-यूज रूटीन, इंग्रीडिएंट्स बैनर और ऑफिशियल लोगो — आप इनमें से किसी भी तस्वीर को अपनी मनचाही तस्वीर से बदल सकते हैं।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 1. Hero Bottle */}
              <div className="bg-[#152017] rounded-2xl p-4 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">1. हीरो बॉटल (Hero)</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    हेडर सेशल
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
                    <span>हीरो फोटो बदलें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">पाथ या लिंक (URL)</label>
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
                  कंप्यूटर/फ़ोन से अपलोड करें
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
                  <span className="font-bold text-white">2. हाउ-टू-यूज (How To Use)</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    रूटीन
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
                    <span>रूटीन फोटो बदलें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">पाथ या लिंक (URL)</label>
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
                  कंप्यूटर/फ़ोन से अपलोड करें
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
                  <span className="font-bold text-white">3. सामग्री बैनर (Ingredients)</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    बैनर
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
                    <span>बैनर फोटो बदलें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">पाथ या लिंक (URL)</label>
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
                  कंप्यूटर/फ़ोन से अपलोड करें
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
                  <span className="font-bold text-white">4. ऑफिशियल लोगो (Logo)</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9ED8A2] bg-black/40 px-2 py-0.5 rounded">
                    लोगो
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
                    <span>लोगो बदलें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">पाथ या लिंक (URL)</label>
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
                  कंप्यूटर/फ़ोन से अपलोड करें
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
                प्रोडक्ट पैकेज की तस्वीरें (Product Packages: Single, Duo, Trio)
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                अगर आप 1 बोतल (Rs. 700), 2 बोतल (Rs. 1,300), या 3 बोतल (Rs. 1,950) कोर्स के लिए अलग-अलग कस्टम तस्वीरें लगाना चाहती हैं तो यहाँ से सेट करें।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Single Bottle Pack */}
              <div className="bg-[#152017] rounded-2xl p-5 border border-[#283C2A] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">1 बोतल (Single 250ml Bottle)</span>
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
                    <span>फोटो अपलोड करें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">फोटो का लिंक या पाथ</label>
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
                  फ़ोन / कंप्यूटर से अपलोड करें
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
                  <span className="font-bold text-white">2 बोतल (Duo Pack 2x250ml)</span>
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
                    <span>Duo फोटो अपलोड करें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">फोटो का लिंक या पाथ</label>
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
                  फ़ोन / कंप्यूटर से अपलोड करें
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
                  <span className="font-bold text-white">3 बोतल (Trio Course 3x250ml)</span>
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
                    <span>Trio फोटो अपलोड करें</span>
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
                    <label className="block text-stone-400 font-semibold mb-0.5">फोटो का लिंक या पाथ</label>
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
                  फ़ोन / कंप्यूटर से अपलोड करें
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

        {/* TAB 4: Vercel & GitHub Guide */}
        {activeTab === 'guide' && (
          <section className="bg-[#141F16] rounded-3xl p-6 sm:p-8 border border-[#253A28] space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#9ED8A2] font-bold block mb-1">
                ओनर निर्देश (Owner Guide)
              </span>
              <h2 className="text-xl font-serif font-bold text-white">
                Vercel पर तस्वीरों को परमानेंटली लाइव रखने का सबसे आसान तरीका
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
              <div className="bg-[#1B291D] p-5 rounded-2xl border border-[#2B402F] space-y-3">
                <h3 className="font-bold text-sm text-[#9ED8A2] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2E7D46] text-white flex items-center justify-center font-mono">1</span>
                  तरीका 1: इस पैनल से सीधे बदलें (Direct Live Update)
                </h3>
                <p className="leading-relaxed">
                  आप अपने फ़ोन या लैपटॉप से सीधे इस पैनल में कोई भी तस्वीर अपलोड करें या इंटरनेट लिंक पेस्ट करें और <strong>"परमानेंटली सेव करें"</strong> पर क्लिक करें।
                </p>
                <p className="leading-relaxed text-[#9ED8A2]">
                  यह आपके ब्राउज़र में हमेशा के लिए लॉक हो जाएगा और कभी किसी पुरानी बेस पिक्चर पर वापस नहीं जाएगा।
                </p>
              </div>

              <div className="bg-[#1B291D] p-5 rounded-2xl border border-[#2B402F] space-y-3">
                <h3 className="font-bold text-sm text-[#9ED8A2] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2E7D46] text-white flex items-center justify-center font-mono">2</span>
                  तरीका 2: Vercel / GitHub पर सभी के लिए हमेशा लाइव रखना
                </h3>
                <p className="leading-relaxed">
                  जब आप यहाँ अपनी मनपसंद तस्वीरें सेट कर लें, तो ऊपर <strong>"Download images.json for Vercel"</strong> बटन दबाएं।
                </p>
                <p className="leading-relaxed">
                  यह डाउनलोड की हुई <code>images.json</code> फ़ाइल को अपने GitHub रिपॉजिटरी के <code>public/images.json</code> में रिप्लेस (अपलोड) कर दें।
                </p>
                <p className="leading-relaxed text-[#9ED8A2]">
                  Vercel 10 सेकंड में पूरी दुनिया और आपके सभी ग्राहकों के लिए नई तस्वीरें लाइव कर देगा! आपको कोई कोड बदलने की जरूरत नहीं है।
                </p>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                वर्तमान JSON फ़ाइल की एक कॉपी अपने क्लिपबोर्ड में कॉपी करें:
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(siteImages, null, 2));
                  showNotification('images.json कॉपी हो गया!', 'success');
                }}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-[#9ED8A2] rounded-lg text-xs font-semibold"
              >
                Copy JSON
              </button>
            </div>
          </section>
        )}

        {/* Global Save Button at bottom of page as well */}
        <div className="pt-6 border-t border-[#233526] flex items-center justify-between">
          <span className="text-xs text-stone-400">
            याद रखें: कोई भी पिक्चर बदलने के बाद "परमानेंटली सेव करें" दबाना न भूलें।
          </span>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-3 bg-[#2E7D46] hover:bg-[#389755] text-white text-sm font-bold rounded-xl shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{isSaving ? 'सेव हो रहा है...' : 'परमानेंटली सेव करें (Save Changes)'}</span>
          </button>
        </div>

      </main>
    </div>
  );
};

export default AdminImages;
