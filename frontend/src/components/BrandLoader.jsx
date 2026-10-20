import React from 'react';

export function BrandLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#101B35',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1.25rem',
    }}>
      <style>{`
        @keyframes sliLoaderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes sliLoaderFade {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sli-loader-ring { animation: none !important; border-top-color: #B88A35; }
          .sli-loader-text { animation: none !important; opacity: 1; }
        }
      `}</style>

      {/* Logo with gold halo */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: 'rgba(184,138,53,0.35)',
          filter: 'blur(14px)',
          transform: 'scale(1.35)',
        }} />
        <img
          src="/assets/sri-lalitha-logo.jpeg"
          alt="Sri Lalitha Infra"
          style={{
            position: 'relative', display: 'block',
            height: 72, width: 72,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #B88A35',
          }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Gold spinning ring */}
      <div
        className="sli-loader-ring"
        style={{
          width: 44, height: 44,
          borderRadius: '50%',
          border: '3px solid rgba(184,138,53,0.15)',
          borderTopColor: '#B88A35',
          animation: 'sliLoaderSpin 0.75s linear infinite',
        }}
      />

      {/* Brand name */}
      <p
        className="sli-loader-text"
        style={{
          color: '#D5B46B',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          animation: 'sliLoaderFade 1.6s ease-in-out infinite',
        }}
      >
        Sri Lalitha Infra
      </p>
    </div>
  );
}
