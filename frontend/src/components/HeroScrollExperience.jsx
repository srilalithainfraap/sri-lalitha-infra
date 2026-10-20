/**
 * HeroScrollExperience
 *
 * Cinematic scroll-controlled hero for Sri Lalitha Infra.
 *
 * Architecture:
 *  - A tall outer div (500vh) provides the scrollable track.
 *  - A sticky inner div (100vh) keeps the canvas + overlays fixed while
 *    the user scrolls through the track.
 *  - A single scroll-progress value (0→1) drives BOTH the canvas frame
 *    and the text-phase transitions.
 *  - After the 500vh track ends, the rest of the homepage scrolls normally.
 *
 * Image sequence:
 *  - Expected at /images/realestate-sequence/1.jpg … /images/realestate-sequence/240.jpg
 *  - Frame 1 is probed on mount to detect whether the sequence is available.
 *  - If absent → graceful Ken Burns fallback on /assets/hero-bg.jpg.
 *  - If present → full 240-frame scroll sequence.
 *
 * Text phases (each controls opacity via scrollProgress):
 *  Phase 1 "Hero"       0 %–33 %
 *  Phase 2 "Community"  33 %–66 %
 *  Phase 3 "Future"     66 %–100 %
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeroScrollCanvas } from './HeroScrollCanvas';
import {
  MapPin, ArrowRight, Calendar, ChevronDown,
  ShieldCheck, HeartHandshake, Layers, Leaf, Landmark,
} from 'lucide-react';
import { config } from '../data/config';

/* ── Constants ────────────────────────────────────────────────────────────── */
const TOTAL_FRAMES  = 300;
const FRAME_FOLDER  = '/lalithainfrapics/';
const FALLBACK_SRC  = '/assets/hero-bg.jpg';

// Frames are named ezgif-frame-001.jpg … ezgif-frame-300.jpg (zero-padded).
function buildFramePaths(folder, count) {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(3, '0');
    return `${folder}ezgif-frame-${n}.jpg`;
  });
}

/* ── Phase opacity helpers ────────────────────────────────────────────────── */
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

function phaseOpacity(progress, enterAt, fullAt, fadeAt, exitAt) {
  if (progress < enterAt) return 0;
  if (progress < fullAt)  return lerp(0, 1, (progress - enterAt) / (fullAt - enterAt));
  if (progress < fadeAt)  return 1;
  if (progress < exitAt)  return lerp(1, 0, (progress - fadeAt)  / (exitAt  - fadeAt));
  return 0;
}

/* ── PhaseLayer ───────────────────────────────────────────────────────────── */
function PhaseLayer({ opacity, children }) {
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        opacity,
        pointerEvents: opacity > 0.05 ? 'auto' : 'none',
        transition: 'opacity 0.05s linear',
        willChange: 'opacity',
      }}
      aria-hidden={opacity < 0.5}
    >
      {children}
    </div>
  );
}

/* ── HeroScrollExperience ─────────────────────────────────────────────────── */
export function HeroScrollExperience() {
  const sectionRef     = useRef(null);
  const stickyRef      = useRef(null);   // sticky viewport div — used for accurate scrollable calc
  const [progress, setProgress]       = useState(0);
  // Optimistic default: assume the sequence exists so frames start loading
  // immediately on mount rather than waiting for the probe to resolve.
  const [seqExists, setSeqExists]     = useState(true);
  const [seqChecked, setSeqChecked]   = useState(false);

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  /* ── Probe for frame sequence ─────────────────────────────────────────── */
  useEffect(() => {
    const probe = new Image();
    probe.src = `${FRAME_FOLDER}ezgif-frame-001.jpg?_probe=${Date.now()}`;
    probe.onload  = () => { setSeqChecked(true); };                        // already true
    probe.onerror = () => { setSeqExists(false); setSeqChecked(true); }; // fallback
  }, []);

  // Stable reference — must not change on every scroll-driven re-render,
  // or the canvas will wipe and restart its image-load on every scroll event.
  const framePaths = useMemo(
    () => (seqExists ? buildFramePaths(FRAME_FOLDER, TOTAL_FRAMES) : []),
    [seqExists],
  );

  /* ── Scroll progress ─────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect       = section.getBoundingClientRect();
      const scrolled   = -rect.top;
      // Use the sticky container's actual rendered height rather than
      // window.innerHeight.  On iOS Safari, 100vh (= large viewport) may
      // differ from window.innerHeight (= visible viewport with toolbar),
      // causing progress to hit 1.0 after the sticky element has already
      // started sliding off — which produces a white-background gap.
      const stickyH    = stickyRef.current?.offsetHeight || window.innerHeight;
      const scrollable = section.offsetHeight - stickyH;
      setProgress(Math.max(0, Math.min(1, scrolled / scrollable)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // iOS Safari fires visualViewport 'resize' when the toolbar shows/hides
    // (window.innerHeight also changes but a separate event source is more
    // reliable for recalculating progress after the layout settles).
    const vv = window.visualViewport;
    if (vv) vv.addEventListener('resize', onScroll);

    onScroll(); // initialise
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (vv) vv.removeEventListener('resize', onScroll);
    };
  }, []);

  /* ── Phase opacities ─────────────────────────────────────────────────── */
  const p1 = phaseOpacity(progress, 0,    0.04, 0.27,  0.35);
  const p2 = phaseOpacity(progress, 0.33, 0.41, 0.58,  0.66);
  const p3 = phaseOpacity(progress, 0.66, 0.74, 1.01,  1.10);

  /* ── Active phase label ──────────────────────────────────────────────── */
  const phaseLabel =
    progress < 0.33 ? '01 / HERO' :
    progress < 0.66 ? '02 / COMMUNITY' : '03 / FUTURE';

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '500vh' }}
      aria-label="Cinematic hero scroll experience"
    >
      {/* ── Sticky viewport ──────────────────────────────────────────────── */}
      <div ref={stickyRef} className="sticky top-0 h-screen-safe overflow-hidden bg-[#101B35]">

        {/* ── Canvas + overlays ─────────────────────────────────────────── */}
        <div className="absolute inset-0">
          {/* Canvas renders frames / Ken Burns */}
          <HeroScrollCanvas
            scrollProgress={prefersReduced ? 0 : progress}
            framePaths={framePaths}
            fallbackSrc={FALLBACK_SRC}
          />

          {/* Text-zone gradient — left panel only; centre and right stay open */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(16,27,53,0.80) 0%, rgba(16,27,53,0.55) 28%, rgba(16,27,53,0.18) 52%, transparent 72%)',
            }}
          />
          {/* Top vignette — softens the sky behind the navbar */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(16,27,53,0.42) 0%, rgba(16,27,53,0.08) 18%, transparent 36%)',
            }}
          />
          {/* Bottom vignette — grounds the frame without burying foreground detail */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(16,27,53,0.62) 0%, rgba(16,27,53,0.12) 18%, transparent 36%)',
            }}
          />
          {/* Belt-and-suspenders CSS layer on top of the canvas mask that
              already covers the render-software logo in the JPEG pixels. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 100% 100%, rgba(16,27,53,0.98) 14%, rgba(16,27,53,0.80) 24%, rgba(16,27,53,0.40) 36%, transparent 50%)',
            }}
          />
        </div>

        {/* ══════════ PHASE 1 — Hero ═════════════════════════════════════ */}
        <PhaseLayer opacity={p1}>
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 pt-20 sm:pt-28 pb-0">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[#B88A35] text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase mb-5"
            >
              LAND &nbsp;•&nbsp; LIFESTYLE &nbsp;•&nbsp; LEGACY
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.12 }}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="leading-none mb-6"
            >
              <span
                className="block text-white font-black"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 6.5rem)', lineHeight: 1.06 }}
              >
                Your Land.
              </span>
              <span
                className="block text-[#D5B46B] font-black"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 6.5rem)', lineHeight: 1.06 }}
              >
                Your Legacy.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
            >
              Discover exceptional plots designed for your future,
              <br className="hidden sm:block" />
              your family, and your ambitions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.44 }}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <Link
                to="/explore-plots"
                className="group inline-flex items-center gap-2.5 bg-[#B88A35] hover:bg-[#D5B46B] text-[#101B35] font-bold px-7 py-3.5 rounded-full text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-[#B88A35]/30 hover:shadow-xl"
              >
                Explore Our Plots
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 border border-white/30 hover:border-[#B88A35]/70 text-white hover:text-[#D5B46B] font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base transition-all duration-200"
              >
                <Calendar size={15} />
                Schedule a Site Visit
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator — bottom center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex flex-col items-center gap-1.5 pb-8 mt-auto"
          >
            <motion.div
              {...(prefersReduced ? {} : { animate: { y: [0, 6, 0] }, transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } })}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center"
            >
              <ChevronDown size={16} className="text-white/50" />
            </motion.div>
            <p className="text-white/30 text-[10px] tracking-[0.18em] uppercase font-medium">
              Scroll to Explore
            </p>
          </motion.div>
        </PhaseLayer>

        {/* ══════════ PHASE 2 — Community ════════════════════════════════ */}
        <PhaseLayer opacity={p2}>
          <div className="flex-1 flex items-center px-6 sm:px-12 lg:px-20 xl:px-28 pt-20 sm:pt-24 pb-12 sm:pb-16">
            <div className="max-w-2xl">
              <p className="text-[#B88A35] text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase mb-5">
                {config.project.name}
              </p>

              <h2
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 5rem)' }}
                className="leading-tight mb-6 text-white font-black"
              >
                More Than Land.<br />
                <span className="text-[#D5B46B]">A Way of Life.</span>
              </h2>

              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Thoughtfully planned spaces for the life you want to build.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: MapPin,          label: 'Prime Location',   sub: config.project.location },
                  { icon: Landmark,        label: 'Wide Roads',       sub: config.project.roadWidth },
                  { icon: Leaf,            label: 'Green Spaces',     sub: 'Landscaped parks' },
                  { icon: HeartHandshake,  label: 'Amenities',        sub: '15+ features*' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full border border-[#B88A35]/50 bg-[#B88A35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={14} className="text-[#B88A35]" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-snug">{item.label}</p>
                      <p className="text-white/45 text-xs leading-snug mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[10px] mt-4">*Sample demonstration data only.</p>
            </div>
          </div>
        </PhaseLayer>

        {/* ══════════ PHASE 3 — Future ════════════════════════════════════ */}
        <PhaseLayer opacity={p3}>
          <div className="flex-1 flex items-center px-6 sm:px-12 lg:px-20 xl:px-28 pt-20 sm:pt-24 pb-12 sm:pb-16">
            <div className="max-w-2xl">
              <p className="text-[#B88A35] text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase mb-5">
                {config.company.name} — {config.company.tagline}
              </p>

              <h2
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 5rem)' }}
                className="leading-tight mb-6 text-white font-black"
              >
                Your Future<br />
                <span className="text-[#D5B46B]">Starts Here.</span>
              </h2>

              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Find the space to build your next chapter in {config.project.location}.
              </p>

              {/* Project info panel */}
              <div className="bg-[#0D1628]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-7 max-w-md grid grid-cols-2 gap-4">
                {[
                  { label: 'Project',     value: config.project.name },
                  { label: 'Location',    value: config.project.location },
                  { label: 'Total Plots', value: `${config.project.totalPlots} Plots` },
                  { label: 'Status',      value: config.project.status, gold: true },
                ].map((row, i) => (
                  <div key={i}>
                    <p className="text-[#B88A35] text-xs uppercase tracking-widest mb-0.5">{row.label}</p>
                    <p className={`font-semibold text-sm ${row.gold ? 'text-[#D5B46B]' : 'text-white'}`}>{row.value}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/explore-plots"
                className="group inline-flex items-center gap-2.5 bg-[#B88A35] hover:bg-[#D5B46B] text-[#101B35] font-bold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-lg hover:shadow-[#B88A35]/30 hover:shadow-xl"
              >
                Explore the Master Plan
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </PhaseLayer>

        {/* ── Persistent HUD — right edge ─────────────────────────────── */}
        <div
          className="absolute right-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Top track */}
          <div className="w-px h-16 bg-white/12 overflow-hidden">
            <div
              className="w-full bg-[#B88A35]"
              style={{ height: `${Math.min(progress * 300, 100)}%`, transition: 'height 0.1s linear' }}
            />
          </div>

          {/* Phase dots */}
          <div className="flex flex-col gap-2.5 my-3">
            {[0, 1, 2].map((i) => {
              const active =
                (i === 0 && progress < 0.33) ||
                (i === 1 && progress >= 0.33 && progress < 0.66) ||
                (i === 2 && progress >= 0.66);
              return (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${active ? 'w-2 h-2 bg-[#B88A35]' : 'w-1.5 h-1.5 bg-white/25'}`}
                />
              );
            })}
          </div>

          {/* Bottom track */}
          <div className="w-px h-16 bg-white/12 overflow-hidden">
            <div
              className="w-full bg-[#B88A35]"
              style={{ height: `${Math.max(0, (progress - 0.67) * 300)}%`, transition: 'height 0.1s linear' }}
            />
          </div>
        </div>

        {/* Phase label — bottom right */}
        <div className="absolute right-5 bottom-6 hidden xl:block pointer-events-none" aria-hidden="true">
          <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase text-right font-medium">
            {phaseLabel}
          </p>
        </div>

        {/* Sequence status notice (dev helper — shown only when no sequence found) */}
        {seqChecked && !seqExists && (
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#101B35]/90 border border-[#B88A35]/30 rounded-lg px-4 py-2 text-center pointer-events-none"
            aria-hidden="true"
          >
            <p className="text-[#D5B46B] text-[10px] font-medium tracking-wide uppercase">
              Ken Burns fallback active
            </p>
            <p className="text-white/35 text-[9px] mt-0.5">
              Place JPG frames in <code className="text-[#B88A35]">public/images/realestate-sequence/</code>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
