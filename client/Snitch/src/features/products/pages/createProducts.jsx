import React, { useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useProduct } from '../hook/useProduct';
import './style/createProduct.scss';
import { useTheme } from '../../../app/ThemeContext';

const CreateProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCreateProducts } = useProduct();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isStoreOnline, setIsStoreOnline] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeStocks, setSizeStocks] = useState({});
  const [colors, setColors] = useState(['#ff6b00', '#000000', '#ffffff']);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [stock, setStock] = useState('10');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 7) {
      alert("You can only upload up to 7 images.");
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedImages([...selectedImages, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
      setSizeStocks(prev => {
        const copy = { ...prev };
        delete copy[size];
        return copy;
      });
    } else {
      setSelectedSizes([...selectedSizes, size]);
      setSizeStocks(prev => ({
        ...prev,
        [size]: '10'
      }));
    }
  };

  const handleSizeStockChange = (size, value) => {
    setSizeStocks(prev => ({
      ...prev,
      [size]: value
    }));
  };

  const addColor = (e) => {
    const newColor = e.target.value;
    if (!colors.includes(newColor)) {
      setColors([...colors, newColor]);
    }
  };

  const removeColor = (colorToRemove) => {
    setColors(colors.filter(c => c !== colorToRemove));
  };

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    
    if (words.length <= 100) {
      setDescription(text);
    } else {
      // Reconstruct text with only first 100 words
      const limitedText = words.slice(0, 100).join(' ');
      setDescription(limitedText);
    }
  };



  const resetForm = () => {
    setTitle('');
    setCategory('Shirts');
    setStock('10');
    setPriceAmount('');
    setPriceCurrency('INR');
    setDescription('');
    setSelectedImages([]);
    setSelectedSizes([]);
    setSizeStocks({});
    setColors(['#ff6b00', '#000000', '#ffffff']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      alert('Please upload at least one product image.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priceAmount', priceAmount);
      formData.append('priceCurrency', priceCurrency);
      formData.append('category', category);
      
      if (selectedSizes.length > 0) {
        formData.append('sizeStocks', JSON.stringify(sizeStocks));
        formData.append('stock', '0');
      } else {
        formData.append('stock', stock);
      }

      selectedImages.forEach((image) => {
        formData.append('images', image.file);
      });

      await handleCreateProducts(formData);
      resetForm();
      alert('Product created successfully.');
      navigate('/seller/dashboard');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.[0]?.msg ||
        'Unable to create product.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-product-container" data-theme={theme}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <div className="logo">
              S<span className="logo-text">NITCH</span>
            </div>
          )}
          <button 
            className={`toggle-btn ${isSidebarCollapsed ? 'rotated' : ''}`}
            onClick={toggleSidebar}
          >
            <span>❮</span>
          </button>
        </div>

        <nav className="nav-links">
          <Link to="/" className="nav-item">
            <div className="icon"><i className="ri-home-4-line"></i></div>
            <span className="sidebar-label">Home</span>
          </Link>
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
                className={`switch ${isStoreOnline ? 'active' : ''}`}
                onClick={() => setIsStoreOnline(!isStoreOnline)}
              >
                <div className="knob"></div>
              </div>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="theme-toggle">
              <span className="sidebar-label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <div 
                className={`switch ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
              >
                <div className="knob"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <section className="header-section">
          <h1>Create Product</h1>
          <p>Launch your latest collection to the Snitch universe.</p>
        </section>

        <div className="form-card">
          <form className="main-form" onSubmit={handleSubmit}>
            <div className="form-left">
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  placeholder="e.g. Oversized Heavyweight Tee"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    background: 'var(--input-bg, #fff)',
                    color: 'var(--text-color, #0f172a)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Trousers">Trousers</option>
                  <option value="Polos">Polos</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Cargos">Cargos</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Shorts">Shorts</option>
                  <option value="Plus Size">Plus Size</option>
                  <option value="Shoes">Shoes</option>
                </select>
              </div>

              <div className="form-grid-small" style={{ display: 'grid', gridTemplateColumns: selectedSizes.length === 0 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    placeholder="0.00"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    value={priceCurrency}
                    onChange={(e) => setPriceCurrency(e.target.value)}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>

                {selectedSizes.length === 0 && (
                  <div className="form-group">
                    <label htmlFor="stock">Stock Qty</label>
                    <input
                      type="number"
                      id="stock"
                      placeholder="10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Available Sizes</label>
                <div className="size-selector">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div 
                      key={size} 
                      className={`size-chip ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>

              {selectedSizes.length > 0 && (
                <div className="size-stocks-input-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: '20px' }}>
                  {selectedSizes.map(size => (
                    <div key={size} className="size-stock-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--fg-secondary)', fontWeight: '600' }}>Size {size} Stock</label>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={sizeStocks[size] || ''}
                        onChange={(e) => handleSizeStockChange(size, e.target.value)}
                        min="0"
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--fg-primary)' }}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label>Product Colors</label>
                <div className="color-selector">
                  <div className="color-list">
                    {colors.map(color => (
                      <div key={color} className="color-swatch-wrapper">
                        <div 
                          className="color-swatch" 
                          style={{ backgroundColor: color }}
                          onClick={() => removeColor(color)}
                        >
                          <span className="remove-tip">✕</span>
                        </div>
                      </div>
                    ))}
                    <div className="add-color">
                      <input type="color" onChange={addColor} title="Add Color" />
                      <span>+</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="description">Description</label>
                  <span className={`word-badge ${description.trim() ? (description.trim().split(/\s+/).length >= 90 ? 'limit' : '') : ''}`}>
                    {description.trim() ? description.trim().split(/\s+/).length : 0} / 100 Words
                  </span>
                </div>
                <textarea 
                  id="description" 
                  placeholder="Describe the aesthetic, fit, and material..."
                  value={description}
                  onChange={handleDescriptionChange}
                ></textarea>
              </div>
            </div>

            <div className="form-right">

              <div className="form-group">
                <label>Product Images ({selectedImages.length}/7)</label>
                <div className="image-upload-container">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  
                  <div className="image-upload-zone" onClick={handleImageClick}>
                    <div className="upload-icon">📸</div>
                    <p>Click to upload</p>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="image-previews-row">
                      {selectedImages.map((img, index) => (
                        <div key={index} className="preview-item">
                          <img src={img.preview} alt={`preview-${index}`} />
                          <button 
                            type="button" 
                            className="remove-img" 
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="submit-btn">
                <span className="btn-icon">🚀</span>
                <span className="btn-text">{isSubmitting ? 'Publishing...' : 'Publish Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProducts;
