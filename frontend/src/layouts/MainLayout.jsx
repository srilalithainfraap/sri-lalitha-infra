import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BrandLoader } from '../components/BrandLoader';

// Module-level flag: true on every full page reload, stays false through SPA navigation
let _sliFirstLoad = true;

export function MainLayout({ children }) {
  const [loading, setLoading] = useState(() => _sliFirstLoad);

  useEffect(() => {
    if (!loading) return;
    // Mark as shown so SPA nav never triggers loader again this session
    _sliFirstLoad = false;

    const dismiss = () => setLoading(false);

    if (document.readyState === 'complete') {
      // Resources already loaded — dismiss after two frames so the loader is visible
      let raf = requestAnimationFrame(() => { raf = requestAnimationFrame(dismiss); });
      return () => cancelAnimationFrame(raf);
    }

    // Wait for the real window load event (CSS, fonts, non-lazy images)
    window.addEventListener('load', dismiss, { once: true });
    // Safety fallback — never leave the user stuck behind the loader
    const fallback = setTimeout(dismiss, 3000);
    return () => {
      window.removeEventListener('load', dismiss);
      clearTimeout(fallback);
    };
  }, [loading]);

  if (loading) return <BrandLoader />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
