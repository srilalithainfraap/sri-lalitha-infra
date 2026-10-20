/**
 * HeroScrollCanvas
 *
 * Canvas-based image renderer for scroll-controlled sequences.
 *
 * - If framePaths is non-empty, sequences through them based on scrollProgress.
 * - If framePaths is empty/null, applies a Ken Burns (slow zoom+pan) effect
 *   on the single fallbackSrc image.
 *
 * Key design decisions:
 *   - No "already-drew-this-index" skip guard: that guard prevented newly
 *     loaded frames from being painted when img.onload fired at the same
 *     target index that had previously returned a fallback frame.
 *   - Resize handler uses drawRef so it never needs `draw` as a dependency
 *     and is therefore registered exactly once on mount.
 *   - drawRef is kept current after every render so img.onload always calls
 *     the latest draw closure (correct scrollProgress) without being a dep.
 *   - First PRELOAD_BATCH frames load immediately; rest after a short delay
 *     so they do not compete with the initial paint.
 *   - devicePixelRatio is respected for sharp Retina rendering.
 *   - All RAF handles and event listeners are cleaned up on unmount.
 */

import React, { useRef, useEffect, useCallback } from 'react';

const PRELOAD_BATCH = 30; // immediate frames — covers Phase 1 entirely

export function HeroScrollCanvas({ scrollProgress, framePaths, fallbackSrc }) {
  const canvasRef   = useRef(null);
  const imagesRef   = useRef([]);     // Image[] indexed by frame
  const fallbackRef = useRef(null);   // fallback single image
  const rafRef      = useRef(null);   // current pending RAF id
  const mountedRef  = useRef(true);   // false after unmount / effect cleanup
  const drawRef     = useRef(null);   // always-current draw fn (avoids stale closures)

  const hasSequence = Array.isArray(framePaths) && framePaths.length > 0;
  const frameCount  = hasSequence ? framePaths.length : 0;

  /* ── canvas resize ─────────────────────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(canvas.offsetWidth  * dpr);
    canvas.height = Math.round(canvas.offsetHeight * dpr);
  }, []);

  /* ── draw helpers ──────────────────────────────────────────────────────── */

  // Cover-crop: fills canvas while preserving image aspect ratio.
  function drawCover(ctx, img, cw, ch) {
    const ir = img.width / img.height;
    const cr = cw / ch;
    let sx, sy, sw, sh;
    if (ir > cr) {
      sh = img.height; sw = sh * cr;
      sx = (img.width - sw) / 2; sy = 0;
    } else {
      sw = img.width; sh = sw / cr;
      sx = 0; sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  // Ken Burns on the fallback: slow zoom + pan tied to scrollProgress.
  function drawKenBurns(ctx, img, cw, ch, progress) {
    const scale = 1 + progress * 0.10;
    const panX  = progress * -0.04;
    const ir    = img.width / img.height;
    const cr    = cw / ch;
    let sx, sy, sw, sh;
    if (ir > cr) {
      sh = img.height; sw = sh * cr;
      sx = (img.width - sw) / 2 + panX * img.width; sy = 0;
    } else {
      sw = img.width; sh = sw / cr;
      sx = 0; sy = (img.height - sh) / 2;
    }
    const zsw = sw / scale, zsh = sh / scale;
    const zsx = sx + (sw - zsw) / 2, zsy = sy + (sh - zsh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, zsx, zsy, zsw, zsh, 0, 0, cw, ch);
  }

  // Covers the render-software logo (4-pointed star + text) baked into the
  // bottom-right corner of every source JPEG at ~92% x, ~86% y.
  // A radial gradient from the corner at radius 56% of the shorter canvas
  // dimension yields ≥95% opacity at the confirmed watermark coordinates across
  // all viewport sizes, fading to transparent well before the road's midfield.
  function maskWatermark(ctx, cw, ch) {
    const r = 0.56 * Math.min(cw, ch);
    const g = ctx.createRadialGradient(cw, ch, 0, cw, ch, r);
    g.addColorStop(0,    'rgba(16,27,53,1)');
    g.addColorStop(0.50, 'rgba(16,27,53,0.96)');
    g.addColorStop(0.74, 'rgba(16,27,53,0.78)');
    g.addColorStop(0.92, 'rgba(16,27,53,0.18)');
    g.addColorStop(1,    'rgba(16,27,53,0)');
    ctx.fillStyle = g;
    // Paint only the bottom-right quadrant where the watermark lives.
    ctx.fillRect(cw * 0.56, ch * 0.52, cw - cw * 0.56, ch - ch * 0.52);
  }

  /* ── main draw function ─────────────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx      = canvas.getContext('2d');
    const cw       = canvas.width;
    const ch       = canvas.height;
    const progress = Math.max(0, Math.min(1, scrollProgress || 0));

    if (!hasSequence) {
      // Ken Burns fallback on single image
      const img = fallbackRef.current;
      if (img?.complete) drawKenBurns(ctx, img, cw, ch, progress);
      return;
    }

    // Map scroll progress to frame index
    const targetIndex = Math.min(
      Math.round(progress * (frameCount - 1)),
      frameCount - 1,
    );

    // Use the exact target frame if loaded; otherwise find the nearest loaded
    // frame searching backwards so the canvas never goes blank mid-sequence.
    let img = imagesRef.current[targetIndex];
    if (!img?.complete) {
      for (let i = targetIndex - 1; i >= 0; i--) {
        const c = imagesRef.current[i];
        if (c?.complete) { img = c; break; }
      }
    }
    if (!img) return;

    ctx.clearRect(0, 0, cw, ch);
    drawCover(ctx, img, cw, ch);
    maskWatermark(ctx, cw, ch);
  }, [scrollProgress, hasSequence, frameCount]);

  /* ── keep drawRef current after every render ───────────────────────────── */
  useEffect(() => { drawRef.current = draw; });

  /* ── schedule draw via RAF on every scroll-driven prop change ──────────── */
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  /* ── resize listener — registered once, uses drawRef ───────────────────── */
  useEffect(() => {
    resizeCanvas();
    const onResize = () => {
      resizeCanvas();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawRef.current?.());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [resizeCanvas]); // no `draw` dep — uses drawRef so listener is stable

  /* ── image loading ─────────────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;

    if (!hasSequence) {
      const img = new Image();
      img.src   = fallbackSrc;
      img.onload = () => {
        if (!mountedRef.current) return;
        fallbackRef.current = img;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawRef.current?.());
      };
      return () => { mountedRef.current = false; };
    }

    imagesRef.current = new Array(frameCount).fill(null);

    const loadFrame = (i) => {
      const img = new Image();
      img.src   = framePaths[i];
      img.onload = () => {
        if (!mountedRef.current) return;
        imagesRef.current[i] = img;
        // Trigger a redraw so this newly loaded frame is painted immediately
        // if the user is currently at (or near) this frame index.
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawRef.current?.());
      };
      // On error: slot stays null; nearest-loaded-frame logic skips it.
    };

    // Immediate batch: covers Phase 1 entirely
    const firstBatch = Math.min(PRELOAD_BATCH, frameCount);
    for (let i = 0; i < firstBatch; i++) loadFrame(i);

    // Deferred batch: start after initial paint is complete
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      for (let i = firstBatch; i < frameCount; i++) loadFrame(i);
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  // `draw` excluded intentionally — changes every scroll tick; image loading
  // must not restart on scroll. img.onload uses drawRef for a current draw.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSequence, framePaths, frameCount, fallbackSrc]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      aria-hidden="true"
      style={{ touchAction: 'pan-y', userSelect: 'none' }}
    />
  );
}
