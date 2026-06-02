import React, { useState, useEffect, useRef } from "react";
import { useProduct } from "../hook/useProduct";
import { useParams, Link } from "react-router-dom";
import "./style/sellerproductdetail.scss";
import { useTheme } from "../../../app/ThemeContext";

// Custom premium SVG Icons
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);


const SellerProductDetails = () => {
  const { theme } = useTheme();
  const { productId } = useParams();
  const { handlegetProductById,handleProductVariant } = useProduct();

  /**
   * Basic Product Metadata States
   * - productTitle: Name of the product being viewed
   * - basePrice: Fallback price from product details
   * - skuCode: Formatted primary SKU of the product
   * - status: Product listing status (e.g., 'active' or 'draft')
   */
  const [productTitle, setProductTitle] = useState("");
  const [basePrice, setBasePrice] = useState("8999");
  const [skuCode, setSkuCode] = useState("SN-BLZ-ARCH");
  const [status, setStatus] = useState("active");

  /**
   * Local Variants State
   * Stores the list of active product variants in local state.
   * Each variant holds: id, sku, stock, price, images, and attributes array (e.g. ["Color: Black", "Size: M"]).
   */
  const [variants, setVariants] = useState([]);

  /**
   * UI & Notification States
   * - toasts: Holds active toast notification messages
   * - saving: Simulates network saving animation loader
   * - editingIndex: Stores index of the variant row currently in inline-editing mode
   * - isStatusOpen: Manages opening/closing of status selector dropdown
   */
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  /**
   * New Variant Input States
   * Form inputs to configure a new variation prior to addition.
   */
  const [newSku, setNewSku] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState("INR");

  /**
   * Variant Images Upload Reference & Preview States
   * - fileInputRef: Controls access to the hidden file browser input
   * - variantImages: Temporarily holds selected file objects and their local previews
   */
  const fileInputRef = useRef(null);
  const [variantImages, setVariantImages] = useState([]);

  /**
   * Dynamic Custom Attributes Creation State
   * Key-value objects representing fields inside the creation form.
   * Will be flattened into a simple array of strings when added.
   */
  const [newAttributes, setNewAttributes] = useState([
    { key: "Color", value: "" },
    { key: "Size", value: "" }
  ]);

  /**
   * Inline Editing Intermediate States
   * Holds transient cell values for editing variants in-place in the catalog list.
   */
  const [editSku, setEditSku] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editCurrency, setEditCurrency] = useState("INR");

  /**
   * Helper function to trigger interactive toast notifications
   * Automatically clears notifications after 4 seconds.
   * @param {string} message - Text message to show the user
   * @param {'success'|'error'} type - Notification look and feel
   */
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  /**
   * Helper function to format prices with appropriate currency symbols.
   * @param {number|object} priceObj - Price value or object containing amount and currency
   */
  const formatPrice = (priceObj) => {
    const amount = typeof priceObj === "object" ? priceObj.amount : priceObj;
    const currency = typeof priceObj === "object" ? priceObj.currency : "INR";
    const symbols = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥"
    };
    const symbol = symbols[currency] || "₹";
    return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  /**
   * Sanitizes the variants array by replacing temporary blob URL strings 
   * (which expire on page reload) with a static placeholder image.
   * @param {Array} list - Array of variant objects to sanitize
   */
  const sanitizeVariantsForLocalStorage = (list) => {
    return list.map((v) => {
      const sanitizedImages = (v.images || []).map((img) => {
        const url = img.preview || img;
        if (typeof url === "string" && url.startsWith("blob:")) {
          return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120";
        }
        return url;
      });
      return {
        ...v,
        images: sanitizedImages
      };
    });
  };

  /**
   * Initial Load Effect Hook
   * Fetches product metadata from API. For variants:
   * 1. Checks localStorage for locally stored/updated variants first.
   * 2. If no localStorage copy exists, transforms fetched API variants into a flat string-array format.
   * 3. Falls back to mock configurations if variants are empty.
   * Keeps local copy in sync with localStorage.
   */
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      if (!productId) return;
      try {
        // Attempt to restore locally saved variants list first
        const localKey = `snitch_variants_${productId}`;
        const storedVariantsJson = localStorage.getItem(localKey);

        const data = await handlegetProductById(productId);
        if (!ignore && data) {
          const prod = data.product || data;
          setProductTitle(prod.title || "Product Name");
          setBasePrice(prod.price?.amount || "8999");
          setSkuCode(prod._id ? `SN-BLZ-${prod._id.slice(-6).toUpperCase()}` : "SN-BLZ-ARCH");
          
          if (storedVariantsJson) {
            try {
              const parsed = JSON.parse(storedVariantsJson);
              if (Array.isArray(parsed)) {
                setVariants(parsed);
                return;
              }
            } catch (storageErr) {
              console.error("Local storage variant parse error", storageErr);
            }
          }

          if (prod.variants && prod.variants.length > 0) {
            const mappedVariants = prod.variants.map((v) => {
              const attrs = v.attributes instanceof Map 
                ? Object.fromEntries(v.attributes) 
                : (v.attributes || {});

              // Flatten Map attributes into an array of simple "Key: Value" strings
              const formattedAttrs = Object.entries(attrs).map(([key, val]) => {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                return `${formattedKey}: ${val || ""}`;
              });

              return {
                id: v._id || Math.random().toString(36).substring(7),
                sku: attrs.sku || attrs.Sku || `SN-VAR-${Math.random().toString(36).substring(7).toUpperCase()}`,
                stock: v.stock || 0,
                price: {
                  amount: v.price?.amount || prod.price?.amount || 8999,
                  currency: v.price?.currency || prod.price?.currency || "INR"
                },
                attributes: formattedAttrs.length > 0 ? formattedAttrs : ["Color: Black"],
                images: v.images && v.images.length > 0 ? v.images.map((img) => img.url || img) : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
              };
            });
            setVariants(mappedVariants);
            localStorage.setItem(localKey, JSON.stringify(mappedVariants));
          } else {
            // If no variants exist in database, initialize empty array
            setVariants([]);
            localStorage.setItem(localKey, JSON.stringify([]));
          }
        }
      } catch (err) {
        console.error("Failed to load product details", err);
        addToast("Error fetching product details", "error");
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [productId, handlegetProductById]);

  /**
   * Helper function to return visual stock label tags
   * @param {number} stock - Number of units in stock
   */
  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span className="status-badge out-of-stock">
          <span className="dot" /> Out of stock
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className="status-badge low-stock">
          <span className="dot" /> Low Stock
        </span>
      );
    }
    return (
      <span className="status-badge in-stock">
        <span className="dot" /> In Stock
      </span>
    );
  };

  /**
   * Image Selection Triggers
   * Forwards user click to hidden HTML file input.
   */
  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  /**
   * Image Upload Handlers
   * Instantiates image previews for draft variant configurations.
   * Maximum allowed uploads is 7 images per variant.
   */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (variantImages.length + files.length > 7) {
      addToast("You can only upload up to 7 images per variant.", "error");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setVariantImages([...variantImages, ...newImages]);
    addToast(`${files.length} variant image(s) selected`);
  };

  /**
   * Removes selected draft variant image and revokes local object URL memory.
   * @param {number} index - Index of selected draft image in array
   */
  const removeVariantImage = (index) => {
    const updated = [...variantImages];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setVariantImages(updated);
    addToast("Image removed");
  };

  /**
   * Adds a new empty attributes key/value row to the form.
   */
  const addAttributeRow = () => {
    setNewAttributes([...newAttributes, { key: "", value: "" }]);
  };

  /**
   * Removes an attributes row at the specified index from the form.
   * @param {number} index - Target index to remove
   */
  const removeAttributeRow = (index) => {
    setNewAttributes(newAttributes.filter((_, i) => i !== index));
  };

  /**
   * Updates property key or property value in the creation form state.
   * @param {number} index - Row index of modification
   * @param {'key'|'value'} field - Targeted input field
   * @param {string} val - Input value typed
   */
  const updateAttributeRow = (index, field, val) => {
    const updated = [...newAttributes];
    updated[index][field] = val;
    setNewAttributes(updated);
  };

  /**
   * Form Submission Handler
   * Configures a new variant from form inputs.
   * Validates inputs, maps attributes to a clean array of strings: ["Key: Value"],
   * saves variant to state and persists to local storage.
   */
  const handleAddVariant = async(e) => {
    e.preventDefault();
    if (!newSku) {
      addToast("SKU Code is required to configure a variant", "error");
      return;
    }

    const priceVal = newPrice ? Number(newPrice) : Number(basePrice);
    const stockVal = newStock ? Number(newStock) : 0;

    // Map attributes into a clean array of strings (not array of objects)
    const cleanAttributes = newAttributes
      .filter((attr) => attr.key.trim() !== "" && attr.value.trim() !== "")
      .map((attr) => `${attr.key.trim()}: ${attr.value.trim()}`);

    const newVarObj = {
      id: Math.random().toString(36).substring(7),
      sku: newSku,
      stock: stockVal,
      price: {
        amount: priceVal,
        currency: newCurrency
      },
      attributes: cleanAttributes.length > 0 ? cleanAttributes : ["Option: Default"],
      images: variantImages.length > 0 ? variantImages : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
    };
    let updatedVariants = [...variants, newVarObj];
    try {
      const resData = await handleProductVariant(productId, newVarObj);
      if (resData && resData.product && resData.product.variants) {
        const prod = resData.product;
        updatedVariants = prod.variants.map((v) => {
          const attrs = v.attributes instanceof Map 
            ? Object.fromEntries(v.attributes) 
            : (v.attributes || {});

          const formattedAttrs = Object.entries(attrs).map(([key, val]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `${formattedKey}: ${val || ""}`;
          });

          return {
            id: v._id || Math.random().toString(36).substring(7),
            sku: attrs.sku || attrs.Sku || `SN-VAR-${Math.random().toString(36).substring(7).toUpperCase()}`,
            stock: v.stock || 0,
            price: {
              amount: v.price?.amount || prod.price?.amount || 8999,
              currency: v.price?.currency || prod.price?.currency || "INR"
            },
            attributes: formattedAttrs.length > 0 ? formattedAttrs : ["Color: Black"],
            images: v.images && v.images.length > 0 ? v.images.map((img) => img.url || img) : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
          };
        });
      }
    } catch (err) {
      console.error("Failed to upload variant to server, saving locally", err);
    }
    setVariants(updatedVariants);

    // Persist list locally in localStorage
    if (productId) {
      localStorage.setItem(`snitch_variants_${productId}`, JSON.stringify(sanitizeVariantsForLocalStorage(updatedVariants)));
    }

    addToast("Variant added to catalog locally");

    // Reset Creation form fields
    setNewSku("");
    setNewStock("");
    setNewPrice("");
    setNewCurrency("INR");
    setVariantImages([]);
    setNewAttributes([
      { key: "Color", value: "" },
      { key: "Size", value: "" }
    ]);
  };

  /**
   * Starts Inline Table Row Editing
   * Pre-populates intermediate states with selected variant cell values.
   * @param {number} index - Index of variant selected for editing
   */
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditSku(variants[index].sku);
    setEditStock(variants[index].stock);
    setEditPrice(typeof variants[index].price === "object" ? variants[index].price.amount : variants[index].price);
    setEditCurrency(typeof variants[index].price === "object" ? variants[index].price.currency : "INR");
  };

  /**
   * Saves Modified Inline Values to Local State and LocalStorage
   * @param {number} index - Index of variant row to save
   */
  const saveVariantRow = (index) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      sku: editSku,
      stock: Number(editStock),
      price: {
        amount: Number(editPrice),
        currency: editCurrency
      }
    };
    setVariants(updated);

    // Persist list locally in localStorage
    if (productId) {
      localStorage.setItem(`snitch_variants_${productId}`, JSON.stringify(sanitizeVariantsForLocalStorage(updated)));
    }

    setEditingIndex(null);
    addToast("Variant updated successfully");
  };

  /**
   * Deletes Variant from Catalog and syncs to LocalStorage
   * @param {number} index - Index of target variant to delete
   */
  const deleteVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);

    // Persist updated list locally in localStorage
    if (productId) {
      localStorage.setItem(`snitch_variants_${productId}`, JSON.stringify(sanitizeVariantsForLocalStorage(updated)));
    }

    addToast("Variant removed from catalog", "error");
  };

  /**
   * Simulates full save action to catalog
   * Syncs the current state of variants to localStorage.
   */
  const saveAllChanges = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (productId) {
        localStorage.setItem(`snitch_variants_${productId}`, JSON.stringify(sanitizeVariantsForLocalStorage(variants)));
      }
      addToast("Catalog variations saved successfully! (Simulated)");
    }, 1000);
  };

  return (
    <div className="seller-product-details-container" data-theme={theme}>
      {/* Toast Drawer */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-message ${toast.type}`}>
            <span className="icon">{toast.type === "success" ? "✓" : "⚠"}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Content Workspace */}
      <div className="seller-main-content">
        {/* Header Breadcrumbs & Controls */}
        <div className="seller-top-bar">
          <div className="breadcrumbs">
            <Link to="/seller/dashboard">Dashboard</Link>
            <span className="separator">/</span>
            <span className="current">Products</span>
            <span className="separator">/</span>
            <span className="current">{productTitle || "Architect Blazer"}</span>
          </div>
          <div className="actions-row">
            <button className="btn-secondary" onClick={() => addToast("Previewing storefront view")}>
              Preview
            </button>
            <button className="btn-primary" onClick={saveAllChanges} disabled={saving}>
              <IconSave /> {saving ? "Saving..." : "Save Catalog"}
            </button>
          </div>
        </div>

        {/* Heading Panel */}
        <div className="product-title-section">
          <h2>{productTitle || "Architect Blazer"}</h2>
          <div className="status-row">
            <span className="status-badge-sku">{skuCode}</span>
            <div className="status-dropdown-container">
              <button 
                className={`status-dropdown-trigger ${status}`} 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                type="button"
              >
                <span className="dot" />
                <span className="status-text">{status === "active" ? "Active" : "Draft"}</span>
                <span className="caret">▼</span>
              </button>
              {isStatusOpen && (
                <>
                  <div className="status-dropdown-backdrop" onClick={() => setIsStatusOpen(false)} />
                  <div className="status-dropdown-menu">
                    <div 
                      className={`status-dropdown-item active-option ${status === "active" ? "selected" : ""}`}
                      onClick={() => { setStatus("active"); setIsStatusOpen(false); }}
                    >
                      <span className="dot" /> Active
                    </div>
                    <div 
                      className={`status-dropdown-item draft-option ${status === "draft" ? "selected" : ""}`}
                      onClick={() => { setStatus("draft"); setIsStatusOpen(false); }}
                    >
                      <span className="dot" /> Draft
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Bento: Forms Left, Tables Right */}
        <div className="bento-workspace">
          
          {/* Left Form: Add Variant details & images */}
          <div className="panel-form-column">
            <div className="glass-panel uploader-form-card">
              <h3 className="section-title-label"><IconPlus /> Configure Variant</h3>
              <form onSubmit={handleAddVariant}>
                
                {/* SKU Code Input Row */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label>SKU Code</label>
                  <input 
                    type="text" 
                    value={newSku} 
                    onChange={(e) => setNewSku(e.target.value)} 
                    placeholder="e.g. SN-BLZ-CH-M"
                    required
                  />
                </div>

                {/* Stock, Price and Currency Grid */}
                <div className="form-grid-pricing" style={{ gridTemplateColumns: "1fr 1.2fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Stock Qty</label>
                    <input 
                      type="number" 
                      value={newStock} 
                      onChange={(e) => setNewStock(e.target.value)} 
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price Override</label>
                    <input 
                      type="number" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)} 
                      placeholder={basePrice}
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select 
                      value={newCurrency} 
                      onChange={(e) => setNewCurrency(e.target.value)}
                      style={{
                        background: "rgba(15, 15, 15, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px",
                        color: "#fff",
                        padding: "7px 10px",
                        fontSize: "0.82rem",
                        height: "35px"
                      }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>

                <div className="panel-divider" />

                {/* Dynamic Attributes Grid */}
                <div className="attributes-editor-wrapper">
                  <div className="editor-header">
                    <label>Variant Properties (Attributes)</label>
                    <button type="button" className="btn-text-action" onClick={addAttributeRow}>
                      + Add Custom Attribute
                    </button>
                  </div>
                  <div className="attributes-inputs-list">
                    {newAttributes.map((attr, idx) => (
                      <div key={idx} className="attribute-input-row">
                        <input 
                          type="text" 
                          placeholder="Property (e.g. Color)" 
                          value={attr.key} 
                          onChange={(e) => updateAttributeRow(idx, "key", e.target.value)}
                          className="attr-key-input"
                        />
                        <input 
                          type="text" 
                          placeholder="Value (e.g. Charcoal)" 
                          value={attr.value} 
                          onChange={(e) => updateAttributeRow(idx, "value", e.target.value)}
                          className="attr-val-input"
                        />
                        <button 
                          type="button" 
                          className="btn-delete-row"
                          onClick={() => removeAttributeRow(idx)}
                          title="Remove Attribute"
                          disabled={newAttributes.length <= 1}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-divider" />

                {/* Images Uploader zone (upto 7 files) */}
                <div className="form-group variant-image-upload-wrapper">
                  <label>Variant Images ({variantImages.length}/7)</label>
                  <div className="image-upload-container">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    <div className="image-upload-zone" onClick={handleImageClick}>
                      <span className="upload-icon">📸</span>
                      <span className="upload-text">Click to upload variant files</span>
                    </div>

                    {variantImages.length > 0 && (
                      <div className="image-previews-row">
                        {variantImages.map((img, idx) => (
                          <div key={idx} className="preview-item">
                            <img src={img.preview} alt={`preview-${idx}`} />
                            <button 
                              type="button" 
                              className="remove-img" 
                              onClick={() => removeVariantImage(idx)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-submit-variant">
                  <IconPlus /> Add Variant to Catalog
                </button>

              </form>
            </div>
          </div>

          {/* Right Panel: Active Catalog Variations list */}
          <div className="panel-catalog-column">
            <div className="glass-panel catalog-list-card">
              <div className="catalog-table-wrapper">
                <table className="catalog-variants-table">
                  <thead>
                    <tr>
                      <th>Properties</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Price Override</th>
                      <th>Status</th>
                      <th>Images</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, index) => {
                      const isEditing = editingIndex === index;
                      return (
                        <tr key={v.id}>
                          {/* Dynamic Property Chips */}
                          <td>
                            <div className="attribute-tags-container">
                              {v.attributes.map((attr, idx) => {
                                // Split the "Key: Value" string to render key and value separately in the UI
                                const separatorIndex = attr.indexOf(":");
                                const key = separatorIndex !== -1 ? attr.slice(0, separatorIndex).trim() : attr;
                                const value = separatorIndex !== -1 ? attr.slice(separatorIndex + 1).trim() : "";
                                return (
                                  key && (
                                    <span key={idx} className="property-tag">
                                      <span className="prop-name">{key}:</span>
                                      <span className="prop-val">{value}</span>
                                    </span>
                                  )
                                );
                              })}
                            </div>
                          </td>

                          {/* SKU Column */}
                          <td className="sku-font">
                            {isEditing ? (
                              <input 
                                type="text" 
                                className="inline-edit-input" 
                                value={editSku} 
                                onChange={(e) => setEditSku(e.target.value)}
                              />
                            ) : (
                              v.sku
                            )}
                          </td>

                          {/* Stock Quantity */}
                          <td>
                            {isEditing ? (
                              <input 
                                type="number" 
                                className="inline-edit-input" 
                                value={editStock} 
                                onChange={(e) => setEditStock(e.target.value)}
                              />
                            ) : (
                              v.stock
                            )}
                          </td>

                          {/* Price */}
                          <td>
                            {isEditing ? (
                              <div className="inline-currency-edit-row" style={{ display: "flex", gap: "4px" }}>
                                <select 
                                  value={editCurrency} 
                                  onChange={(e) => setEditCurrency(e.target.value)}
                                  className="inline-edit-input"
                                  style={{ padding: "3px", width: "65px", background: "#111", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "3px", color: "#fff" }}
                                >
                                  <option value="INR">INR (₹)</option>
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="JPY">JPY (¥)</option>
                                </select>
                                <input 
                                  type="number" 
                                  className="inline-edit-input" 
                                  value={editPrice} 
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  style={{ width: "70px" }}
                                />
                              </div>
                            ) : (
                              formatPrice(v.price)
                            )}
                          </td>

                          {/* Stock Badges */}
                          <td>{getStockBadge(v.stock)}</td>

                          {/* Images Overlapping Stack */}
                          <td>
                            <div className="variant-images-stack">
                              {v.images && v.images.length > 0 ? (
                                v.images.slice(0, 3).map((img, idx) => (
                                  <img 
                                    key={idx}
                                    src={img.preview || img.url || img} 
                                    alt="Variant Stack" 
                                    className="stack-img" 
                                    style={{ zIndex: 3 - idx }}
                                  />
                                ))
                              ) : (
                                <span className="no-images-label">No images</span>
                              )}
                              {v.images && v.images.length > 3 && (
                                <span className="stack-more">+{v.images.length - 3}</span>
                              )}
                            </div>
                          </td>

                          {/* Table Row Action Buttons */}
                          <td>
                            <div className="row-actions-group">
                              {isEditing ? (
                                <div className="inline-editing-actions">
                                  <button onClick={() => saveVariantRow(index)} className="btn-save-inline" title="Save">
                                    ✓
                                  </button>
                                  <button onClick={() => setEditingIndex(null)} className="btn-cancel-inline" title="Cancel">
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => startEditing(index)} className="btn-action-icon" title="Edit SKU/Stock">
                                    <IconEdit />
                                  </button>
                                  <button onClick={() => deleteVariant(index)} className="btn-action-icon btn-delete" title="Delete Variant">
                                    <IconDelete />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {variants.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-catalog-label">
                          No variations configured for this product catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerProductDetails;
