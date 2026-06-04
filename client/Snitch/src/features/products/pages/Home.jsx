import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hook/useProduct';
import { useCart } from '../../Cart/hook/useCart';
import { Link,useNavigate } from 'react-router-dom';
import './style/Home.scss';
import Footer from '../components/Footer';
import { useTheme } from '../../../app/ThemeContext';


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

const categoryCards = [
  { id: "ALL", name: "All", title: "ALL PRODUCTS", img: "/category_all.webp" },
  { id: "SHIRTS", name: "Essential Tees", title: "SHIRTS", img: "/category_shirts.webp" },
  { id: "TROUSERS", name: "Denim", title: "TROUSERS", img: "/category_trousers.webp" },
  { id: "POLOS", name: "Essential Tees", title: "POLOS", img: "/category_polos.webp" },
  { id: "JEANS", name: "Denim", title: "JEANS", img: "/category_jeans.webp" },
  { id: "CARGOS", name: "Denim", title: "CARGOS", img: "/category_cargos.webp" },
  { id: "T-SHIRTS", name: "Essential Tees", title: "T-SHIRTS", img: "/category_tshirts.webp" },
  { id: "SHORTS", name: "Denim", title: "SHORTS", img: "/category_shorts.webp" },
  { id: "PLUS SIZE", name: "Essential Tees", title: "PLUS SIZE", img: "/category_plus_size.webp", badge: "3XL TO 6XL" },
  { id: "SHOES", name: "Footwear", title: "SHOES", img: "/category_shoes.webp", badge: "JUST LAUNCHED" }
];

const heroSlides = [
  {
    id: 1,
    title: "",
    subtitle: "SUMMER SHIRTS",
    img: "/shirts_slide.png",
    buttonText: "STARTING AT ₹899"
  },
  {
    id: 2,
    title: "",
    subtitle: "ARCHITECT TROUSERS",
    img: "/architect_slide.png",
    buttonText: "VIEW COLLECTION"
  },
  {
    id: 3,
    title: "",
    subtitle: "STREETWEAR NEW DROPS",
    img: "/streetwear_slide.png",
    buttonText: "SHOP LATEST"
  },
  {
    id: 4,
    title: "MUST-HAVE",
    subtitle: "DENIMS",
    img: "/denim_slide.png",
    options: ["BAGGY", "RELAXED", "STRAIGHT"]
  }
];


const Home = () => {
  const products = useSelector((state) => state.product.products);
  const { handleallproducts } = useProduct();
  const { handleGetCart, handleAddItem } = useCart();
  const cartItems = useSelector((state) => state.cart.items || []);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const user = useSelector((state) => state.auth?.user);
  const isSeller = user?.role === "seller";
  const navigate=useNavigate()
  
  const { theme, toggleTheme } = useTheme();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeCategoryCard, setActiveCategoryCard] = useState("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const sliderRef = useRef(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert(`Thank you! ${newsletterEmail} has been added to the Insiders Club.`);
      setNewsletterEmail("");
    }
  };

  const handleCategoryClick = (card) => {
    setActiveCategoryCard(card.id);
    setSelectedCategory(card.name);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() !== "") {
      setSelectedCategory("All");
      setActiveCategoryCard("ALL");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (sliderRef.current) {
        const track = sliderRef.current;
        const slideItem = track.querySelector('.hero-slide-item');
        if (slideItem) {
          const slideWidth = slideItem.clientWidth + 4; // slide width + gap (4px)
          const currentScroll = track.scrollLeft;
          const maxScroll = track.scrollWidth - track.clientWidth;
          
          if (currentScroll >= maxScroll - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            track.scrollTo({ left: currentScroll + slideWidth, behavior: 'smooth' });
          }
        }
      }
    }, 4000); // Auto-scroll every 4 seconds
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    handleallproducts();
  }, [handleallproducts]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        await handleGetCart();
      } catch (err) {
        // Silently fail if user is not authenticated
      }
    };
    fetchCart();
  }, []);

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

  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    try {
      let variantId = undefined;
      const sizeVal = "M"; // Always default size medium

      if (product.variants && product.variants.length > 0) {
        const mediumVariant = product.variants.find((v) => {
          if (!v.attributes) return false;
          if (typeof v.attributes.get === 'function') {
            const sz = v.attributes.get('size') || v.attributes.get('Size');
            return sz && String(sz).toUpperCase() === 'M';
          }
          return Object.entries(v.attributes).some(
            ([key, val]) => key.toLowerCase() === "size" && String(val).toUpperCase() === "M"
          );
        });

        if (mediumVariant) {
          variantId = mediumVariant._id;
        }
      }

      await handleAddItem({
        productId: product._id,
        variantId,
        size: sizeVal
      });
      alert(`Added ${product.title} to Cart!`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Please login to add items to cart.");
      navigate("/login");
    }
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
              {isSeller && (
                <Link to="/seller/dashboard" className="nav-link seller-link">
                  Seller Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="header-right">
            <div className="desktop-actions">
              {/* Search Bar in Header */}
              <div className="header-search-bar">
                <span className="material-symbols-outlined search-icon">search</span>
                <input 
                  type="text"
                  placeholder="SEARCH..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const element = document.getElementById("shop");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }}
                />
              </div>

              {/* Theme Toggle Button */}
              <button onClick={toggleTheme} className="action-icon-link theme-toggle-btn" title="Toggle Light/Dark Mode">
                <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}></i>
              </button>
              {!isSeller && (
                <button onClick={() => navigate("/cart")} className="action-icon-link cart-button" title="View Cart">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <span className="cart-badge">{cartCount}</span>
                </button>
              )}
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
            {/* Search Bar on Mobile */}
            <div className="mobile-search-bar">
              <span className="material-symbols-outlined search-icon">search</span>
              <input 
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMobileMenuOpen(false);
                    const element = document.getElementById("shop");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
              />
            </div>
            <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Collections</a>
            <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">New Arrivals</a>
            {isSeller && (
              <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Seller Dashboard</Link>
            )}
            <div className="divider"></div>
            <div className="mobile-actions">
              {/* Theme Toggle in Mobile Nav */}
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="mobile-action-item theme-toggle-btn">
                <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}></i>
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              {!isSeller && (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/cart"); }} className="mobile-action-item">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <span>Cart ({cartCount})</span>
                </button>
              )}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-action-item">
                <span className="material-symbols-outlined">person</span>
                <span>Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="home-main-content">
        {/* Hero Slider Section */}
        <section className="hero-slider-section">
          <div className="hero-slider-track" ref={sliderRef}>
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className="hero-slide-item">
                <img src={slide.img} alt={slide.subtitle} className="hero-slide-img" />
                
                {slide.options && (
                  <div className="slide-center-options">
                    {slide.options.map((opt) => (
                      <span key={opt} className="slide-option-tag">{opt}</span>
                    ))}
                  </div>
                )}

                <div className="hero-slide-overlay">
                  <div className="slide-content-text">
                    {slide.title && <span className="slide-title-prefix">{slide.title}</span>}
                    <h2 className="slide-title-main">{slide.subtitle}</h2>
                  </div>
                  {slide.buttonText && (
                    <button className="slide-action-btn">{slide.buttonText}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Search & Filter Toolbar */}
        <section id="shop" className="search-filter-toolbar">
          <div className="toolbar-content-wrapper">
            {/* Category Grid Section */}
            <div className="category-grid-container">
              <div className="category-section-title-top">
                <span>FEATURED CATEGORIES</span>
              </div>
              <div className="category-grid">
                {categoryCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCategoryClick(card)}
                    className={`category-card ${activeCategoryCard === card.id ? 'active' : ''}`}
                  >
                    <div className="category-card-top">
                      <span className="category-card-title">{card.title}</span>
                      {card.badge && <span className="category-card-badge">{card.badge}</span>}
                    </div>
                    <div className="category-card-image-wrapper">
                      <img src={card.img} alt={card.title} className="category-card-image" />
                    </div>
                    <div className="category-card-fade" />
                  </div>
                ))}
              </div>
              <div className="category-section-title">
                <span>MATCH THE MOOD</span>
              </div>
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
                          onClick={(e) => handleQuickAdd(e, product)}
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

        {/* Trend Spotlight Section */}
        <section className="trend-spotlight-section">
          <div className="spotlight-header">
            <span className="spotlight-subtitle">Curated Trends</span>
            <h2 className="spotlight-title">TREND SPOTLIGHT</h2>
          </div>
          <div className="spotlight-grid">
            <div className="spotlight-card">
              <div className="spotlight-image-wrapper">
                <img src="/spotlight_gray.webp" alt="The Modern Minimalist" className="spotlight-img" />
              </div>
              <div className="spotlight-card-content">
                <h3 className="spotlight-card-title">THE MODERN MINIMALIST</h3>
                <p className="spotlight-card-desc">Sartorial elegance meets structured everyday utility.</p>
                <button className="spotlight-card-btn" onClick={() => alert("Spotlight collection coming soon!")}>
                  EXPLORE <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="spotlight-card">
              <div className="spotlight-image-wrapper">
                <img src="/spotlight_green.webp" alt="Earthy Tonals" className="spotlight-img" />
              </div>
              <div className="spotlight-card-content">
                <h3 className="spotlight-card-title">EARTHY TONALS</h3>
                <p className="spotlight-card-desc">Earthy olive and sage hues crafted in breathable fabrics.</p>
                <button className="spotlight-card-btn" onClick={() => alert("Spotlight collection coming soon!")}>
                  EXPLORE <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="spotlight-card">
              <div className="spotlight-image-wrapper">
                <img src="/spotlight_yellow.webp" alt="Summer Resort" className="spotlight-img" />
              </div>
              <div className="spotlight-card-content">
                <h3 className="spotlight-card-title">SUMMER RESORT</h3>
                <p className="spotlight-card-desc">Relaxed silhouettes tailored for the ultimate holiday vibe.</p>
                <button className="spotlight-card-btn" onClick={() => alert("Spotlight collection coming soon!")}>
                  EXPLORE <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
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

        {/* Brand Values Section */}
        <section className="brand-values-section">
          <div className="values-grid">
            <div className="value-item">
              <span className="material-symbols-outlined value-icon">local_shipping</span>
              <h4 className="value-title">FREE SHIPPING</h4>
              <p className="value-desc">On all orders above ₹999 across India.</p>
            </div>
            <div className="value-item">
              <span className="material-symbols-outlined value-icon">assignment_return</span>
              <h4 className="value-title">EASY RETURNS</h4>
              <p className="value-desc">Hassle-free returns and exchange policy.</p>
            </div>
            <div className="value-item">
              <span className="material-symbols-outlined value-icon">workspace_premium</span>
              <h4 className="value-title">PREMIUM QUALITY</h4>
              <p className="value-desc">Architectural silhouettes and custom fabrics.</p>
            </div>
            <div className="value-item">
              <span className="material-symbols-outlined value-icon">security</span>
              <h4 className="value-title">SECURE CHECKOUT</h4>
              <p className="value-desc">100% encrypted checkout with top portals.</p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <div className="newsletter-content-box">
            <span className="newsletter-tag">Join the Movement</span>
            <h2 className="newsletter-title">THE INSIDERS CLUB</h2>
            <p className="newsletter-description">
              Subscribe for early access to collection drops, exclusive offers, and behind-the-scenes content.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                className="newsletter-input" 
                placeholder="ENTER YOUR EMAIL..." 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                JOIN NOW
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
