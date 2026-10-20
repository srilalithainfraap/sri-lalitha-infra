import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { validateRegistration, sanitizePhone } from '../utils/validation';
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
            'w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none',
            'text-white placeholder-white/25',
            error
              ? 'border border-red-500/50 bg-red-950/25 focus:ring-2 focus:ring-red-500/20'
              : 'border border-white/[0.10] bg-[#0D1829]/70 hover:border-[#C4923A]/30 hover:bg-[#0D1829]/80 focus:border-[#C4923A]/65 focus:ring-2 focus:ring-[#C4923A]/12 focus:bg-[#122038]/80',
          ].join(' ')}
          style={{ backdropFilter: 'blur(10px)' }}
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

/* ── RegisterPage ─────────────────────────────────────────────────────────── */
export function RegisterPage() {
  useAnalytics('register');
  const { register } = useAuth();
  const navigate     = useNavigate();

  // ── auth state (unchanged) ──────────────────────────────────────────────
  const [form, setForm]               = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const setPhone = (e) => {
    const digits = sanitizePhone(e.target.value);
    setForm((f) => ({ ...f, mobile: digits }));
    setErrors((er) => ({ ...er, mobile: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegistration(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');
    const result = await register({
      name: form.name, email: form.email, mobile: form.mobile,
      password: form.password, confirmPassword: form.confirmPassword,
    });
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1600);
    } else {
      setServerError(result.error);
    }
  };
  // ── end auth state ───────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes sliRegNavyDrift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes sliRegOrb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-28px,22px) scale(1.05); }
          72%      { transform: translate(20px,-18px) scale(0.97); }
        }
        @keyframes sliRegOrb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          36%      { transform: translate(30px,-20px) scale(1.04); }
          75%      { transform: translate(-16px,24px) scale(0.96); }
        }
        @keyframes sliRegOrb3 {
          0%,100% { transform: translate(0,0); }
          55%      { transform: translate(-18px,16px); }
        }
        @keyframes sliRegLogoGlow {
          0%,100% { box-shadow: 0 0 18px rgba(196,146,58,0.28), 0 4px 20px rgba(0,0,0,0.40); }
          50%      { box-shadow: 0 0 32px rgba(212,167,74,0.44), 0 4px 20px rgba(0,0,0,0.40); }
        }
        @keyframes sliCheckPop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @media (prefers-reduced-motion:reduce) {
          .sli-reg-orb  { animation:none !important; }
          .sli-reg-logo { animation:none !important; }
        }
      `}</style>

      {/* ── Full-screen background — pure navy ─────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
        style={{
          paddingTop: '5.5rem',
          paddingBottom: '3rem',
          background: 'linear-gradient(145deg, #040B18 0%, #081320 28%, #060E1B 54%, #040910 78%, #030810 100%)',
          backgroundSize: '200% 200%',
          animation: 'sliRegNavyDrift 32s ease infinite',
        }}>

        {/* Orb 1 — royal-blue tint, bottom-left */}
        <div className="sli-reg-orb pointer-events-none absolute rounded-full" style={{
          bottom: '-6%', left: '-6%',
          width: 'clamp(300px,50vw,700px)', height: 'clamp(300px,50vw,700px)',
          background: 'radial-gradient(circle, rgba(20,58,136,0.20) 0%, rgba(12,40,96,0.05) 55%, transparent 75%)',
          filter: 'blur(84px)',
          animation: 'sliRegOrb1 18s ease-in-out infinite',
        }} />
        {/* Orb 2 — warm gold, top-right */}
        <div className="sli-reg-orb pointer-events-none absolute rounded-full" style={{
          top: '-6%', right: '-5%',
          width: 'clamp(260px,44vw,620px)', height: 'clamp(260px,44vw,620px)',
          background: 'radial-gradient(circle, rgba(196,146,58,0.22) 0%, rgba(196,146,58,0.06) 52%, transparent 72%)',
          filter: 'blur(90px)',
          animation: 'sliRegOrb2 22s ease-in-out infinite',
        }} />
        {/* Orb 3 — deep amber-gold, top-left */}
        <div className="sli-reg-orb pointer-events-none absolute rounded-full" style={{
          top: '8%', left: '4%',
          width: 'clamp(220px,38vw,520px)', height: 'clamp(220px,38vw,520px)',
          background: 'radial-gradient(circle, rgba(180,130,48,0.14) 0%, rgba(180,130,48,0.03) 60%, transparent 80%)',
          filter: 'blur(78px)',
          animation: 'sliRegOrb3 15s ease-in-out infinite',
        }} />
        {/* Orb 4 — deep navy depth, bottom-right (static) */}
        <div className="pointer-events-none absolute rounded-full" style={{
          bottom: '2%', right: '4%',
          width: 'clamp(180px,30vw,420px)', height: 'clamp(180px,30vw,420px)',
          background: 'radial-gradient(circle, rgba(16,46,104,0.16) 0%, transparent 68%)',
          filter: 'blur(60px)',
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
            {/* Top stripe — navy to gold to navy */}
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
              {/* Logo + heading */}
              <div className="text-center mb-7">
                <div className="relative inline-block mb-5">
                  <img
                    src="/assets/sri-lalitha-logo.jpeg"
                    alt="Sri Lalitha Infra"
                    className="sli-reg-logo relative block"
                    style={{
                      height: 72, width: 72,
                      objectFit: 'contain',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.97)',
                      border: '1.5px solid rgba(196,146,58,0.35)',
                      animation: 'sliRegLogoGlow 3s ease-in-out infinite',
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
                  Create Account
                </h1>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(212,167,74,0.55)' }}>
                  {config.company.name.toUpperCase()}
                </p>
              </div>

              {/* ── Success state ──────────────────────────────────────── */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-6"
                  >
                    <div style={{ animation: 'sliCheckPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                      <CheckCircle2 size={52} style={{ color: '#C4923A' }} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.86)', fontWeight: 600, fontSize: '1.05rem' }}>
                      Account Created!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.82rem' }}>
                      Redirecting to your dashboard…
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Form ───────────────────────────────────────────────── */}
              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AuthInput
                    label="Full Name"
                    value={form.name} onChange={set('name')}
                    error={errors.name} placeholder="Your full name"
                    autoComplete="name"
                  />
                  <AuthInput
                    label="Email Address" type="email"
                    value={form.email} onChange={set('email')}
                    error={errors.email} placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <AuthInput
                    label="Mobile Number" type="tel"
                    inputMode="numeric" maxLength={10}
                    value={form.mobile} onChange={setPhone}
                    error={errors.mobile} placeholder="10-digit mobile number"
                    autoComplete="tel"
                  />
                  <AuthInput
                    label="Password" type="password"
                    value={form.password} onChange={set('password')}
                    error={errors.password} placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <AuthInput
                    label="Confirm Password" type="password"
                    value={form.confirmPassword} onChange={set('confirmPassword')}
                    error={errors.confirmPassword} placeholder="Repeat your password"
                    autoComplete="new-password"
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
                      marginTop: '0.5rem',
                      fontSize: '0.8rem', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, #7C5A1A 0%, #B8892E 25%, #E8C877 50%, #C4923A 74%, #8A6220 100%)',
                      boxShadow: '0 8px 28px rgba(196,146,58,0.40), inset 0 1px 0 rgba(255,255,255,0.20)',
                      transition: 'box-shadow 0.2s, transform 0.15s, opacity 0.15s',
                    }}
                  >
                    {loading ? 'Creating Account…' : 'Create Account'}
                  </motion.button>
                </form>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3" style={{ margin: '1.5rem 0' }}>
                <div className="flex-1 h-px" style={{ background: 'rgba(196,146,58,0.12)' }} />
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.22)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(196,146,58,0.12)' }} />
              </div>

              <p className="text-center" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.40)' }}>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:underline" style={{ color: '#D4A74A' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
