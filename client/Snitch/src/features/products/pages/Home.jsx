import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hook/useProduct';
import { Link } from 'react-router-dom';
import './Home.scss';

const sampleProducts = [
  {
    _id: "69f444dd39d4ac4b32b542ee",
    title: "newlaptop",
    description: "Goodproduct - high performance minimalist design",
    images: [
      {
        url: "https://ik.imagekit.io/rhxq2hk1a/Snitch/ChatGPT_Image_Apr_8__2026__04_58_52_PM_XcXdW7_x5.png",
        alt: "newlaptop"
      }
    ],
    price: {
      amount: 55000,
      currency: "INR"
    },
    category: "Laptops"
  },
  {
    _id: "sample-1",
    title: "Architect Blazer",
    description: "Double-breasted wool blend oversized silhouette",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK8scQpBiO7tXpFVH-8OH4sDBOOok_LJaTWRPwtVdchag5vOBCcbh-HQMU8E3nj109sncVAPA5CpRldFVTDzJlc1jVHkrCfJs7p1uZ7ZgGKdBT38G1sgMaBEZCwr4golCzoQ40ajelLZUaQ4jKvEIRSjIB7NSfAdq_TYE5RB1Botwz-t-hj_DVGwSM4-KpLDKpjankgCJsmAqYILl4PPQ-kpDtCHc4wRgb7go6_vGgwpccUOTZDxmglXK1BzA5gYceSMnVUYuObnI",
        alt: "Architect Blazer"
      }
    ],
    price: {
      amount: 8999,
      currency: "INR"
    },
    category: "Outerwear"
  },
  {
    _id: "sample-2",
    title: "Tapered Trousers",
    description: "Technical stretch fabric with precise pleats",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAj0BPYcFusOLR0g5kOA65GX_w6CNhqOjsTPz69MqClEQgrNWxKXNyU7jj2_ejhRC5LJjULNFZiy5JTvyvG6gs-0C3ybQKvivZOsTM8nVQ3vSPIp6G999jamrS54RtMEZUjPlZTSG0dCyzIT1iu_Kj1QfnufVXQ6wnGkxN8WVv-qfkOoy_eAgVytFGR3e1NpFH68bbxlNe2-zOv7P4BB1z-TKpW-LepVAYxOGlC3XO49A6_Ya5f9XBbnVELgpGc8xME9Ifaf_RFtdM",
        alt: "Tapered Trousers"
      }
    ],
    price: {
      amount: 4499,
      currency: "INR"
    },
    category: "Denim"
  },
  {
    _id: "sample-3",
    title: "Noir Core Tee",
    description: "280 GSM Heavyweight Cotton oversized fit",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMrV-9nTuhm7LyMjccLFWEobe56IwEXjFMO1KiaSqPEhsMz3aVpaX2ryULo2b3XosToaz3xOffMY-CwC5xN6XSk0FakbUfXHH8jSzNYAhIZBVYW6InwlTKLNdSvY3Kbp2G5sMB6fhWePlpAf-XHLvwNVy3a92_JnuFYyoN2gahc7uMpvJEiTbrpAKWUxSplAyhBf2jFoqJrPVUhMCP2UXl_ZgolX-i-YTU73uIbmh6j5ofAK_whkqLxwJxk5jqEtvUKud-HPgGaoI",
        alt: "Noir Core Tee"
      }
    ],
    price: {
      amount: 2299,
      currency: "INR"
    },
    category: "Essential Tees"
  },
  {
    _id: "sample-4",
    title: "Velocity Runner",
    description: "Premium Nappa Leather custom running sole",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC51zrfX8MDIZnvG7GFS_Fc_-f6EPWdOcUxK2U_JDZZum7TIlY9PnmltNLqHJzmUHBbjIic1usmmpZ2b2S1IbV1MsCl9RrMlvRTJxP25kiDyuW9tXHXPRB2tUsjhcx8i7jR-76mtJkg1PVe83kuK3KGzD8uAaOaEpl4fzFz_R1OvfPz90QK9lIsBbaYvxLRiuqEl8sHJlZXwaMNvB344GLAXvy6fNL5rEU7rDy3avXnnCr-RvzvG-TT_b6075Qq83EIXWZu_NvXQyI",
        alt: "Velocity Runner"
      }
    ],
    price: {
      amount: 7499,
      currency: "INR"
    },
    category: "Footwear"
  }
];

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

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    handleallproducts();
  }, [handleallproducts]);

  // Combine database products with sample products to ensure there is rich data
  const combinedProducts = [];
  const dbProducts = Array.isArray(products) ? products : [];
  
  // To avoid duplicates, check if a product with the same _id already exists
  dbProducts.forEach(p => {
    combinedProducts.push(p);
  });
  
  sampleProducts.forEach(sp => {
    if (!combinedProducts.some(p => p._id === sp._id || p.title.toLowerCase() === sp.title.toLowerCase())) {
      combinedProducts.push(sp);
    }
  });

  // Filter products by category and search query
  const filteredProducts = combinedProducts.filter((product) => {
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
    <div className="home-page-container">
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
                  <div key={product._id} className="product-item-card">
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
