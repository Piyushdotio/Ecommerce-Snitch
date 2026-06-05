import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useProduct } from "../hook/useProduct.js";
import "./style/productDetail.scss";
import Footer from "../components/Footer";
import { useTheme } from "../../../app/ThemeContext";
import { useCart } from "../../Cart/hook/useCart.js";
import { useWishlist } from "../../Wishlist/hook/useWishlist.js";

const getDefaultAttributeValue = (product, key) => {
  if (!product) return null;
  const lowerKey = key.toLowerCase();

  if (lowerKey === 'color' || lowerKey === 'colour') {
    const title = (product.title || "").toLowerCase();
    const description = (product.description || "").toLowerCase();

    const commonColors = [
      "black", "white", "off-white", "offwhite", "grey", "gray",
      "orange", "yellow", "red", "blue", "green", "brown",
      "charcoal", "navy", "olive", "beige", "purple", "pink",
      "cream", "khaki", "maroon", "teal"
    ];

    // Find all matching colors and their index in the title
    let matches = [];
    commonColors.forEach(color => {
      const regex = new RegExp(`\\b${color}\\b`, 'g');
      let match;
      while ((match = regex.exec(title)) !== null) {
        matches.push({ color, index: match.index });
      }
    });

    if (matches.length > 0) {
      matches.sort((a, b) => a.index - b.index);
      const foundColor = matches[0].color;
      return foundColor.charAt(0).toUpperCase() + foundColor.slice(1);
    }

    // If not in title, search in description
    matches = [];
    commonColors.forEach(color => {
      const regex = new RegExp(`\\b${color}\\b`, 'g');
      let match;
      while ((match = regex.exec(description)) !== null) {
        matches.push({ color, index: match.index });
      }
    });

    if (matches.length > 0) {
      matches.sort((a, b) => a.index - b.index);
      const foundColor = matches[0].color;
      return foundColor.charAt(0).toUpperCase() + foundColor.slice(1);
    }

    // Default fallback to "Grey" so the default product shows as a grey color swatch
    return "Grey";
  }

  return null;
};

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { handlegetProductById } = useProduct();
  const { handleAddItem, handleGetCart } = useCart();
  const cartItems = useSelector((state) => state.cart.items || []);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const user = useSelector((state) => state.auth?.user);
  const isSeller = user?.role === "seller";
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { handleToggleWishlist, handleGetWishlist, isWishlisted } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [zoomProps, setZoomProps] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    setZoomProps({ show: true, x, y, bgX, bgY });
  };

  const handleMouseLeave = () => {
    setZoomProps((prev) => ({ ...prev, show: false }));
  };

  const handleMouseEnter = () => {
    setZoomProps((prev) => ({ ...prev, show: true }));
  };

  // Dynamic user-selected variant attributes state
  const [selectedAttributes, setSelectedAttributes] = useState({});

  const isInitialFetch = useRef(true);

  useEffect(() => {
    isInitialFetch.current = true;
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    if (!productId) return;

    const fetchProductDetails = async () => {
      try {
        if (isInitialFetch.current) {
          setLoading(true);
          isInitialFetch.current = false;
        }
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
    
    const fetchCartData = async () => {
      try {
        await handleGetCart();
      } catch (err) {
        // Silently fail if user is not authenticated
      }
    };
    fetchCartData();

    const fetchWishlist = async () => {
      try {
        await handleGetWishlist();
      } catch (err) {
        // Silently fail if user is not authenticated
      }
    };
    fetchWishlist();

    return () => {
      isMounted = false;
    };
  }, [productId, handlegetProductById, cartCount]);

  console.log(product, "product");
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

  // Collect dynamic attributes options from all available product variants
  const attributeOptions = {};
  if (displayProduct.variants && displayProduct.variants.length > 0) {
    displayProduct.variants.forEach((v) => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([key, val]) => {
          if (!attributeOptions[key]) {
            attributeOptions[key] = [];
          }
          if (!attributeOptions[key].includes(val)) {
            attributeOptions[key].push(val);
          }
        });
      }
    });

    // Add main product's default attribute values if they are not already present
    Object.keys(attributeOptions).forEach((key) => {
      const defaultValue = getDefaultAttributeValue(displayProduct, key);
      if (defaultValue && !attributeOptions[key].includes(defaultValue)) {
        // Prepend the default option so it shows first
        attributeOptions[key].unshift(defaultValue);
      }
    });
  }

  const hasSizeAttribute = Object.keys(attributeOptions).some(k => k.toLowerCase() === 'size');

  // Automatically initialize user-selected attributes with the first option
  useEffect(() => {
    if (Object.keys(attributeOptions).length > 0) {
      const initialAttrs = {};
      Object.entries(attributeOptions).forEach(([key, opts]) => {
        initialAttrs[key] = opts[0];
      });
      setSelectedAttributes(initialAttrs);
    }
  }, [product]);

  // Find the active variant matching currently selected attributes
  const getActiveVariant = () => {
    if (!displayProduct.variants || displayProduct.variants.length === 0) return null;
    return displayProduct.variants.find((v) => {
      if (!v.attributes) return false;
      return Object.entries(selectedAttributes).every(([key, val]) => {
        return String(v.attributes[key]).toLowerCase() === String(val).toLowerCase();
      });
    });
  };

  const activeVariant = getActiveVariant();


  // If a value is not available in the active variant, fall back to the main product values
  const currentPrice = (activeVariant && activeVariant.price && activeVariant.price.amount)
    ? activeVariant.price
    : displayProduct.price;

  const currentImages = (activeVariant && activeVariant.images && activeVariant.images.length > 0)
    ? activeVariant.images
    : displayProduct.images;

  const currentStock = (activeVariant && typeof activeVariant.stock === "number")
    ? activeVariant.stock
    : (displayProduct.stock !== undefined ? displayProduct.stock : 0);

  // Safe checks to prevent runtime errors on variant image list
  const productImages = currentImages && currentImages.length > 0
    ? currentImages
    : [
        {
          url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
          alt: "Default View",
        }
      ];

  const productSizes = displayProduct.sizes || ["S", "M", "L", "XL", "2XL"];

  // Reset active image index to 0 when active variant changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeVariant?._id]);

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

  const handleAddToCart = async () => {
    try {
      const pId = product?._id || displayProduct?._id;
      if (!pId) return;
      const variantId = activeVariant?._id;
      const sizeKey = Object.keys(selectedAttributes).find(k => k.toLowerCase() === 'size');
      const resolvedSize = sizeKey ? selectedAttributes[sizeKey] : selectedSize;
      const res = await handleAddItem({ 
        productId: pId, 
        variantId, 
        size: resolvedSize 
      });
      alert(res?.message || "Item added to cart successfully!");
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      alert("Failed to add item to cart: " + (err.message || err.error || JSON.stringify(err) || "Unknown error"));
    }
  };

  const handleBuyNow = () => {
    const specs = Object.entries(selectedAttributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    alert(`Redirecting to checkout for ${displayProduct.title} (${specs || `Size: ${selectedSize}`})`);
  };



  const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  
  const discount = displayProduct.originalPrice && currentPrice?.amount
    ? Math.round(
        ((displayProduct.originalPrice - currentPrice.amount) /
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
              {isSeller && (
                <Link to="/seller/dashboard" className="nav-link seller-link">
                  Seller Dashboard
                </Link>
              )}
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
              {!isSeller && (
                <button onClick={() => navigate("/cart")} className="action-icon-link cart-button" title="View Cart">
                  <i className="ri-shopping-cart-2-line"></i>
                  <span className="cart-badge">{cartCount}</span>
                </button>
              )}
              {!isSeller && (
                <button
                  onClick={() => navigate("/wishlist")}
                  className="action-icon-link"
                  title="View Wishlist"
                  style={{ fontSize: "20px", color: "inherit" }}
                >
                  <i className="ri-heart-line"></i>
                </button>
              )}
              {!isSeller && (
                <button
                  onClick={() => navigate("/orders")}
                  className="action-icon-link"
                  title="View Orders"
                  style={{ fontSize: "20px", color: "inherit" }}
                >
                  <i className="ri-file-list-3-line"></i>
                </button>
              )}
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
                  <i className="ri-shopping-cart-2-line"></i>
                  <span>Cart ({cartCount})</span>
                </button>
              )}
              {!isSeller && (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/wishlist"); }} className="mobile-action-item">
                  <i className="ri-heart-line"></i>
                  <span>Wishlist</span>
                </button>
              )}
              {!isSeller && (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/orders"); }} className="mobile-action-item">
                  <i className="ri-file-list-3-line"></i>
                  <span>Orders</span>
                </button>
              )}
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
        <nav className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle' }}>arrow_back</span>
            Home
          </Link>
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

            <div 
              className="main-image-wrapper"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              style={{ position: 'relative' }}
            >
              <img
                src={productImages[activeImageIndex]?.url}
                alt={productImages[activeImageIndex]?.alt || displayProduct.title}
                className="main-image"
              />

              {/* Circular Zoom Lens */}
              {zoomProps.show && (
                <div
                  className="product-zoom-lens"
                  style={{
                    position: 'absolute',
                    left: `${zoomProps.x - 75}px`,
                    top: `${zoomProps.y - 75}px`,
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.2)',
                    backgroundImage: `url(${productImages[activeImageIndex]?.url})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '250% 250%',
                    backgroundPosition: `${zoomProps.bgX}% ${zoomProps.bgY}%`,
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                />
              )}

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
              <div className="price" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span className="current">
                    {formatPrice(currentPrice?.amount)}
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
                
                {/* Visual Urgency Meter / Stock Progress Bar */}
                <div className="stock-urgency-wrapper" style={{ marginTop: "8px", width: "100%", maxWidth: "320px" }}>
                  <div className="stock-indicator" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.85rem", marginBottom: "4px" }}>
                    {currentStock <= 0 ? (
                      <span style={{ color: "#EF4444", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>error</span>
                        Out of Stock
                      </span>
                    ) : currentStock <= 5 ? (
                      <span style={{ color: "#F59E0B", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px", animation: "pulse 1.5s infinite" }}>local_fire_department</span>
                        Hurry! Only {currentStock} left in stock - selling fast!
                      </span>
                    ) : (
                      <span style={{ color: "#10B981", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span>
                        In Stock ({currentStock} items ready to ship)
                      </span>
                    )}
                  </div>
                  <div className="stock-bar-bg" style={{
                    width: "100%",
                    height: "6px",
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div className="stock-bar-fill" style={{
                      width: currentStock <= 0 ? "0%" : (currentStock <= 5 ? `${(currentStock / 5) * 50}%` : "100%"),
                      height: "100%",
                      background: currentStock <= 0 ? "transparent" : (currentStock <= 5 ? "#F59E0B" : "#10B981"),
                      borderRadius: "3px",
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>
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

            {/* Variant Option Selectors (Dynamic) */}
            {Object.keys(attributeOptions).length > 0 && (
              // Dynamic Attribute Swatches & Option Selectors based on variants
              Object.entries(attributeOptions).map(([key, options]) => {
                const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <div key={key} className="selection-block">
                    <label>Select {capitalizedKey}</label>
                    <div className="attribute-options-row" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                      {options.map((option) => {
                        const isActive = String(selectedAttributes[key]).toLowerCase() === String(option).toLowerCase();
                        const isColorKey = key.toLowerCase() === "color" || key.toLowerCase() === "colour";
                        
                        // Map of standard color strings to hex for swatches
                        const colorHexMap = {
                          black: "#1A1A1A",
                          white: "#F5F5F0",
                          offwhite: "#F5F5F0",
                          orange: "#E05A00",
                          yellow: "#EAB308",
                          red: "#EF4444",
                          blue: "#3B82F6",
                          green: "#10B981",
                          gray: "#6B7280",
                          grey: "#6B7280",
                          brown: "#8B4513",
                          charcoal: "#36454F",
                          navy: "#000080",
                          olive: "#808000",
                          beige: "#F5F5DC",
                          purple: "#800080",
                          pink: "#FFC0CB"
                        };
                        const hex = colorHexMap[option.toLowerCase().replace(/\s/g, "")] || null;

                        // Find variant for this specific option
                        const getOptionVariant = (optValue) => {
                          if (!displayProduct.variants) return null;
                          const targetAttrs = { ...selectedAttributes, [key]: optValue };
                          return displayProduct.variants.find((v) => {
                            if (!v.attributes) return false;
                            return Object.entries(targetAttrs).every(([k, val]) => {
                              return String(v.attributes[k]).toLowerCase() === String(val).toLowerCase();
                            });
                          });
                        };
                        
                        const optionVariant = getOptionVariant(option);
                        const optionStock = optionVariant ? optionVariant.stock : (displayProduct.stock !== undefined ? displayProduct.stock : 10);
                        const isOptionOutOfStock = optionStock <= 0;
                        const isLowStock = optionStock > 0 && optionStock <= 3;

                        if (isColorKey && hex) {
                          return (
                            <button
                              key={option}
                              className={`swatch ${isActive ? "active" : ""} ${isOptionOutOfStock ? "out-of-stock" : ""}`}
                              style={{ 
                                backgroundColor: hex,
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                border: isActive ? "2.5px solid var(--theme-text)" : "1px solid var(--theme-border)",
                                cursor: isOptionOutOfStock ? "not-allowed" : "pointer",
                                opacity: isOptionOutOfStock ? 0.35 : 1,
                                outline: "none",
                                position: "relative"
                              }}
                              onClick={() => !isOptionOutOfStock && setSelectedAttributes(prev => ({ ...prev, [key]: option }))}
                              title={isOptionOutOfStock ? `${option} (Out of Stock)` : (isLowStock ? `${option} (Only ${optionStock} left!)` : option)}
                            >
                              {isOptionOutOfStock && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  width: '100%',
                                  height: '2px',
                                  background: '#ef4444',
                                  transform: 'translate(-50%, -50%) rotate(45deg)'
                                }} />
                              )}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={option}
                            className={`size-btn ${isActive ? "active" : ""} ${isOptionOutOfStock ? "out-of-stock" : ""}`}
                            onClick={() => !isOptionOutOfStock && setSelectedAttributes(prev => ({ ...prev, [key]: option }))}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "4px",
                              cursor: isOptionOutOfStock ? "not-allowed" : "pointer",
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              position: "relative",
                              opacity: isOptionOutOfStock ? 0.35 : 1,
                              textDecoration: isOptionOutOfStock ? "line-through" : "none",
                              border: isActive ? "2px solid var(--accent-primary, #ff6b00)" : (isLowStock ? "1px dashed #F59E0B" : "1px solid var(--theme-border)")
                            }}
                            title={isOptionOutOfStock ? "Out of stock" : (isLowStock ? `Only ${optionStock} left!` : `${optionStock} in stock`)}
                          >
                            {option}
                            {isLowStock && (
                              <span style={{
                                position: 'absolute',
                                top: '-3px',
                                right: '-3px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#F59E0B'
                              }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {/* Fallback Size Selection if not provided by variants */}
            {!hasSizeAttribute && (
              <div className="selection-block" style={{ marginTop: '16px' }}>
                <label>Select Size</label>
                <div className="attribute-options-row" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                  {productSizes.map((size) => {
                    const isActive = selectedSize === size;
                    const isSizeOut = currentStock <= 0;
                    const isSizeLow = currentStock > 0 && currentStock <= 3;
                    return (
                      <button
                        key={size}
                        className={`size-btn ${isActive ? "active" : ""} ${isSizeOut ? "out-of-stock" : ""}`}
                        onClick={() => !isSizeOut && setSelectedSize(size)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "4px",
                          cursor: isSizeOut ? "not-allowed" : "pointer",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          minWidth: "48px",
                          minHeight: "36px",
                          position: "relative",
                          opacity: isSizeOut ? 0.35 : 1,
                          textDecoration: isSizeOut ? "line-through" : "none",
                          border: isActive ? "2px solid var(--accent-primary, #ff6b00)" : (isSizeLow ? "1px dashed #F59E0B" : "1px solid var(--theme-border)")
                        }}
                        title={isSizeOut ? "Out of stock" : (isSizeLow ? `Only ${currentStock} left!` : `${currentStock} in stock`)}
                      >
                        {size}
                        {isSizeLow && (
                          <span style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#F59E0B'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className={`btn-add-bag ${addedSuccess ? "success" : ""}`}
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
              >
                {addedSuccess ? "☑ ADDED TO CART" : currentStock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
              </button>
              <button 
                className="btn-buy-now" 
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
              >
                BUY NOW
              </button>
              <button
                className={`btn-heart${isWishlisted(product?._id || displayProduct?._id) ? " wishlisted" : ""}`}
                onClick={async () => {
                  const pId = product?._id || displayProduct?._id;
                  if (!pId) return;
                  setWishlistLoading(true);
                  try {
                    await handleToggleWishlist(pId);
                  } catch (err) {
                    console.error("Wishlist toggle failed:", err);
                  } finally {
                    setWishlistLoading(false);
                  }
                }}
                disabled={wishlistLoading}
                title={isWishlisted(product?._id || displayProduct?._id) ? "Remove from wishlist" : "Add to wishlist"}
                aria-label={isWishlisted(product?._id || displayProduct?._id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isWishlisted(product?._id || displayProduct?._id) ? "♥" : "♡"}
              </button>
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
      <Footer />
    </div>
  );
};

export default ProductDetail;
