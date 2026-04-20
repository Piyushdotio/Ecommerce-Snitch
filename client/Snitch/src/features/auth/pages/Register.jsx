import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ─── Icons ─── */
const EyeOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.26 9.77A7.18 7.18 0 0 1 12 4.8c1.73 0 3.28.63 4.5 1.66l3.36-3.36A11.95 11.95 0 0 0 12 .8C7.59.8 3.77 3.29 1.84 6.95l3.42 2.82z"/>
    <path fill="#34A853" d="M16.04 18.01A7.18 7.18 0 0 1 12 19.2c-3.03 0-5.62-1.88-6.74-4.56L1.84 17.4A11.95 11.95 0 0 0 12 23.2c3.24 0 6.3-1.19 8.61-3.35l-4.57-1.84z"/>
    <path fill="#4A90D9" d="M23.2 12c0-.82-.07-1.6-.2-2.36H12v4.46h6.29a5.38 5.38 0 0 1-2.33 3.52l4.57 1.84A11.94 11.94 0 0 0 23.2 12z"/>
    <path fill="#FBBC05" d="M5.26 14.23A7.22 7.22 0 0 1 4.8 12c0-.78.13-1.54.37-2.23L1.84 6.95A11.96 11.96 0 0 0 .8 12c0 1.84.41 3.58 1.13 5.14l3.33-2.91z"/>
  </svg>
);
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.2.07 2.03.55 2.72.56.89-.01 2.59-.82 4.36-.7 1.46.1 2.79.64 3.64 1.82-3.34 2-2.78 6.49.28 7.7zm-2.76-14.3c-1.35.07-2.48.77-3.34 1.69-.8.85-1.38 2.14-1.19 3.41 1.5.12 3.04-.75 3.87-1.73.81-.96 1.33-2.16 1.36-3.37-.23 0-.47 0-.7.01z"/>
  </svg>
);


/* ─── Role Toggle ─── */
function RoleToggle({ role, setRole }) {
  return (
    <div
      className="relative flex p-1 rounded-full border border-white/10 overflow-hidden mx-auto"
      style={{ background: 'rgba(255,255,255,0.04)', width: 'fit-content', minWidth: 200 }}
    >
      <div
        className="absolute top-1 left-1 bottom-1 rounded-full transition-all duration-500"
        style={{
          width: 'calc(50% - 4px)',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
          transform: `translateX(${role === 'seller' ? '100%' : '0%'})`,
        }}
      />
      {['user', 'seller'].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRole(r)}
          style={{
            position: 'relative', zIndex: 10,
            flex: '0 0 100px',
            padding: '8px 0',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            color: role === r ? '#000' : 'rgba(255,255,255,0.35)',
            transition: 'color 0.4s',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/* ─── Input Field with floating label ─── */
function InputField({ id, label, type = 'text', name, suffix }) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const hasValue = value.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor={id}
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: focused ? '#F59E0B' : hasValue ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
          transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: "'Inter', sans-serif",
          marginLeft: 4
        }}
      >
        {label}
      </label>

      {/* Input box - Glass Slot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          border: `1px solid ${focused ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.14)'}`,
          borderRadius: 14,
          background: focused ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          padding: '0 18px',
          height: 52,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: focused 
            ? '0 0 0 2px rgba(245,158,11,0.18), 0 6px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)' 
            : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        {suffix && (
          <span
            style={{
              color: focused || hasValue ? '#F59E0B' : 'rgba(255,255,255,0.25)',
              fontSize: 15,
              fontWeight: 700,
              paddingRight: 14,
              marginRight: 14,
              borderRight: '1px solid rgba(255,255,255,0.08)',
              transition: 'color 0.3s',
              flexShrink: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {suffix}
          </span>
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          placeholder=""
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            caretColor: '#F59E0B',
            fontWeight: 500,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Password Input ─── */
function PasswordInput({ id, label, name }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const hasValue = value.length > 0;

  const strength = [value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#10B981'][strength] || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      <label
        htmlFor={id}
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: focused ? '#F59E0B' : hasValue ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
          transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: "'Inter', sans-serif",
          marginLeft: 4
        }}
      >
        {label}
      </label>

      {/* Input box - Glass Slot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${focused ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.14)'}`,
          borderRadius: 14,
          background: focused ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          padding: '0 18px',
          height: 52,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: focused 
            ? '0 0 0 2px rgba(245,158,11,0.18), 0 6px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)' 
            : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        <input
          id={id}
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="new-password"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            caretColor: '#F59E0B',
            paddingRight: 36,
            fontWeight: 500,
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 18,
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
            color: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#F59E0B'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
        >
          {show ? <EyeOpenIcon /> : <EyeOffIcon />}
        </button>
      </div>

      {/* Strength bar */}
      {hasValue && (
        <div style={{ display: 'flex', gap: 4, padding: '0 8px' }}>
          {[1,2,3,4].map(i => (
            <div
              key={i}
              style={{
                height: 2, flex: 1, borderRadius: 4,
                background: i <= strength ? strengthColor : 'rgba(255,255,255,0.06)',
                transition: 'background 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Register() {
  const [role, setRole] = useState('user');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = e => e.preventDefault();

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ══════════════════════════════════════
          BACKGROUND — hero image fills full viewport
      ══════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'scale(1.04)',
          transition: 'opacity 0.9s ease, transform 1.2s ease',
          zIndex: 0,
        }}
      >
        <img
          src="/fashion-hero.png"
          alt="Snitch Fashion"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        {/* Overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)' }} />
      </div>

      {/* ══════════════════════════════════════
          LEFT — text content over hero
      ══════════════════════════════════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
        {/* Top-left logo */}
        <div style={{
          position: 'absolute', top: 36, left: 44,
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.4s',
          pointerEvents: 'auto',
        }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, color: '#fff', letterSpacing: '0.06em' }}>Snitch</span>
        </div>

        {/* Bottom-left copy */}
        <div style={{
          position: 'absolute', bottom: 52, left: 44,
          opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 0.8s ease 0.5s',
          maxWidth: 380,
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#F59E0B', marginBottom: 14, opacity: 0.9,
          }}>── New Season Onboarding</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 800,
            fontSize: 'clamp(2.8rem, 4.5vw, 3.8rem)', lineHeight: 1.0,
            color: '#fff', margin: 0, marginBottom: 18,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            Join the<br />
            <em style={{ color: '#F59E0B', fontStyle: 'italic' }}>Elite Circle</em>
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14,
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
            maxWidth: 320, marginBottom: 28,
          }}>
            Curated luxury drops and private collections for the next generation of style.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Exclusive Early Access', 'Priority Delivery', 'Members-Only Pricing'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#F59E0B', boxShadow: '0 0 10px rgba(245,158,11,0.7)', flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          position: 'absolute', bottom: 20, left: 44,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
        }}>© 2026 Snitch Fashion Group</div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Glass panel ON TOP of hero image
      ══════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: 480,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 52px',
          /* ── TRUE GLASSMORPHISM ──
             backdrop-filter now blurs the hero image behind it */
          background: 'rgba(10, 10, 10, 0.35)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.12)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateX(60px)',
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.30) 50%, transparent 100%)',
        }} />
        {/* Left edge inner glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 1,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.20) 35%, rgba(255,255,255,0.12) 65%, transparent 100%)',
        }} />

        {/* Close button */}
        <Link
          to="/"
          style={{
            position: 'absolute', top: 28, right: 28,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.35)',
            textDecoration: 'none',
            fontSize: 20, lineHeight: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          ×
        </Link>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.35em',
            textTransform: 'uppercase', color: '#F59E0B', marginBottom: 10, opacity: 0.85,
          }}>
            Onboarding
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26, fontWeight: 700,
            color: '#fff', margin: 0, marginBottom: 6, letterSpacing: '-0.02em',
            lineHeight: 1.2, textShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            Create Account
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
            Join thousands of sellers & buyers today
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ marginBottom: 24 }}>
          <RoleToggle role={role} setRole={setRole} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <InputField id="name" label="Full Name" name="fullName" />
          <InputField id="email" label="Email Address" type="email" name="email" />
          <InputField id="phone" label="Contact Number" name="phone" suffix="+91" />
          <PasswordInput id="password" label="Password" name="password" />

          {/* CTA */}
          <button
            id="create-account-btn"
            type="submit"
            style={{
              marginTop: 6,
              width: '100%', padding: '15px 0',
              border: 'none', borderRadius: 100,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#000', fontSize: 11,
              fontWeight: 900, letterSpacing: '0.25em',
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
              transition: 'all 0.25s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(245,158,11,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.3)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Or signup with</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Social */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
          {[GoogleIcon, AppleIcon].map((Icon, i) => (
            <button
              key={i}
              type="button"
              style={{
                width: 48, height: 48,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.09)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                transition: 'all 0.25s ease',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            >
              <Icon />
            </button>
          ))}
        </div>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#F59E0B', fontWeight: 700,
              textDecoration: 'none', letterSpacing: '0.03em',
              borderBottom: '1px solid rgba(245,158,11,0.4)',
              paddingBottom: 1, transition: 'color 0.2s',
            }}
          >
            Log in
          </Link>
        </p>

        {/* Panel bottom footer */}
        <p style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          textAlign: 'center', fontSize: 9,
          fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
        }}>
        
        </p>
      </div>
    </div>
  );
}
