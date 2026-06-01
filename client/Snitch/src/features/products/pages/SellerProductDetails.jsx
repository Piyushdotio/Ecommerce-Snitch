import React, { useState, useEffect, useRef } from "react";
import { useProduct } from "../hook/useProduct";
import { useParams, Link } from "react-router-dom";
import "./style/sellerproductdetail.scss";

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
  const { productId } = useParams();
  const { handlegetProductById } = useProduct();

  // Basic Product State
  const [productTitle, setProductTitle] = useState("");
  const [basePrice, setBasePrice] = useState("8999");
  const [skuCode, setSkuCode] = useState("SN-BLZ-ARCH");
  const [status, setStatus] = useState("active");

  // Variants Array State
  const [variants, setVariants] = useState([]);

  // UI Interactive States
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // New variant form states
  const [newSku, setNewSku] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newPrice, setNewPrice] = useState("");
  
  // Ref and state for variant image uploads
  const fileInputRef = useRef(null);
  const [variantImages, setVariantImages] = useState([]);

  // Dynamic attributes state
  const [newAttributes, setNewAttributes] = useState([
    { key: "Color", value: "" },
    { key: "Size", value: "" }
  ]);

  // Inline edit state values for editing variants
  const [editSku, setEditSku] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);

  // Trigger custom toast notification
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Initial Load of product details
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      if (!productId) return;
      try {
        const data = await handlegetProductById(productId);
        if (!ignore && data) {
          const prod = data.product || data;
          setProductTitle(prod.title || "Product Name");
          setBasePrice(prod.price?.amount || "8999");
          setSkuCode(prod._id ? `SN-BLZ-${prod._id.slice(-6).toUpperCase()}` : "SN-BLZ-ARCH");
          
          if (prod.variants && prod.variants.length > 0) {
            const mappedVariants = prod.variants.map((v) => {
              const attrs = v.attributes instanceof Map 
                ? Object.fromEntries(v.attributes) 
                : (v.attributes || {});

              // Map dynamic attributes to array format
              const formattedAttrs = Object.entries(attrs).map(([key, val]) => ({
                key: key.charAt(0).toUpperCase() + key.slice(1),
                value: val || ""
              }));

              return {
                id: v._id || Math.random().toString(36).substring(7),
                sku: attrs.sku || attrs.Sku || `SN-VAR-${Math.random().toString(36).substring(7).toUpperCase()}`,
                stock: v.stock || 0,
                price: v.price?.amount || prod.price?.amount || 8999,
                attributes: formattedAttrs.length > 0 ? formattedAttrs : [{ key: "Color", value: "Black" }],
                images: v.images || ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
              };
            });
            setVariants(mappedVariants);
          } else {
            // Mock variants if none exist to demonstrate visual UI
            setVariants([
              { 
                id: "1", 
                sku: "SN-BLZ-BLK-M", 
                stock: 45, 
                price: prod.price?.amount || 8999, 
                attributes: [{ key: "Color", value: "Black" }, { key: "Size", value: "M" }],
                images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
              },
              { 
                id: "2", 
                sku: "SN-BLZ-BLK-L", 
                stock: 8, 
                price: prod.price?.amount || 8999, 
                attributes: [{ key: "Color", value: "Black" }, { key: "Size", value: "L" }],
                images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
              },
              { 
                id: "3", 
                sku: "SN-BLZ-BLK-XL", 
                stock: 0, 
                price: prod.price?.amount || 8999, 
                attributes: [{ key: "Color", value: "Black" }, { key: "Size", value: "XL" }],
                images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load product", err);
        addToast("Error fetching product details", "error");
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [productId, handlegetProductById]);

  // Stock badge helper
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

  // Image Upload Handlers
  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

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

  const removeVariantImage = (index) => {
    const updated = [...variantImages];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setVariantImages(updated);
  };

  // Dynamic Attributes Editor Handlers
  const addAttributeRow = () => {
    setNewAttributes([...newAttributes, { key: "", value: "" }]);
  };

  const removeAttributeRow = (index) => {
    setNewAttributes(newAttributes.filter((_, i) => i !== index));
  };

  const updateAttributeRow = (index, field, val) => {
    const updated = [...newAttributes];
    updated[index][field] = val;
    setNewAttributes(updated);
  };

  // Add new variant to local state
  const handleAddVariant = (e) => {
    e.preventDefault();
    if (!newSku) {
      addToast("SKU Code is required to configure a variant", "error");
      return;
    }

    const priceVal = newPrice ? Number(newPrice) : Number(basePrice);
    const stockVal = newStock ? Number(newStock) : 0;

    // Filter empty attributes
    const cleanAttributes = newAttributes.filter((attr) => attr.key.trim() !== "" && attr.value.trim() !== "");

    const newVarObj = {
      id: Math.random().toString(36).substring(7),
      sku: newSku,
      stock: stockVal,
      price: priceVal,
      attributes: cleanAttributes.length > 0 ? cleanAttributes : [{ key: "Option", value: "Default" }],
      images: variantImages.length > 0 ? variantImages : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=120"]
    };

    setVariants([...variants, newVarObj]);
    addToast("Variant added to catalog locally");

    // Reset Form fields
    setNewSku("");
    setNewStock("");
    setNewPrice("");
    setVariantImages([]);
    setNewAttributes([
      { key: "Color", value: "" },
      { key: "Size", value: "" }
    ]);
  };

  // Inline editing actions for active variants catalog
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditSku(variants[index].sku);
    setEditStock(variants[index].stock);
    setEditPrice(variants[index].price);
  };

  const saveVariantRow = (index) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      sku: editSku,
      stock: Number(editStock),
      price: Number(editPrice)
    };
    setVariants(updated);
    setEditingIndex(null);
    addToast("Variant updated successfully");
  };

  const deleteVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
    addToast("Variant removed from catalog", "error");
  };

  // Mock save actions
  const saveAllChanges = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast("Catalog variations saved successfully! (Simulated)");
    }, 1000);
  };

  return (
    <div className="seller-product-details-container">
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
                
                {/* Basic inventory row */}
                <div className="form-grid-pricing">
                  <div className="form-group">
                    <label>SKU Code</label>
                    <input 
                      type="text" 
                      value={newSku} 
                      onChange={(e) => setNewSku(e.target.value)} 
                      placeholder="e.g. SN-BLZ-CH-M"
                      required
                    />
                  </div>
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
                    <label>Price Override (₹)</label>
                    <input 
                      type="number" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)} 
                      placeholder={basePrice}
                    />
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
                              {v.attributes.map((attr, idx) => (
                                attr.key && attr.value && (
                                  <span key={idx} className="property-tag">
                                    <span className="prop-name">{attr.key}:</span>
                                    <span className="prop-val">{attr.value}</span>
                                  </span>
                                )
                              ))}
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
                              <input 
                                type="number" 
                                className="inline-edit-input" 
                                value={editPrice} 
                                onChange={(e) => setEditPrice(e.target.value)}
                              />
                            ) : (
                              `₹${Number(v.price).toLocaleString("en-IN")}`
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
                                    src={img.preview || img} 
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
