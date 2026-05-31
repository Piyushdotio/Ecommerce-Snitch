import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hook/useProduct';
import { Link,useNavigate } from 'react-router-dom';
import '../pages/style/Home.scss';

const getCategory = (product) => {
  if (product.category) return product.category;
  const text = `${product.title} ${product.description}`.toLowerCase();
  if (text.includes("laptop") || text.includes("macbook") || text.includes("computer") || text.includes("pc")) return "Laptops";
  if (text.includes("blazer") || text.includes("jacket") || text.includes("coat") || text.includes("outerwear")) return "Outerwear";
  if (text.includes("tee") || text.includes("t-shirt") || text.includes("shirt") || text.includes("top")) return "Essential Tees";
  if (text.includes("pant") || text.includes("trouser") || text.includes("jeans") || text.includes("denim")) return "Denim";
  if (text.includes("shoe") || text.includes("sneaker") || text.includes("runner") || text.includes("boot") || text.includes("footwear")) return "Footwear";
  return "Essential Tees"; // default
};

const formatPrice = (amount, currency) => {
  const symbolMap = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  const symbol = symbolMap[currency] || symbolMap["INR"];
  return `${symbol} ${Number(amount).toLocaleString("en-IN")}`;
};

const Home = () => {
  const products = useSelector((state) => state.product.products);
  const { handleallproducts } = useProduct();
  const navigate=useNavigate()
  
  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    handleallproducts();
  }, [handleallproducts]);

  const dbProducts = Array.isArray(products) ? products : [];

  // Filter products by category and search query
  const filteredProducts = dbProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      getCategory(product).toLowerCase() === selectedCategory.toLowerCase();

    const title = product.title?.toLowerCase() || "";
    const desc = product.description?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (e, productTitle) => {
    e.stopPropagation();
    setCartCount(prev => prev + 1);
    alert(`Added ${productTitle} to Cart!`);
  };

  return (
    <div className="home-page-container" data-theme={theme}>
      {/* Header */}
      <header className="home-header">
        <div className="header-content-wrapper">
          <div className="header-left">
            <Link to="/" className="logo-brand">
              SNITCH
            </Link>
            <nav className="desktop-nav">
              <a href="#shop" className="nav-link">Collections</a>
              <a href="#shop" className="nav-link">New Arrivals</a>
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
              <a href="#shop" className="action-icon-link">
                <span className="material-symbols-outlined">search</span>
              </a>
              <button onClick={() => alert("Cart panel coming soon!")} className="action-icon-link cart-button">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span className="cart-badge">{cartCount}</span>
              </button>
              <Link to="/login" className="action-icon-link">
                <span className="material-symbols-outlined">person</span>
              </Link>
            </div>
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Collections</a>
            <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">New Arrivals</a>
            <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Seller Dashboard</Link>
            <div className="divider"></div>
            <div className="mobile-actions">
              {/* Theme Toggle in Mobile Nav */}
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="mobile-action-item theme-toggle-btn">
                <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}></i>
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button onClick={() => { setMobileMenuOpen(false); alert("Cart panel coming soon!"); }} className="mobile-action-item">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>Cart ({cartCount})</span>
              </button>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-action-item">
                <span className="material-symbols-outlined">person</span>
                <span>Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="home-main-content">
        {/* Search & Filter Toolbar */}
        <section id="shop" className="search-filter-toolbar">
          <div className="toolbar-content-wrapper">
            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <span className="material-symbols-outlined search-bar-icon">search</span>
              <input 
                type="text"
                className="search-bar-input"
                placeholder="SEARCH PIECES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters Row */}
            <div className="categories-filter-row">
              {["All", "Outerwear", "Essential Tees", "Denim", "Footwear", "Laptops"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`filter-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="products-grid-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-catalog-state">
              <span className="material-symbols-outlined empty-icon">sentiment_dissatisfied</span>
              <h3 className="empty-title">No items found</h3>
              <p className="empty-desc">
                We couldn't find any products matching your selection. Try adjusting your search term.
              </p>
            </div>
          ) : (
            <div className="products-cards-grid">
              {filteredProducts.map((product) => {
                const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80";
                const altText = product.images?.[0]?.alt || product.title;
                const price = product.price?.amount || 0;
                const currency = product.price?.currency || "INR";
                const cat = getCategory(product);

                return (
                  <div 
                    onClick={()=>navigate(`product/${product._id}`)}
                  key={product._id} className="product-item-card">
                    <div className="product-image-container">
                      <img 
                        className="product-card-img" 
                        alt={altText}
                        src={imageUrl}
                        loading="lazy"
                      />
                      <div className="product-quick-add-overlay">
                        <button 
                          onClick={(e) => handleQuickAdd(e, product.title)}
                          className="quick-add-button"
                        >
                          Quick Add +
                        </button>
                      </div>
                      <span className="product-category-badge">
                        {cat}
                      </span>
                    </div>
                    
                    <div className="product-card-details">
                      <div className="product-info-wrapper">
                        <h3 className="product-info-title">
                          {product.title}
                        </h3>
                        <p className="product-info-description">
                          {product.description}
                        </p>
                      </div>
                      <span className="product-info-price">
                        {formatPrice(price, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Brand Feature Section */}
        <section className="studio-brand-section">
          <div className="studio-content-wrapper">
            <div className="studio-left-media">
              <img 
                className="studio-media-img" 
                alt="Minimalist boutique experience" 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80"
              />
              <div className="studio-floating-quote">
                <p className="quote-text">
                  "Style is a way to say who you are without having to speak."
                </p>
                <span className="quote-author">— Rachel Zoe</span>
              </div>
            </div>
            <div className="studio-right-details">
              <span className="studio-subtitle">Behind the Brand</span>
              <h2 className="studio-title">THE STUDIO EXPERIENCE</h2>
              <p className="studio-description">
                Our design philosophy is anchored in the collision of avant-garde structure and everyday utility. Every piece is a testament to the pursuit of perfection, prioritizing premium materials and architectural silhouettes.
              </p>
              <button onClick={() => alert("About process coming soon!")} className="studio-action-link">
                Explore Our Process
                <span className="material-symbols-outlined arrow-icon">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
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
                <span className="material-symbols-outlined">public</span>
              </a>
              <a href="#" className="social-icon-btn">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>
          
          <div className="footer-column links-column">
            <h4 className="column-title">Shop</h4>
            <a className="footer-link" href="#">Collections</a>
            <a className="footer-link" href="#">New Arrivals</a>
            <a className="footer-link" href="#">Essentials</a>
          </div>
          
          <div className="footer-column links-column">
            <h4 className="column-title">Support</h4>
            <a className="footer-link" href="#">Privacy Policy</a>
            <a className="footer-link" href="#">Terms of Service</a>
            <a className="footer-link" href="#">Shipping & Returns</a>
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
                <span className="material-symbols-outlined">arrow_right_alt</span>
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

export default Home;
