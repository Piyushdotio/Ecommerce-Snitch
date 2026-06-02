import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import { AUTH_BASE_URL } from '../services/auth.api';
import './Register.scss';
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

function RoleToggle({ role, setRole }) {
  return (
    <div className={`role-toggle ${role === 'seller' ? 'is-seller' : ''}`}>
      <div className="role-toggle__slider" />
      {['user', 'seller'].map((option) => (
        <button
          key={option}
          type="button"
          className={`role-toggle__button ${role === option ? 'is-active' : ''}`}
          onClick={() => setRole(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

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
  const strength = [value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;

  return (
    <div className={`auth-field auth-field--password strength-${strength} ${focused ? 'is-focused' : ''} ${hasValue ? 'has-value' : ''}`}>
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
          autoComplete="new-password"
          className="auth-field__input"
        />
        <button type="button" className="auth-field__toggle" onClick={() => setShow((current) => !current)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOpenIcon /> : <EyeOffIcon />}
        </button>
      </div>
      {hasValue && (
        <div className="password-strength">
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className={`password-strength__bar ${level <= strength ? 'is-active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const { theme } = useTheme();
  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const initialFormData = {
    fullname: '',
    email: '',
    contact: '',
    password: '',
  };

  const [role, setRole] = useState('user');
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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
    const data = await handleRegister({
      fullname: formData.fullname,
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      isSeller: role === 'seller',
    });

    if (data?.success) {
      setFormData(initialFormData);
      setRole('user');
      navigate('/login');
    }
  };

  return (
    <div className={`auth-page register-page ${mounted ? 'is-mounted' : ''}`} data-theme={theme}>
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
          <p className="auth-page__eyebrow">Create Your Store Access</p>
          <h1 className="auth-page__title">
            Shop smarter.
            <br />
            <em>Sell faster.</em>
          </h1>
          <p className="auth-page__description">
            Create your SNITCH account to discover new arrivals, manage orders, and unlock seller tools from one place.
          </p>
          <div className="auth-page__benefits">
            {['Fresh Arrivals', 'Secure Checkout', 'Seller Dashboard'].map((item) => (
              <div key={item} className="auth-page__benefit">
                <div className="auth-page__benefit-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="auth-page__hero-card">
            <div className="auth-page__hero-card-header">
              <span className="auth-page__hero-card-label">Commerce Snapshot</span>
              <span className="auth-page__hero-card-badge">Ready</span>
            </div>
            <div className="auth-page__metrics">
              <div className="auth-page__metric">
                <strong>5K+</strong>
                <span>active shoppers</span>
              </div>
              <div className="auth-page__metric">
                <strong>48h</strong>
                <span>fast dispatch flow</span>
              </div>
              <div className="auth-page__metric">
                <strong>Seller</strong>
                <span>catalog control tools</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-page__copyright">© 2026 Snitch Fashion Group</div>
      </div>

      <div className="auth-page__panel">
        <div className="auth-page__panel-line auth-page__panel-line--top" />
        <div className="auth-page__panel-line auth-page__panel-line--side" />

        <Link to="/" className="auth-page__close-link" aria-label="Close register page">
          ×
        </Link>

        <div className="auth-page__panel-intro">
          <p className="auth-page__panel-eyebrow">Register</p>
          <h2 className="auth-page__panel-title">Create Account</h2>
          <p className="auth-page__panel-subtitle">Start shopping or selling on SNITCH in a few quick steps.</p>
        </div>

        <div className="auth-page__role-toggle">
          <RoleToggle role={role} setRole={setRole} />
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <InputField id="name" label="Full Name" name="fullname" value={formData.fullname} onChange={handleChange} />
          <InputField id="email" label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} />
          <InputField id="phone" label="Contact Number" name="contact" suffix="+91" value={formData.contact} onChange={handleChange} />
          <PasswordInput id="password" label="Password" name="password" value={formData.password} onChange={handleChange} />

          <button id="create-account-btn" type="submit" className="auth-submit-button">
            Create Account
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__label">Or signup with</span>
          <div className="auth-divider__line" />
        </div>

        <div className="auth-socials">
          {[GoogleIcon, AppleIcon].map((Icon, index) => (
            <a key={index} href={`${AUTH_BASE_URL}/google`} className="auth-social-button" aria-label="Sign up with social provider">
              <Icon />
            </a>
          ))}
        </div>

        <p className="auth-footer-note">
          Already have an account?{' '}
          <Link to="/login" className="auth-inline-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
