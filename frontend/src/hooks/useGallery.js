/**
 * useGallery — shared gallery data source backed by localStorage.
 *
 * Each component (GalleryPage, HomePage preview, AdminPage) calls this hook
 * independently; each seeds its own state from localStorage on mount and
 * stays current during the session.  Cross-page changes become visible on
 * navigation (next mount), which is correct for a localStorage-only setup.
 *
 * Storage note: images are canvas-compressed to ≤800 px before being stored
 * as JPEG dataURLs.  This is device-local — uploads do not survive a fresh
 * deployment or a different browser.  For production persistence, replace
 * this hook with Firebase Storage + Firestore (see GALLERY_STORAGE.md).
 */

import { useState, useCallback } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';

/** Compress & resize an image File to a JPEG dataURL ≤ maxPx on longest side. */
export function compressImage(file, maxPx = 800, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function useGallery() {
  const [items, setItems] = useState(() => getItem(KEYS.GALLERY, []));

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const next = [item, ...prev];
      setItem(KEYS.GALLERY, next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      setItem(KEYS.GALLERY, next);
      return next;
    });
  }, []);

  return { items, addItem, removeItem };
}
