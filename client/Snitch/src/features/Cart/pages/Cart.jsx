import React, { useEffect, useState } from 'react'
import { useCart } from "../hook/useCart"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import "./Cart.scss"

const Cart = () => {
  const items = useSelector((state) => state.cart.items || [])
  const { handleGetCart, handleAddItem, handleRemoveItem, handleUpdateItem } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        await handleGetCart()
      } catch (err) {
        setError(err.message || "Failed to load cart")
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  const handleQtyChange = async (item, delta) => {
    const uniqueId = `${item.product._id}-${item.variant || ""}-${item.size || ""}`
    try {
      setUpdatingItemId(uniqueId)
      await handleAddItem({
        productId: item.product._id,
        variantId: item.variant,
        quantity: delta,
        size: item.size
      })
    } catch (err) {
      console.error("Error updating quantity:", err)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemove = async (item) => {
    const uniqueId = `${item.product._id}-${item.variant || ""}-${item.size || ""}`
    try {
      setUpdatingItemId(uniqueId)
      await handleRemoveItem({
        productId: item.product._id,
        variantId: item.variant,
        size: item.size
      })
    } catch (err) {
      console.error("Error removing item:", err)
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Helper: Format Price
  const formatPrice = (priceObj) => {
    if (!priceObj) return "₹0.00"
    const { amount, currency = "INR" } = priceObj
    const symbols = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥"
    }
    const symbol = symbols[currency] || "₹"
    return `${symbol}${amount.toLocaleString()}`
  }

  // Helper: Get cart item image
  const getCartItemImage = (item) => {
    if (!item.product) return ""
    if (item.variant && item.product.variants) {
      const variant = item.product.variants.find(v => v._id === item.variant)
      if (variant && variant.images && variant.images.length > 0) {
        return variant.images[0].url
      }
    }
    return item.product.images?.[0]?.url || ""
  }

  // Helper: Compute price change status
  // Backend sends:  item.savedPrice   = price at time user added (from MongoDB)
  //                 item.currentPrice  = live price from seller right now
  // Seller RAISED  price → currentPrice > savedPrice → "increase" → RED warning
  // Seller LOWERED price → currentPrice < savedPrice → "drop"     → GREEN savings
  const getPriceChangeInfo = (item) => {
    const savedAmount   = (item.savedPrice || item.price)?.amount   // original price in DB
    const currentAmount = item.currentPrice?.amount                  // live seller price
    const currency = item.currentPrice?.currency || item.savedPrice?.currency || item.price?.currency || "INR"
    if (savedAmount == null || currentAmount == null || currentAmount === savedAmount) return null
    const diff = currentAmount - savedAmount   // +ve = raised, -ve = lowered
    const savings = Math.abs(diff)
    return {
      type: diff > 0 ? "increase" : "drop",   // diff > 0  means seller RAISED price
      currentPrice: item.currentPrice,
      savedPrice: item.savedPrice || item.price,
      savings,
      currency
    }
  }

  // Helper: Get available sizes for the variant (keeps same color/etc.)
  const getAvailableSizes = (item) => {
    if (!item.product || !item.product.variants || item.product.variants.length === 0) return []
    
    // Find the attribute key representing size (e.g. size or Size)
    let sizeKey = null
    for (const v of item.product.variants) {
      if (v.attributes) {
        const found = Object.keys(v.attributes).find(k => k.toLowerCase() === 'size')
        if (found) {
          sizeKey = found
          break
        }
      }
    }

    if (!sizeKey) return []

    const currentVariant = item.product.variants.find(v => v._id === item.variant)
    if (currentVariant && currentVariant.attributes) {
      const currentAttrs = currentVariant.attributes
      return item.product.variants.filter(v => {
        if (!v.attributes) return false
        return Object.entries(currentAttrs).every(([key, val]) => {
          if (key === sizeKey) return true
          return String(v.attributes[key]).toLowerCase() === String(val).toLowerCase()
        })
      }).map(v => ({
        variantId: v._id,
        size: v.attributes[sizeKey]
      })).filter((v, i, self) => 
        self.findIndex(t => t.size === v.size) === i
      )
    }

    // Fallback: If item has no variant selected yet, return all available sizes
    return item.product.variants
      .filter(v => v.attributes && v.attributes[sizeKey])
      .map(v => ({
        variantId: v._id,
        size: v.attributes[sizeKey]
      })).filter((v, i, self) => 
        self.findIndex(t => t.size === v.size) === i
      )
  }

  // Helper: Get non-size variant attributes (like Color: Black)
  const getNonSizeAttributes = (item) => {
    if (!item.product || !item.variant) return null
    const variant = item.product.variants?.find(v => v._id === item.variant)
    if (!variant || !variant.attributes) return null
    
    const attrs = variant.attributes
    const nonSizeLabels = Object.entries(attrs)
      .filter(([key]) => key.toLowerCase() !== 'size')
      .map(([key, val]) => `${key}: ${val}`)
    return nonSizeLabels.length > 0 ? nonSizeLabels.join(" | ") : null
  }

  // Helper: Get current size attribute value or item.size
  const getItemSize = (item) => {
    if (item.size) return item.size
    if (!item.product || !item.variant) return null
    const variant = item.product.variants?.find(v => v._id === item.variant)
    if (!variant || !variant.attributes) return null
    
    const sizeKey = Object.keys(variant.attributes).find(k => k.toLowerCase() === 'size')
    return sizeKey ? variant.attributes[sizeKey] : null
  }

  // Helper: Get variant ID matching size if variant is undefined
  const getSelectedVariantValue = (item) => {
    if (item.variant) return item.variant
    if (item.size && item.product?.variants) {
      const match = item.product.variants.find(v => 
        v.attributes && 
        Object.entries(v.attributes).some(([key, val]) => 
          key.toLowerCase() === 'size' && String(val).toLowerCase() === String(item.size).toLowerCase()
        )
      )
      if (match) return match._id
    }
    return ""
  }

  const handleSizeChange = async (item, newVariantId) => {
    if (item.variant === newVariantId) return
    const uniqueId = `${item.product._id}-${item.variant || ""}-${item.size || ""}`
    try {
      setUpdatingItemId(uniqueId)
      
      const newVariant = item.product.variants?.find(v => v._id === newVariantId)
      let newSize = undefined
      if (newVariant && newVariant.attributes) {
        const sizeKey = Object.keys(newVariant.attributes).find(k => k.toLowerCase() === 'size')
        if (sizeKey) {
          newSize = newVariant.attributes[sizeKey]
        }
      }

      await handleUpdateItem({
        productId: item.product._id,
        oldVariantId: item.variant,
        oldSize: item.size,
        newVariantId: newVariantId,
        newSize: newSize
      })
    } catch (err) {
      console.error("Error changing size:", err)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleStandaloneSizeChange = async (item, newSize) => {
    if (item.size === newSize) return
    const uniqueId = `${item.product._id}-${item.variant || ""}-${item.size || ""}`
    try {
      setUpdatingItemId(uniqueId)
      await handleUpdateItem({
        productId: item.product._id,
        oldVariantId: item.variant,
        oldSize: item.size,
        newSize: newSize
      })
    } catch (err) {
      console.error("Error changing standalone size:", err)
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Calculations — use savedPrice (original) for subtotal display; currentPrice for alerts
  const subtotal = items.reduce((acc, item) => {
    const price = item.savedPrice || item.price
    const amount = price?.amount || 0
    return acc + (amount * item.quantity)
  }, 0)

  const currency = items[0]?.price?.currency || "INR"
  const threshold = currency === "INR" ? 2000 : 30
  const shippingCost = subtotal >= threshold || subtotal === 0 ? 0 : (currency === "INR" ? 150 : 5)
  const progressFill = subtotal >= threshold ? 100 : (subtotal / threshold) * 100
  const amountNeededForFreeShipping = threshold - subtotal

  const tax = 0
  const total = subtotal + shippingCost

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-page__container">
          <div className="cart-page__header">
            <h1 className="cart-page__title">Shopping Cart</h1>
            <span className="cart-page__count">...</span>
          </div>
          <div className="cart-page__grid">
            <div className="cart-page__items-list">
              {[1, 2].map((i) => (
                <div key={i} className="card skeleton-card" style={{ height: '170px' }} />
              ))}
            </div>
            <div className="card summary-panel skeleton-card" style={{ height: '320px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page__container">
          <div className="empty-state">
            <div className="empty-state__glow">
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <h2 className="empty-state__title">Your bag is empty</h2>
            <p className="empty-state__subtitle">
              Looks like you haven't added anything to your cart yet. Let's find some style.
            </p>
            <Link to="/" className="btn btn-primary empty-state__btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-page__container">
        
        <header className="cart-page__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="cart-page__back-btn" title="Back to Home" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', cursor: 'pointer' }}>arrow_back</span>
            </Link>
            <h1 className="cart-page__title" style={{ margin: 0 }}>Shopping Bag</h1>
          </div>
          <span className="cart-page__count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </header>

        <div className="cart-page__grid">
          
          {/* Cart Items List */}
          <main className="cart-page__items-list">
            {items.map((item) => {
              const uniqueId = `${item.product._id}-${item.variant || ""}-${item.size || ""}`
              const isUpdating = updatingItemId === uniqueId
              
              return (
                <article key={uniqueId} className="card cart-item" style={{ opacity: isUpdating ? 0.7 : 1 }}>
                  
                  {/* Product Image */}
                  <div className="cart-item__image-wrapper">
                    <img 
                      src={getCartItemImage(item)} 
                      alt={item.product.title} 
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="cart-item__details">
                    <div className="cart-item__meta">
                      <div>
                        <h3 className="cart-item__title">
                          <a href={`/product/${item.product._id}`}>{item.product.title}</a>
                        </h3>
                        {(item.variant || item.size || getAvailableSizes(item).length > 0) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {getNonSizeAttributes(item) && (
                              <span className="cart-item__variant">
                                {getNonSizeAttributes(item)}
                              </span>
                            )}
                            {getAvailableSizes(item).length > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Size:</span>
                                <select 
                                  className="cart-item__size-select"
                                  value={getSelectedVariantValue(item)}
                                  onChange={(e) => handleSizeChange(item, e.target.value)}
                                  disabled={isUpdating}
                                >
                                  {!getSelectedVariantValue(item) && <option value="" disabled>Select Size</option>}
                                  {getAvailableSizes(item).map((opt) => (
                                    <option key={opt.variantId} value={opt.variantId}>
                                      {opt.size}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Size:</span>
                                <select 
                                  className="cart-item__size-select"
                                  value={item.size || "M"}
                                  onChange={(e) => handleStandaloneSizeChange(item, e.target.value)}
                                  disabled={isUpdating}
                                >
                                  {["S", "M", "L", "XL", "2XL"].map((sz) => (
                                    <option key={sz} value={sz}>
                                      {sz}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="cart-item__price-info">
                        {/* Always show the relevant price in the top-right */}
                        {(() => {
                          const pc = getPriceChangeInfo(item)
                          if (pc && pc.type === "increase") {
                            // New HIGHER price shown in red
                            return (
                              <span className="cart-item__price cart-item__price--increased">
                                {formatPrice(pc.currentPrice)}
                              </span>
                            )
                          }
                          // Normal price (original saved price) — same for no-change and drop
                          return (
                            <span className="cart-item__price">
                              {formatPrice(item.savedPrice || item.price)}
                            </span>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Price change alert — full-width row below product info */}
                    {(() => {
                      const pc = getPriceChangeInfo(item)
                      if (!pc) return null
                      if (pc.type === "drop") {
                        return (
                          <p className="cart-item__price-alert cart-item__price-alert--drop">
                            You are saving {formatPrice({ amount: pc.savings, currency: pc.currency })} on this, get it now at {formatPrice(pc.currentPrice)}/-
                          </p>
                        )
                      }
                      return (
                        <p className="cart-item__price-alert cart-item__price-alert--increase">
                          ⚠ Price has increased by {formatPrice({ amount: pc.savings, currency: pc.currency })}. You added this at {formatPrice(pc.savedPrice)}.
                        </p>
                      )
                    })()}

                    {/* Quantity controls & Remove */}
                    <div className="cart-item__controls">
                      <div className="cart-item__quantity">
                        <button 
                          onClick={() => handleQtyChange(item, -1)} 
                          aria-label="Decrease quantity"
                          disabled={isUpdating}
                        >
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <input 
                          type="text" 
                          value={item.quantity} 
                          aria-label="Quantity" 
                          readOnly 
                        />
                        <button 
                          onClick={() => handleQtyChange(item, 1)} 
                          aria-label="Increase quantity"
                          disabled={isUpdating}
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      <button 
                        className="cart-item__remove" 
                        onClick={() => handleRemove(item)}
                        aria-label="Remove item"
                        disabled={isUpdating}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                  </div>

                </article>
              )
            })}
          </main>

          {/* Sticky Summary Sidebar */}
          <aside className="card summary-panel card--elevated">
            <h2 className="summary-panel__title">Order Summary</h2>

            {/* Free Shipping tracker */}
            <div className="summary-panel__shipping-tracker">
              {subtotal >= threshold ? (
                <div className="summary-panel__shipping-text summary-panel__shipping-text--free">
                  Congratulations! You've unlocked <span>Free Shipping</span>
                </div>
              ) : (
                <div className="summary-panel__shipping-text">
                  Add <span>{formatPrice({ amount: amountNeededForFreeShipping, currency })}</span> more to get <span>Free Shipping</span>
                </div>
              )}
              <div className="summary-panel__progress-bar">
                <div 
                  className="summary-panel__progress-fill" 
                  style={{ width: `${progressFill}%` }}
                />
              </div>
            </div>

            {/* Breakdown rows */}
            <div className="summary-panel__breakdown">
              <div className="summary-panel__row">
                <span>Subtotal</span>
                <span className="summary-panel__value">{formatPrice({ amount: subtotal, currency })}</span>
              </div>
              <div className="summary-panel__row">
                <span>Estimated Shipping</span>
                <span className="summary-panel__value">
                  {shippingCost === 0 ? "FREE" : formatPrice({ amount: shippingCost, currency })}
                </span>
              </div>
              <div className="summary-panel__row summary-panel__row--total">
                <span>Total</span>
                <span className="summary-panel__value">{formatPrice({ amount: total, currency })}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <button className="btn btn-primary btn-lg summary-panel__checkout-btn">
              Proceed to Checkout
            </button>

            <Link to="/" className="summary-panel__back-link">
              <span className="material-symbols-outlined">arrow_back</span>
              Continue Shopping
            </Link>

          </aside>

        </div>

      </div>
    </div>
  )
}

export default Cart