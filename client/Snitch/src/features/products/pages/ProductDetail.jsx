import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../hook/useProduct.js";
import "../pages/style/productDetail.scss";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { handlegetProductById } = useProduct();

  // Theme state (default to dark to match Snitch styling)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    if (!productId) return;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await handlegetProductById(productId);
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProductDetails();
    return () => {
      isMounted = false;
    };
  }, [productId, handlegetProductById]);

  // Demo fallback product with all required details
  const displayProduct = product || {
    title: "Men's Navy Blue & White Checked Cargo Shirt",
    description: "Elevate your casual rotation with this premium navy blue and white checked cargo shirt. Crafted from 100% breathable organic cotton, it features double chest utility pockets, button cuffs, and a classic curved hem. Pigment-washed for a soft vintage feel from day one.",
    price: { amount: 1499, currency: "INR" },
    originalPrice: 3699,
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        alt: "Front View",
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        alt: "Side View",
      },
      {
        url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800",
        alt: "Back View",
      },
      {
        url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
        alt: "Detail View",
      },
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
  };

  // Safe checks to prevent runtime errors
  const productImages = displayProduct.images && displayProduct.images.length > 0
    ? displayProduct.images
    : [
        {
          url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
          alt: "Default View",
        }
      ];

  const productSizes = displayProduct.sizes || ["S", "M", "L", "XL", "2XL"];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleAddToCart = () => {
    setAddedSuccess(true);
    setCartCount((prev) => prev + 1);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    alert(`Redirecting to checkout for ${displayProduct.title} (Size: ${selectedSize})`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  const discount = displayProduct.originalPrice && displayProduct.price?.amount
    ? Math.round(
        ((displayProduct.originalPrice - displayProduct.price.amount) /
          displayProduct.originalPrice) *
          100,
      )
    : 0;

  if (loading) {
    return (
      <div className="product-detail-skeleton" data-theme={theme}>
        <i className="ri-loader-4-line spinner"></i>
        <span>Loading Product Details...</span>
      </div>
    );
  }

  return (
    <div className="product-detail-page-container" data-theme={theme}>
      {/* Header */}
      <header className="home-header">
        <div className="header-content-wrapper">
          <div className="header-left">
            <Link to="/" className="logo-brand">
              SNITCH
            </Link>
            <nav className="desktop-nav">
              <Link to="/" className="nav-link">Collections</Link>
              <Link to="/" className="nav-link">New Arrivals</Link>
              <Link to="/seller/dashboard" className="nav-link seller-link">
                Seller Dashboard
              </Link>
            </nav>
          </div>
          <div className="header-right">
            <div className="desktop-actions">
              {/* Theme Toggle Button */}
              <button onClick={toggleTheme} className="action-icon-link theme-toggle-btn" title="Toggle Light/Dark Mode">
                <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}></i>
              </button>
              <Link to="/" className="action-icon-link">
                <i className="ri-search-line"></i>
              </Link>
              <button onClick={() => alert("Cart panel coming soon!")} className="action-icon-link cart-button">
                <i className="ri-shopping-cart-2-line"></i>
                <span className="cart-badge">{cartCount}</span>
              </button>
              <Link to="/login" className="action-icon-link">
                <i className="ri-user-line"></i>
              </Link>
            </div>
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Collections</Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">New Arrivals</Link>
            <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Seller Dashboard</Link>
            <div className="divider"></div>
            <div className="mobile-actions">
              {/* Theme Toggle in Mobile Nav */}
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="mobile-action-item theme-toggle-btn">
                <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}></i>
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button onClick={() => { setMobileMenuOpen(false); alert("Cart panel coming soon!"); }} className="mobile-action-item">
                <i className="ri-shopping-cart-2-line"></i>
                <span>Cart ({cartCount})</span>
              </button>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-action-item">
                <i className="ri-user-line"></i>
                <span>Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main product detail container */}
      <main className="product-detail-main">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to="/">Shop</Link>
          <span> / </span>
          <span>{displayProduct.title}</span>
        </nav>

        {/* Main Grid */}
        <div className="product-main">
          {/* Left: Gallery */}
          <div className="gallery-section">
            <div className="thumbnails">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${activeImageIndex === idx ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img.url} alt={img.alt || `Thumbnail ${idx}`} />
                </button>
              ))}
            </div>

            <div className="main-image-wrapper">
              <img
                src={productImages[activeImageIndex]?.url}
                alt={productImages[activeImageIndex]?.alt || displayProduct.title}
                className="main-image"
              />

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button className="arrow-btn prev" onClick={handlePrevImage}>
                    ‹
                  </button>
                  <button className="arrow-btn next" onClick={handleNextImage}>
                    ›
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="image-counter">
                {activeImageIndex + 1} / {productImages.length}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="info-section">
            {/* Brand & Title */}
            <div className="product-header">
              <span className="brand">LIMITED STREETWEAR</span>
              <h1 className="product-title">{displayProduct.title}</h1>
            </div>

            {/* Price & Rating */}
            <div className="price-rating-row">
              <div className="price">
                <span className="current">
                  {formatPrice(displayProduct.price?.amount)}
                </span>
                {displayProduct.originalPrice && (
                  <>
                    <span className="original">
                      {formatPrice(displayProduct.originalPrice)}
                    </span>
                    <span className="discount">{discount}% OFF</span>
                  </>
                )}
              </div>
              <div className="rating">
                <span className="stars">★ 4.6</span>
                <span className="reviews">| 373 Reviews</span>
              </div>
            </div>

            {/* Description */}
            <div className="product-description">
              <p>{displayProduct.description}</p>
            </div>

            {/* Material */}
            <div className="material-badge">100% Organic Heavyweight Cotton</div>

            {/* Color Selection */}
            <div className="selection-block">
              <label>Select Colour</label>
              <div className="color-swatches">
                {[
                  { name: "Vintage Black", hex: "#1A1A1A" },
                  { name: "Off White", hex: "#F5F5F0" },
                  { name: "Burnt Orange", hex: "#E05A00" },
                ].map((color, idx) => (
                  <button
                    key={idx}
                    className={`swatch ${selectedColor === idx ? "active" : ""}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(idx)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="selection-block">
              <label>Select Size</label>
              <div className="size-buttons">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <a href="#" className="size-guide">
                Size guide ›
              </a>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className={`btn-add-bag ${addedSuccess ? "success" : ""}`}
                onClick={handleAddToCart}
              >
                {addedSuccess ? "☑ ADDED TO CART" : "ADD TO CART"}
              </button>
              <button className="btn-buy-now" onClick={handleBuyNow}>
                BUY NOW
              </button>
              <button className="btn-heart">♡</button>
            </div>

            {/* Shipping, Returns & Authenticity Details */}
            <div className="product-meta-specs">
              <div className="meta-item">⚡ <strong>Shipping:</strong> Ships within 2-3 business days</div>
              <div className="meta-item">🔄 <strong>Returns:</strong> 14-day hassle-free returns available</div>
              <div className="meta-item">🛡️ <strong>Authenticity:</strong> 100% Certified Authentic & Genuine Product</div>
            </div>

            {/* Offers Banner */}
            <div className="offers-section">
              <p className="offers-title">Save extra with these offers</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-columns-grid">
          <div className="footer-column brand-column">
            <h2 className="footer-logo">SNITCH</h2>
            <p className="footer-brand-desc">
              Defining the future of luxury streetwear through high-contrast minimalism and architectural precision.
            </p>
            <div className="footer-social-links">
              <a href="#" className="social-icon-btn">
                <i className="ri-global-line"></i>
              </a>
              <a href="#" className="social-icon-btn">
                <i className="ri-instagram-line"></i>
              </a>
              <a href="#" className="social-icon-btn">
                <i className="ri-twitter-x-line"></i>
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
              <button onClick={() => alert("Subscribed!")} className="newsletter-submit-btn">
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
    </div>
  );
};

export default ProductDetail;
