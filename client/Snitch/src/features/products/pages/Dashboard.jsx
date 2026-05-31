import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import "../pages/style/dashboard.scss";

/* ─── SVG Icons ─── */
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const Dashboard = () => {
  const { handleSellerProducts } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);
  const location = useLocation();

  // Local state for interactive features
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isStoreOnline, setIsStoreOnline] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [viewType, setViewType] = useState("grid"); // grid | list
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | price-asc | price-desc | name-asc | name-desc
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [deletedProductIds, setDeletedProductIds] = useState([]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadSellerProducts = async () => {
      try {
        await handleSellerProducts();
      } catch (error) {
        console.error("Dashboard product load failed:", error?.message || error);
      }
    };

    loadSellerProducts();
  }, [handleSellerProducts]);

  const catalogProducts = Array.isArray(sellerProducts)
    ? sellerProducts.filter((product) => !deletedProductIds.includes(product._id))
    : [];

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Mock function to show responsiveness of deleting items
  const handleDeleteProduct = (productId, title) => {
    if (window.confirm(`Are you sure you want to delete product "${title}"?`)) {
      setDeletedProductIds((prev) => [...prev, productId]);
    }
  };

  // Currency helper
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

  // Filter & Sort Logic
  const filteredProducts = catalogProducts.filter((product) => {
    const title = product.title?.toLowerCase() || "";
    const desc = product.description?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);

    const productCurrency = product.price?.currency || "INR";
    const matchesCurrency = currencyFilter === "all" || productCurrency === currencyFilter;

    return matchesSearch && matchesCurrency;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      return (a.price?.amount || 0) - (b.price?.amount || 0);
    }
    if (sortBy === "price-desc") {
      return (b.price?.amount || 0) - (a.price?.amount || 0);
    }
    if (sortBy === "name-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "name-desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    // "newest"
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // KPI Calculations
  const getTotalsString = () => {
    const totals = {};
    catalogProducts.forEach((p) => {
      const curr = p.price?.currency || "INR";
      const amt = p.price?.amount || 0;
      totals[curr] = (totals[curr] || 0) + amt;
    });
    const entries = Object.entries(totals);
    if (entries.length === 0) return "₹ 0";
    return entries.map(([curr, amt]) => formatPrice(amt, curr)).join(" | ");
  };

  const totalProducts = catalogProducts.length;
  const portfolioValue = getTotalsString();
  
  const inrProducts = catalogProducts.filter(p => (p.price?.currency || "INR") === "INR");
  const avgPrice = inrProducts.length > 0
    ? formatPrice(Math.round(inrProducts.reduce((sum, p) => sum + (p.price?.amount || 0), 0) / inrProducts.length), "INR")
    : catalogProducts.length > 0
      ? formatPrice(Math.round(catalogProducts.reduce((sum, p) => sum + (p.price?.amount || 0), 0) / catalogProducts.length), catalogProducts[0].price?.currency || "INR")
      : "₹ 0";

  return (
    <div className="dashboard-container" data-theme={theme}>
      {/* Collapsible Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <Link to="/seller/dashboard" className="logo">
              S<span className="logo-text">NITCH</span>
            </Link>
          )}
          <button 
            className={`toggle-btn ${isSidebarCollapsed ? "rotated" : ""}`}
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <span>❮</span>
          </button>
        </div>

        <nav className="nav-links">
          <Link to="/seller/dashboard" className={`nav-item ${location.pathname.includes("/dashboard") ? "active" : ""}`}>
            <div className="icon"><i className="ri-dashboard-2-line"></i></div>
            <span className="sidebar-label">Dashboard</span>
          </Link>
          <Link to="/seller/create-product" className={`nav-item ${location.pathname.includes("/create-product") ? "active" : ""}`}>
            <div className="icon"><i className="ri-box-3-line"></i></div>
            <span className="sidebar-label">Products</span>
          </Link>
          <div className="nav-item" onClick={() => alert("Orders management coming soon!")}>
            <div className="icon"><i className="ri-shopping-cart-2-line"></i></div>
            <span className="sidebar-label">Orders</span>
          </div>
          <div className="nav-item" onClick={() => alert("Customer base directory coming soon!")}>
            <div className="icon"><i className="ri-user-line"></i></div>
            <span className="sidebar-label">Customers</span>
          </div>
          <div className="nav-item" onClick={() => alert("Settings panel coming soon!")}>
            <div className="icon"><i className="ri-settings-3-line"></i></div>
            <span className="sidebar-label">Settings</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          {!isSidebarCollapsed && (
            <div className="status-toggle">
              <span className="sidebar-label">Store Status</span>
              <div 
                className={`switch ${isStoreOnline ? "active" : ""}`}
                onClick={() => setIsStoreOnline((prev) => !prev)}
              >
                <div className="knob"></div>
              </div>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="theme-toggle">
              <span className="sidebar-label">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              <div 
                className={`switch ${theme === "dark" ? "active" : ""}`}
                onClick={toggleTheme}
              >
                <div className="knob"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <section className="header-section">
          <div className="title-area">
            <span className="section-kicker">Seller Workspace</span>
            <h1>Product Dashboard</h1>
            <p>Track inventory, review pricing, and keep your SNITCH catalog polished.</p>
          </div>
          <div className="header-actions">
            <Link to="/seller/create-product" className="add-product-btn">
              <span className="btn-icon">+</span>
              <span className="btn-text">Add Product</span>
            </Link>
          </div>
        </section>

        {/* Stats Summary ribbon */}
        <section className="stats-ribbon">
          <div className="stat-card">
            <div>
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{totalProducts}</div>
            </div>
            <div className="stat-desc">
              Active items in Snitch store
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Catalog Value</div>
              <div className={`stat-value ${catalogProducts.length > 2 ? "stat-value--compact" : ""}`}>{portfolioValue}</div>
            </div>
            <div className="stat-desc">
              Combined values of products
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Average Unit Price</div>
              <div className="stat-value">{avgPrice}</div>
            </div>
            <div className="stat-desc">
              Weighted average product pricing
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Store Status</div>
              <div className={`stat-value stat-value--status ${isStoreOnline ? "is-online" : "is-offline"}`}>
                {isStoreOnline ? "ONLINE" : "OFFLINE"}
              </div>
            </div>
            <div className="stat-desc">
              {isStoreOnline ? (
                <span><span className="trend-up">●</span> Accept orders dynamically</span>
              ) : (
                <span><span className="trend-down">●</span> Orders paused</span>
              )}
            </div>
          </div>
        </section>

        {/* Filters Toolbar */}
        <section className="toolbar-section">
          <div className="search-wrapper">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="search-input"
              placeholder="Search catalog by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              className="select-filter"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              aria-label="Filter by Currency"
            >
              <option value="all">All Currencies</option>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>

            <select
              className="select-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            <div className="view-toggle">
              <button
                className={`toggle-tab-btn ${viewType === "grid" ? "active" : ""}`}
                onClick={() => setViewType("grid")}
                title="Grid View"
                aria-label="Grid View"
              >
                <GridIcon />
              </button>
              <button
                className={`toggle-tab-btn ${viewType === "list" ? "active" : ""}`}
                onClick={() => setViewType("list")}
                title="List View"
                aria-label="List View"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </section>

        {/* Product Catalog Display */}
        {sortedProducts.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <span className="empty-icon">📦</span>
            </div>
            <h3>No Products Found</h3>
            <p>
              {searchQuery || currencyFilter !== "all"
                ? "No products match your search query or currency filters. Try refining your filters."
                : "You haven't uploaded any products to your catalog yet. Click below to add your first product."}
            </p>
            <Link to="/seller/create-product" className="create-first-btn">
              <span>+ Create First Product</span>
            </Link>
          </div>
        ) : viewType === "grid" ? (
          <div className="products-grid">
            {sortedProducts.map((product) => {
              const imageUrl = product.images?.[0]?.url;
              const formattedDate = product.createdAt
                ? new Date(product.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Just Now";

              return (
                <div key={product._id} className="product-card">
                  <div className="image-wrapper">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.title || "Product image"} loading="lazy" />
                    ) : (
                      <div className="no-image-fallback">
                        <span className="icon">👕</span>
                        <span>No Image</span>
                      </div>
                    )}
                    <div className="card-hover-actions">
                      <button className="action-btn" onClick={() => alert(`View details of ${product.title}`)} aria-label="View Details">
                        <EyeIcon /> View
                      </button>
                      <button className="action-btn" onClick={() => alert(`Edit ${product.title}`)} aria-label="Edit Product">
                        <EditIcon /> Edit
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteProduct(product._id, product.title)} aria-label="Delete Product">
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <div className="title-row">
                      <h3 className="product-title" title={product.title}>{product.title}</h3>
                      <span className="product-price">
                        {formatPrice(product.price?.amount || 0, product.price?.currency || "INR")}
                      </span>
                    </div>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-meta">
                      <span className="meta-date">{formattedDate}</span>
                      <div className="meta-sizes">
                        {["S", "M", "L", "XL"].map((sz) => (
                          <span key={sz} className="size-badge">
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="products-list-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th scope="col" className="thumbnail-cell">Item</th>
                  <th scope="col">Product Info</th>
                  <th scope="col">Price</th>
                  <th scope="col">Available Sizes</th>
                  <th scope="col">Added On</th>
                  <th scope="col" className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => {
                  const imageUrl = product.images?.[0]?.url;
                  const formattedDate = product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Just Now";

                  return (
                    <tr key={product._id}>
                      <td className="thumbnail-cell">
                        <div className="thumbnail-wrapper">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.title} />
                          ) : (
                            <div className="fallback">👕</div>
                          )}
                        </div>
                      </td>
                      <td className="name-cell">
                        <div>{product.title}</div>
                        <div className="desc-tip" title={product.description}>
                          {product.description}
                        </div>
                      </td>
                      <td className="price-cell">
                        {formatPrice(product.price?.amount || 0, product.price?.currency || "INR")}
                      </td>
                      <td className="sizes-cell">
                        <div className="sizes-list">
                          {["S", "M", "L", "XL"].map((sz) => (
                            <span key={sz} className="size-badge">
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="date-cell">{formattedDate}</td>
                      <td className="actions-cell">
                        <div className="actions-wrapper">
                          <button
                            className="table-action-btn"
                            onClick={() => alert(`View details of ${product.title}`)}
                            title="View Details"
                            aria-label="View Details"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            className="table-action-btn"
                            onClick={() => alert(`Edit ${product.title}`)}
                            title="Edit Product"
                            aria-label="Edit Product"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="table-action-btn delete-btn"
                            onClick={() => handleDeleteProduct(product._id, product.title)}
                            title="Delete Product"
                            aria-label="Delete Product"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
