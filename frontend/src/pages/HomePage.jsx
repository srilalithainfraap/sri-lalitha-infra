import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  MapPin, Award, Users, Shield, Leaf, Zap, ChevronRight, MessageCircle,
  Navigation, Search, FileText, CalendarCheck, Images,
} from 'lucide-react';
import { HeroScrollExperience } from '../components/HeroScrollExperience';
import { config } from '../data/config';
import { getItem, setItem, KEYS } from '../utils/storage';
import plotsData from '../data/plots';
import { useAnalytics } from '../hooks/useAnalytics';
import { useGallery } from '../hooks/useGallery';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

// Static gallery fallbacks (same order as GalleryPage static list)
const STATIC_GALLERY = [
  { id: 's1', title: 'Main Entrance Gate',   gradient: 'from-[#172544] to-[#B88A35]' },
  { id: 's2', title: 'Wide 30ft Roads',       gradient: 'from-[#1a3a5c] to-[#2d6a4f]' },
  { id: 's3', title: 'Landscaped Park',       gradient: 'from-[#2d6a4f] to-[#52b788]' },
  { id: 's4', title: 'Community Clubhouse',   gradient: 'from-[#8B6520] to-[#D5B46B]' },
  { id: 's5', title: 'Plot Corner View',      gradient: 'from-[#172544] to-[#3B82F6]' },
  { id: 's6', title: 'Swimming Pool',         gradient: 'from-[#1e3a5f] to-[#60a5fa]' },
];

export function HomePage() {
  useAnalytics('home');
  const { items: uploadedGallery } = useGallery();

  const plots = (() => {
    const stored = getItem(KEYS.PLOTS, null);
    if (!stored) { setItem(KEYS.PLOTS, plotsData); return plotsData; }
    return stored;
  })();

  // Gallery preview: up to 6 images — uploaded first, then static fallbacks
  const previewItems = [...uploadedGallery, ...STATIC_GALLERY].slice(0, 6);

  const availableCount  = plots.filter((p) => p.status === 'available').length;
  const reservedCount   = plots.filter((p) => p.status === 'reserved').length;
  const soldCount       = plots.filter((p) => p.status === 'sold').length;

  // ── Amenities horizontal auto-scroll ───────────────────────────────────────
  const amenitiesRef    = useRef(null);
  const amenitiesTrack  = useRef(null);
  const amenPaused      = useRef(false);
  const amenInView      = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const section = amenitiesRef.current;
    const track   = amenitiesTrack.current;
    if (!section || !track) return;

    let offset = 0;
    let rafId  = null;

    const tick = () => {
      if (amenInView.current && !amenPaused.current) {
        offset += 0.6;
        const half = track.scrollWidth / 2;
        if (half > 0 && offset >= half) offset -= half;
        track.style.transform = `translateX(-${offset}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([e]) => { amenInView.current = e.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(section);
    rafId = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);
  // ── end amenities scroll ───────────────────────────────────────────────────

  return (
    <div className="bg-[#F8F6F0]">

      {/* ══════════════ CINEMATIC SCROLL HERO ════════════════════════════ */}
      <HeroScrollExperience />

      {/* ── A. Project Overview ─────────────────────────────────────────── */}
      <section id="project-overview" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-[#B88A35] font-semibold text-sm uppercase tracking-widest mb-2">Featured Project</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#172544]">{config.project.name}</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              A thoughtfully planned layout with wide roads, lush green spaces, and modern infrastructure
              in {config.project.location}.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Project stats */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { icon: MapPin,  label: 'Location',    value: config.project.location },
                { icon: Award,   label: 'Total Area',  value: config.project.totalArea },
                { icon: Users,   label: 'Total Plots', value: `${config.project.totalPlots} Plots` },
                { icon: Shield,  label: 'Road Width',  value: config.project.roadWidth },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-[#B88A35]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-[#B88A35]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-semibold text-[#172544]">{item.value}</p>
                  </div>
                </div>
              ))}
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-[#B88A35] font-semibold hover:gap-3 transition-all"
              >
                View Full Project Details <ChevronRight size={18} />
              </Link>
            </motion.div>

            {/* Live plot availability */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-[#172544] rounded-2xl p-8 text-white"
            >
              <h3 className="text-xl font-bold mb-6 text-[#D5B46B]">Plot Availability</h3>
              {[
                { status: 'available', label: 'Available', count: availableCount,  color: '#B88A35' },
                { status: 'reserved',  label: 'Reserved',  count: reservedCount,   color: '#3B82F6' },
                { status: 'sold',      label: 'Sold',      count: soldCount,        color: '#6B7280' },
              ].map((s) => {
                const pct = plots.length > 0 ? Math.round((s.count / plots.length) * 100) : 0;
                return (
                  <div key={s.status} className="mb-5">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">{s.label}</span>
                      <span className="font-medium">{s.count} plots ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
              <Link
                to="/explore-plots"
                className="w-full mt-4 bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold py-3 rounded-xl text-center block transition"
              >
                Explore Available Plots
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── B. Why Choose Sri Lalitha Infra ─────────────────────────────── */}
      <section id="why-choose" className="py-20 bg-[#172544] px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-[#D5B46B] font-semibold text-sm uppercase tracking-widest mb-2">Our Promise</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Why Choose Sri Lalitha Infra</h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Shield, title: 'RERA Compliant',       desc: 'All projects registered with RERA for complete transparency and legal compliance.' },
              { icon: Award,  title: '15+ Years Trust',      desc: 'Over a decade and a half of delivering quality plots to satisfied families.' },
              { icon: Leaf,   title: 'Green Spaces',         desc: 'Dedicated parks, walking tracks, and tree-lined roads for a healthy lifestyle.' },
              { icon: Zap,    title: 'Ready Infrastructure', desc: 'Electricity, water, roads, and drainage ready from day one of possession.' },
            ].map((item, i) => (
              <motion.div
                key={i} variants={fadeUp} whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#B88A35]/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#B88A35]/20 flex items-center justify-center mb-4">
                  <item.icon size={24} className="text-[#D5B46B]" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── C. Amenities ────────────────────────────────────────────────── */}
      <section id="amenities" ref={amenitiesRef} className="py-20 bg-[#F8F6F0] px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-[#B88A35] font-semibold text-sm uppercase tracking-widest mb-2">World-Class</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#172544]">Premium Amenities</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Every essential facility thoughtfully included so your family thrives from day one.
            </p>
          </motion.div>

          {/* Horizontal auto-scroll carousel — pauses on hover/touch/focus */}
          <div
            className="overflow-hidden -mx-4"
            onMouseEnter={() => { amenPaused.current = true; }}
            onMouseLeave={() => { amenPaused.current = false; }}
            onTouchStart={() => { amenPaused.current = true; }}
            onTouchEnd={() => { amenPaused.current = false; }}
            onFocus={() => { amenPaused.current = true; }}
            onBlur={() => { amenPaused.current = false; }}
          >
            <div
              ref={amenitiesTrack}
              style={{ display: 'flex', gap: '16px', width: 'max-content', paddingLeft: '16px', paddingRight: '16px' }}
            >
              {[
                { emoji: '🏊', label: 'Swimming Pool' },
                { emoji: '🏋️', label: 'Gym & Fitness' },
                { emoji: '🌳', label: 'Landscaped Park' },
                { emoji: '🔒', label: '24/7 Security' },
                { emoji: '⛺', label: 'Clubhouse' },
                { emoji: '🌐', label: 'WiFi Zone' },
                { emoji: '🏊', label: 'Swimming Pool' },
                { emoji: '🏋️', label: 'Gym & Fitness' },
                { emoji: '🌳', label: 'Landscaped Park' },
                { emoji: '🔒', label: '24/7 Security' },
                { emoji: '⛺', label: 'Clubhouse' },
                { emoji: '🌐', label: 'WiFi Zone' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ width: '148px', flexShrink: 0 }}
                  className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:border-[#B88A35]/40 transition"
                >
                  <p className="text-3xl mb-2">{item.emoji}</p>
                  <p className="text-xs font-medium text-[#172544]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/amenities"
              className="inline-flex items-center gap-2 border-2 border-[#B88A35] text-[#B88A35] px-6 py-3 rounded-xl font-semibold hover:bg-[#B88A35] hover:text-white transition"
            >
              View All Amenities <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── E. Gallery Preview ──────────────────────────────────────────── */}
      <section id="gallery" className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <p className="text-[#B88A35] font-semibold text-sm uppercase tracking-widest mb-2">Visual Tour</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#172544]">See the Project</h2>
              <p className="text-gray-500 mt-2 max-w-md">
                A look at the spaces, roads, and green areas that make Sri Lalitha Enclave special.
              </p>
            </div>
            <Link
              to="/gallery"
              className="flex-shrink-0 flex items-center gap-2 bg-[#172544] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#101B35] transition"
            >
              <Images size={16} /> View All Photos
            </Link>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {previewItems.map((item, i) => (
              <motion.div
                key={item.id} variants={fadeUp}
                className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <Link to="/gallery">
                  {item.dataUrl ? (
                    <img
                      src={item.dataUrl}
                      alt={item.title}
                      className="w-full h-44 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`h-44 bg-gradient-to-br ${item.gradient}`} />
                  )}
                  <div className="bg-white px-3 py-2">
                    <p className="text-xs font-medium text-[#172544] truncate">{item.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── F. Simple Buying Journey ────────────────────────────────────── */}
      <section id="how-to-buy" className="py-20 bg-[#F8F6F0] px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-[#B88A35] font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#172544]">How to Get Your Plot</h2>
            <p className="text-gray-500 mt-3">Four easy steps from first look to final ownership.</p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { step: '01', icon: Search,        title: 'Explore the Project', desc: 'Browse the layout, amenities, and available plots.', to: '/explore-plots', cta: 'Browse Plots' },
              { step: '02', icon: FileText,      title: 'Select Your Plot',    desc: 'Pick a plot that matches your budget and preference.', to: '/explore-plots', cta: 'View Map' },
              { step: '03', icon: MessageCircle, title: 'Submit Enquiry',      desc: 'Send us your interest — our team will reach out promptly.', to: '/contact', cta: 'Enquire Now' },
              { step: '04', icon: CalendarCheck, title: 'Schedule a Visit',    desc: 'Come see the site in person before you decide.', to: '/contact', cta: 'Book Visit' },
            ].map((item, i) => (
              <motion.div
                key={i} variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-[#B88A35]/25 leading-none">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-[#B88A35]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-[#B88A35]" />
                  </div>
                </div>
                <h3 className="font-bold text-[#172544] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{item.desc}</p>
                <Link
                  to={item.to}
                  className="mt-4 inline-flex items-center gap-1 text-[#B88A35] text-sm font-semibold hover:gap-2 transition-all"
                >
                  {item.cta} <ChevronRight size={15} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── D. Location ─────────────────────────────────────────────────── */}
      <section id="location" className="py-20 bg-[#172544] px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-[#D5B46B] font-semibold text-sm uppercase tracking-widest mb-2">Where We Are</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Location &amp; Connectivity</h2>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#B88A35]/20 flex items-center justify-center flex-shrink-0">
              <MapPin size={28} className="text-[#D5B46B]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-xl">{config.project.name}</p>
              <p className="text-[#D5B46B] mt-1">{config.project.location}</p>
              <p className="text-gray-400 text-sm mt-2">
                Strategically located in Andhra Pradesh with excellent road connectivity.
                Wide internal roads of {config.project.roadWidth} ensure easy access throughout the layout.
              </p>
            </div>
            {config.company.mapsUrl && (
              <a
                href={config.company.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-2 bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                <Navigation size={18} /> Get Directions
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── G. Contact CTA ──────────────────────────────────────────────── */}
      <section id="contact-cta" className="py-20 bg-[#101B35] px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your Perfect Plot?
            </h2>
            <p className="text-gray-400 mb-8">
              Schedule a free site visit or talk to our team today.
              We're here to guide you every step of the way.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg"
              >
                Schedule Site Visit
              </Link>
              <a
                href={`https://wa.me/${config.company.whatsapp}?text=${encodeURIComponent('Hello Sri Lalitha Infra! I am interested in your plots and would like more information.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition"
              >
                <MessageCircle size={18} /> WhatsApp Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
