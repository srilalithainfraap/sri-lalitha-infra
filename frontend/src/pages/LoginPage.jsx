import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { validateLogin } from '../utils/validation';
import { config } from '../data/config';
import { useAnalytics } from '../hooks/useAnalytics';

/*
 * Brand palette (extracted from the actual logo):
 *   Navy:      #0D1829  #1A2744  #122038
 *   Gold:      #C4923A  #D4A74A  #E8C877  (warm brass, not yellow or purple)
 *   White:     #FFFFFF  #F8F3EA
 */

/* ── Input component — dark navy glass ──────────────────────────────────── */
function AuthInput({ label, error, type = 'text', ...props }) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{
        fontSize: '0.695rem', fontWeight: 600, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: 'rgba(212,167,74,0.68)',
      }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPwd ? (show ? 'text' : 'password') : type}
          className={[
            'w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none',
            'text-white placeholder-white/25',
            error
              ? 'border border-red-500/50 bg-red-950/25 focus:ring-2 focus:ring-red-500/20'
              : 'border border-white/[0.10] bg-[#0D1829]/70 hover:border-[#C4923A]/30 hover:bg-[#0D1829]/80 focus:border-[#C4923A]/65 focus:ring-2 focus:ring-[#C4923A]/12 focus:bg-[#122038]/80',
          ].join(' ')}
          style={{ backdropFilter: 'blur(10px)', fontSize: '1rem' }}
          {...props}
        />
        {isPwd && (
          <button
            type="button" tabIndex={-1}
            onClick={() => setShow(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.30)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D4A74A'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.30)'; }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

/* ── LoginPage ────────────────────────────────────────────────────────────── */
export function LoginPage() {
  useAnalytics('login');
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/dashboard';

  // ── auth state (unchanged) ──────────────────────────────────────────────
  const [form, setForm]               = useState({ email: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      setServerError(result.error);
    }
  };
  // ── end auth state ───────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        /* Navy-only background: slow hue drift stays within navy range */
        @keyframes sliNavyDrift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        /* Gold orb float */
        @keyframes sliGoldOrb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          35%      { transform: translate(32px,-24px) scale(1.06); }
          70%      { transform: translate(-18px,16px) scale(0.96); }
        }
        @keyframes sliGoldOrb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          42%      { transform: translate(-26px,20px) scale(1.04); }
          78%      { transform: translate(22px,-14px) scale(0.97); }
        }
        @keyframes sliGoldOrb3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(14px,22px); }
        }
        /* Subtle logo glow pulse */
        @keyframes sliLogoGlow {
          0%,100% { box-shadow: 0 0 18px rgba(196,146,58,0.28), 0 4px 20px rgba(0,0,0,0.40); }
          50%      { box-shadow: 0 0 32px rgba(212,167,74,0.44), 0 4px 20px rgba(0,0,0,0.40); }
        }
        @media (prefers-reduced-motion:reduce) {
          .sli-orb { animation:none !important; }
          .sli-logo-box { animation:none !important; }
        }
      `}</style>

      {/* ── Full-screen background — pure navy ─────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{
          paddingTop: '5.5rem',
          paddingBottom: '3rem',
          background: 'linear-gradient(140deg, #050C1A 0%, #091422 26%, #070F1E 52%, #050A16 78%, #040910 100%)',
          backgroundSize: '200% 200%',
          animation: 'sliNavyDrift 28s ease infinite',
        }}>

        {/* Orb 1 — subtle royal-blue tint, top-left */}
        <div className="sli-orb pointer-events-none absolute rounded-full" style={{
          top: '-10%', left: '-8%',
          width: 'clamp(320px,52vw,720px)', height: 'clamp(320px,52vw,720px)',
          background: 'radial-gradient(circle, rgba(22,62,140,0.22) 0%, rgba(15,44,100,0.06) 55%, transparent 75%)',
          filter: 'blur(80px)',
          animation: 'sliGoldOrb1 16s ease-in-out infinite',
        }} />
        {/* Orb 2 — warm gold, top-right — signature brand glow */}
        <div className="sli-orb pointer-events-none absolute rounded-full" style={{
          top: '-4%', right: '-6%',
          width: 'clamp(280px,46vw,640px)', height: 'clamp(280px,46vw,640px)',
          background: 'radial-gradient(circle, rgba(196,146,58,0.20) 0%, rgba(196,146,58,0.05) 52%, transparent 72%)',
          filter: 'blur(88px)',
          animation: 'sliGoldOrb2 20s ease-in-out infinite',
        }} />
        {/* Orb 3 — deep warm gold, bottom-center */}
        <div className="sli-orb pointer-events-none absolute rounded-full" style={{
          bottom: '-8%', left: '18%',
          width: 'clamp(240px,40vw,560px)', height: 'clamp(240px,40vw,560px)',
          background: 'radial-gradient(circle, rgba(184,138,53,0.16) 0%, rgba(184,138,53,0.04) 58%, transparent 78%)',
          filter: 'blur(72px)',
          animation: 'sliGoldOrb3 13s ease-in-out infinite',
        }} />
        {/* Orb 4 — very dark navy depth, bottom-right (static, no animation) */}
        <div className="pointer-events-none absolute rounded-full" style={{
          bottom: '4%', right: '3%',
          width: 'clamp(200px,34vw,460px)', height: 'clamp(200px,34vw,460px)',
          background: 'radial-gradient(circle, rgba(18,50,110,0.18) 0%, transparent 65%)',
          filter: 'blur(65px)',
        }} />

        {/* Fine grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.018]" style={{
          backgroundImage:
            'linear-gradient(rgba(196,146,58,0.8) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(196,146,58,0.8) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }} />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Demo banner */}
          <div className="mb-4 rounded-xl px-4 py-3 flex items-start gap-2.5" style={{
            background: 'rgba(196,146,58,0.07)',
            border: '1px solid rgba(196,146,58,0.20)',
          }}>
            <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(228,185,110,0.75)' }}>
              <span style={{ fontWeight: 600, color: 'rgba(228,185,110,0.95)' }}>Demo — </span>
              User:{' '}
              <code style={{ background: 'rgba(196,146,58,0.14)', padding: '1px 5px', borderRadius: 4, color: 'rgba(232,200,119,0.95)' }}>
                user@demo.com / Demo@1234
              </code>
              {' · '}
              Admin:{' '}
              <code style={{ background: 'rgba(196,146,58,0.14)', padding: '1px 5px', borderRadius: 4, color: 'rgba(232,200,119,0.95)' }}>
                admin@srilalitha.com / Admin@1234
              </code>
            </p>
          </div>

          {/* ── Card ─────────────────────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(9,18,36,0.97) 0%, rgba(6,12,24,0.98) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(196,146,58,0.14)',
            boxShadow:
              '0 56px 112px rgba(0,0,0,0.68),' +
              '0 22px 58px rgba(0,0,0,0.48),' +
              '0 0 0 1px rgba(196,146,58,0.08),' +
              '0 0 80px rgba(196,146,58,0.05),' +
              'inset 0 1px 0 rgba(255,255,255,0.07),' +
              'inset 0 -1px 0 rgba(0,0,0,0.30)',
          }}>
            {/* Top stripe — navy to gold to navy, matching logo */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, #0D1829 0%, #1A2744 8%, #C4923A 30%, #E8C877 50%, #D4A74A 68%, #1A2744 90%, #0D1829 100%)',
            }} />

            {/* Gold inner glow beneath stripe */}
            <div className="pointer-events-none" style={{
              position: 'absolute', left: 0, right: 0, top: 4, height: 88,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(196,146,58,0.13) 0%, rgba(196,146,58,0.03) 55%, transparent 72%)',
            }} />

            <div className="relative px-5 py-6 sm:px-8 sm:py-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-5">
                  <img
                    src="/assets/sri-lalitha-logo.jpeg"
                    alt="Sri Lalitha Infra"
                    className="sli-logo-box relative block"
                    style={{
                      height: 72, width: 72,
                      objectFit: 'contain',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.97)',
                      border: '1.5px solid rgba(196,146,58,0.35)',
                      animation: 'sliLogoGlow 3s ease-in-out infinite',
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <h1 style={{
                  fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.024em', lineHeight: 1.15,
                  marginBottom: '0.4rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f3ea 38%, #E8C877 65%, #C4923A 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Welcome Back
                </h1>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(212,167,74,0.55)' }}>
                  {config.company.name.toUpperCase()}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                  label="Email Address" type="email"
                  value={form.email} onChange={set('email')}
                  error={errors.email} placeholder="you@example.com"
                  autoComplete="email"
                />
                <AuthInput
                  label="Password" type="password"
                  value={form.password} onChange={set('password')}
                  error={errors.password} placeholder="Enter your password"
                  autoComplete="current-password"
                />

                {serverError && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{
                    background: 'rgba(220,38,38,0.09)',
                    border: '1px solid rgba(220,38,38,0.22)',
                  }}>
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{serverError}</p>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    scale: loading ? 1 : 1.015,
                    boxShadow: '0 16px 44px rgba(196,146,58,0.55), 0 0 0 1px rgba(232,200,119,0.28)',
                  }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  className="w-full rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    padding: '0.9rem',
                    fontSize: '0.8rem', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, #7C5A1A 0%, #B8892E 25%, #E8C877 50%, #C4923A 74%, #8A6220 100%)',
                    boxShadow: '0 8px 28px rgba(196,146,58,0.40), inset 0 1px 0 rgba(255,255,255,0.20)',
                    transition: 'box-shadow 0.2s, transform 0.15s, opacity 0.15s',
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3" style={{ margin: '1.5rem 0' }}>
                <div className="flex-1 h-px" style={{ background: 'rgba(196,146,58,0.12)' }} />
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.22)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(196,146,58,0.12)' }} />
              </div>

              <p className="text-center" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.40)' }}>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold hover:underline" style={{ color: '#D4A74A' }}>
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
