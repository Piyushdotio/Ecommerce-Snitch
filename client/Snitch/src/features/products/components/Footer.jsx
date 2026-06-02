import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';


const Footer = () => {
  return (
    <footer className="home-footer">
      <div className="footer-columns-grid">
        <div className="footer-column brand-column">
          <h2 className="footer-logo">SNITCH</h2>
          <p className="footer-brand-desc">
            Defining the future of luxury streetwear through high-contrast minimalism and architectural precision.
          </p>
          <div className="footer-social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
              <i className="ri-instagram-line"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
              <i className="ri-twitter-x-line"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
              <i className="ri-global-line"></i>
            </a>
          </div>
        </div>

        <div className="footer-column links-column">
          <h4 className="column-title">Shop</h4>
          <Link className="footer-link" to="/">Collections</Link>
          <Link className="footer-link" to="/">New Arrivals</Link>
          <Link className="footer-link" to="/">Essentials</Link>
        </div>

        <div className="footer-column links-column">
          <h4 className="column-title">Support</h4>
          <Link className="footer-link" to="/">Privacy Policy</Link>
          <Link className="footer-link" to="/">Terms of Service</Link>
          <Link className="footer-link" to="/">Shipping & Returns</Link>
        </div>

        <div className="footer-column newsletter-column">
          <h4 className="column-title">Newsletter</h4>
          <p className="newsletter-text">Join the exclusive circle for early access and collection drops.</p>
          <div className="newsletter-input-wrapper">
            <input
              className="newsletter-email-input"
              placeholder="EMAIL ADDRESS"
              type="email"
            />
            <button onClick={() => alert("Subscribed!")} className="newsletter-submit-btn" aria-label="Subscribe">
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span className="copyright-text">© 2026 SNITCH. ALL RIGHTS RESERVED.</span>
        <div className="payment-icons">
          <span className="payment-logo">Visa</span>
          <span className="payment-logo">Mastercard</span>
          <span className="payment-logo">Apple Pay</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
