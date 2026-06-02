import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import { AUTH_BASE_URL } from '../services/auth.api';
import './Login.scss';
import { useTheme } from '../../../app/ThemeContext';

const EyeOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.26 9.77A7.18 7.18 0 0 1 12 4.8c1.73 0 3.28.63 4.5 1.66l3.36-3.36A11.95 11.95 0 0 0 12 .8C7.59.8 3.77 3.29 1.84 6.95l3.42 2.82z" />
    <path fill="#34A853" d="M16.04 18.01A7.18 7.18 0 0 1 12 19.2c-3.03 0-5.62-1.88-6.74-4.56L1.84 17.4A11.95 11.95 0 0 0 12 23.2c3.24 0 6.3-1.19 8.61-3.35l-4.57-1.84z" />
    <path fill="#4A90D9" d="M23.2 12c0-.82-.07-1.6-.2-2.36H12v4.46h6.29a5.38 5.38 0 0 1-2.33 3.52l4.57 1.84A11.94 11.94 0 0 0 23.2 12z" />
    <path fill="#FBBC05" d="M5.26 14.23A7.22 7.22 0 0 1 4.8 12c0-.78.13-1.54.37-2.23L1.84 6.95A11.96 11.96 0 0 0 .8 12c0 1.84.41 3.58 1.13 5.14l3.33-2.91z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.2.07 2.03.55 2.72.56.89-.01 2.59-.82 4.36-.7 1.46.1 2.79.64 3.64 1.82-3.34 2-2.78 6.49.28 7.7zm-2.76-14.3c-1.35.07-2.48.77-3.34 1.69-.8.85-1.38 2.14-1.19 3.41 1.5.12 3.04-.75 3.87-1.73.81-.96 1.33-2.16 1.36-3.37-.23 0-.47 0-.7.01z" />
  </svg>
);

function InputField({ id, label, type = 'text', name, suffix, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className={`auth-field ${focused ? 'is-focused' : ''} ${hasValue ? 'has-value' : ''}`}>
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field__control">
        {suffix && <span className="auth-field__prefix">{suffix}</span>}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          className="auth-field__input"
        />
      </div>
    </div>
  );
}

function PasswordInput({ id, label, name, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className={`auth-field auth-field--password ${focused ? 'is-focused' : ''} ${hasValue ? 'has-value' : ''}`}>
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field__control auth-field__control--password">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="current-password"
          className="auth-field__input"
        />
        <button type="button" className="auth-field__toggle" onClick={() => setShow((current) => !current)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOpenIcon /> : <EyeOffIcon />}
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  const { theme } = useTheme();
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isEmail = formData.emailOrPhone.includes('@');

    try {
      const user = await handleLogin({
        email: isEmail ? formData.emailOrPhone : undefined,
        contact: !isEmail ? formData.emailOrPhone : undefined,
        password: formData.password,
      });

      if (user.role === 'buyer') {
        navigate('/');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`auth-page login-page ${mounted ? 'is-mounted' : ''}`} data-theme={theme}>
      <div className="auth-page__background">
        <img src="/auth-ecommerce.png" alt="Snitch ecommerce collection" className="auth-page__background-image" />
        <div className="auth-page__background-overlay auth-page__background-overlay--side" />
        <div className="auth-page__background-overlay auth-page__background-overlay--bottom" />
        <div className="auth-page__background-overlay auth-page__background-overlay--radial" />
      </div>

      <div className="auth-page__hero">
        <div className="auth-page__brand">
          <Link to="/" className="auth-page__brand-link">
            SNITCH
          </Link>
          <span className="auth-page__brand-caption">New Drops . Orders . Sellers</span>
        </div>

        <div className="auth-page__hero-copy">
          <p className="auth-page__eyebrow">Return To Your Storefront</p>
          <h1 className="auth-page__title">
            Continue your
            <br />
            <em>shopping flow.</em>
          </h1>
          <p className="auth-page__description">
            Sign in to track orders, revisit saved products, and jump back into your seller dashboard without friction.
          </p>
          <div className="auth-page__benefits">
            {['Order Tracking', 'Saved Wishlist', 'Seller Access'].map((item) => (
              <div key={item} className="auth-page__benefit">
                <div className="auth-page__benefit-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="auth-page__hero-card">
            <div className="auth-page__hero-card-header">
              <span className="auth-page__hero-card-label">Store Snapshot</span>
              <span className="auth-page__hero-card-badge">Secure</span>
            </div>
            <div className="auth-page__metrics">
              <div className="auth-page__metric">
                <strong>Orders</strong>
                <span>track every shipment</span>
              </div>
              <div className="auth-page__metric">
                <strong>Wishlist</strong>
                <span>saved product picks</span>
              </div>
              <div className="auth-page__metric">
                <strong>Seller</strong>
                <span>dashboard ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-page__copyright">© 2026 Snitch Fashion Group</div>
      </div>

      <div className="auth-page__panel">
        <div className="auth-page__panel-line auth-page__panel-line--top" />
        <div className="auth-page__panel-line auth-page__panel-line--side" />

        <Link to="/" className="auth-page__close-link" aria-label="Close login page">
          ×
        </Link>

        <div className="auth-page__panel-intro">
          <p className="auth-page__panel-eyebrow">Sign In</p>
          <h2 className="auth-page__panel-title">Welcome Back</h2>
          <p className="auth-page__panel-subtitle">Log in to continue shopping, tracking, or managing your store.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <InputField id="emailOrPhone" label="Email / Contact Number" type="text" name="emailOrPhone" value={formData.emailOrPhone} onChange={handleChange} />
          <PasswordInput id="password" label="Password" name="password" value={formData.password} onChange={handleChange} />

          <div className="auth-forgot-row">
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button id="login-btn" type="submit" className="auth-submit-button">
            Sign In
          </button>

          <p className="auth-form__hint">
            Your orders, wishlist, and seller tools stay synced in one place.
          </p>
        </form>

        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__label">Or login with</span>
          <div className="auth-divider__line" />
        </div>

        <div className="auth-socials">
          {[GoogleIcon, AppleIcon].map((Icon, index) => (
            <a key={index} href={`${AUTH_BASE_URL}/google`} className="auth-social-button" aria-label="Log in with social provider">
              <Icon />
            </a>
          ))}
        </div>

        <p className="auth-footer-note">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-inline-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
