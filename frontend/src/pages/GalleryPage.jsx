import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useGallery } from '../hooks/useGallery';
import { getGallery } from '../api/gallery';

// Static project photos (CSS-gradient placeholders).
// These are always shown; uploaded images appear before them.
const STATIC_ITEMS = [
  { id: 's1', title: 'Main Entrance Gate',     category: 'Infrastructure', gradient: 'from-[#172544] to-[#B88A35]' },
  { id: 's2', title: 'Wide 30ft Roads',         category: 'Infrastructure', gradient: 'from-[#1a3a5c] to-[#2d6a4f]' },
  { id: 's3', title: 'Landscaped Park',         category: 'Amenities',      gradient: 'from-[#2d6a4f] to-[#52b788]' },
  { id: 's4', title: 'Community Clubhouse',     category: 'Amenities',      gradient: 'from-[#8B6520] to-[#D5B46B]' },
  { id: 's5', title: 'Plot Corner View',        category: 'Plots',          gradient: 'from-[#172544] to-[#3B82F6]' },
  { id: 's6', title: 'Swimming Pool',           category: 'Amenities',      gradient: 'from-[#1e3a5f] to-[#60a5fa]' },
  { id: 's7', title: 'Street Lighting',         category: 'Infrastructure', gradient: 'from-[#4a1942] to-[#B88A35]' },
  { id: 's8', title: 'Tree-Lined Avenue',       category: 'Green Spaces',   gradient: 'from-[#1b4332] to-[#95d5b2]' },
  { id: 's9', title: 'Security Cabin',          category: 'Infrastructure', gradient: 'from-[#264653] to-[#2a9d8f]' },
  { id: 's10', title: 'Overhead Water Tank',    category: 'Infrastructure', gradient: 'from-[#023e8a] to-[#90e0ef]' },
  { id: 's11', title: 'Gym Facility',           category: 'Amenities',      gradient: 'from-[#370617] to-[#e85d04]' },
  { id: 's12', title: "Children's Play Area",   category: 'Amenities',      gradient: 'from-[#6a0572] to-[#f72585]' },
];

function GalleryThumbnail({ item }) {
  if (item.dataUrl) {
    return (
      <img
        src={item.dataUrl}
        alt={item.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className={`h-48 bg-gradient-to-br ${item.gradient} flex items-end p-3`}>
      <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition">
        <p className="text-white text-xs font-medium">{item.title}</p>
      </div>
    </div>
  );
}

function LightboxContent({ item }) {
  if (item.dataUrl) {
    return (
      <img
        src={item.dataUrl}
        alt={item.title}
        className="w-full h-80 sm:h-96 object-contain rounded-2xl bg-black/20"
      />
    );
  }
  return <div className={`h-80 sm:h-96 rounded-2xl bg-gradient-to-br ${item.gradient}`} />;
}

export function GalleryPage() {
  useAnalytics('gallery');
  const { items: localItems } = useGallery();
  const [apiItems, setApiItems] = useState([]);

  useEffect(() => {
    getGallery()
      .then(({ items }) => {
        if (items?.length) {
          setApiItems(items.map((i) => ({ ...i, id: i._id, dataUrl: i.imageUrl })));
        }
      })
      .catch(() => { /* keep local items as fallback */ });
  }, []);

  // Prefer API items; fall back to local (localStorage) items if backend is unavailable
  const uploadedItems = apiItems.length > 0 ? apiItems : localItems;
  const allItems = [...uploadedItems, ...STATIC_ITEMS];
  const categories = ['All', ...new Set(allItems.map((i) => i.category))];

  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeCategory === 'All'
    ? allItems
    : allItems.filter((i) => i.category === activeCategory);

  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = useCallback(() => setLightboxIndex((i) => (i > 0 ? i - 1 : filtered.length - 1)), [filtered.length]);
  const nextItem = useCallback(() => setLightboxIndex((i) => (i < filtered.length - 1 ? i + 1 : 0)), [filtered.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prevItem();
      if (e.key === 'ArrowRight') nextItem();
      if (e.key === 'Escape')     closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, prevItem, nextItem]);

  // Touch swipe for lightbox
  const touchStartX = useRef(null);
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? nextItem() : prevItem(); }
    touchStartX.current = null;
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      <div className="bg-[#172544] text-white py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#D5B46B] text-sm font-semibold uppercase tracking-widest mb-2">Visual Tour</p>
          <h1 className="text-4xl font-bold mb-3">Project Gallery</h1>
          <p className="text-gray-400">A glimpse of Sri Lalitha Enclave</p>
          {uploadedItems.length > 0 && (
            <p className="text-[#B88A35] text-sm mt-2">
              {uploadedItems.length} photo{uploadedItems.length !== 1 ? 's' : ''} published by the team
            </p>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#B88A35] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B88A35]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Images size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 font-medium">No photos in this category yet.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setLightboxIndex(idx)}
                  className="cursor-pointer rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
                >
                  <GalleryThumbnail item={item} />
                  <div className="bg-white px-3 py-2">
                    <p className="text-xs font-medium text-[#172544] truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-[#D5B46B] transition z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={30} />
            </button>
            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#D5B46B] transition z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); prevItem(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={40} />
            </button>
            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#D5B46B] transition z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); nextItem(); }}
              aria-label="Next image"
            >
              <ChevronRight size={40} />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <LightboxContent item={filtered[lightboxIndex]} />
              <div className="text-center mt-4">
                <p className="text-white font-semibold text-lg">{filtered[lightboxIndex].title}</p>
                <p className="text-gray-400 text-sm">{filtered[lightboxIndex].category}</p>
                {filtered[lightboxIndex].caption && (
                  <p className="text-gray-500 text-sm mt-1 italic">{filtered[lightboxIndex].caption}</p>
                )}
                <p className="text-gray-600 text-xs mt-1">{lightboxIndex + 1} / {filtered.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
