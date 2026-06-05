import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../hook/useCart"
import { useTheme } from "../../../app/ThemeContext"
import "./Orders.scss"

const Orders = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { handleGetOrders } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await handleGetOrders()
        if (data.success) {
          setOrders(data.orders || [])
        } else {
          setError(data.message || "Failed to fetch orders")
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatPriceObj = (priceObj) => {
    if (!priceObj) return "₹0"
    const { amount, currency = "INR" } = priceObj
    const symbols = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥"
    }
    const symbol = symbols[currency] || "₹"
    return `${symbol}${amount.toLocaleString("en-IN")}`
  }

  const getOrderDate = (order) => {
    if (order.createdAt) {
      return new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    }
    if (order._id) {
      const timestamp = order._id.toString().substring(0, 8)
      const date = new Date(parseInt(timestamp, 16) * 1000)
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    }
    return "—"
  }

  const getOrderTime = (order) => {
    if (order.createdAt) {
      return new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
    if (order._id) {
      const timestamp = order._id.toString().substring(0, 8)
      const date = new Date(parseInt(timestamp, 16) * 1000)
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
    return ""
  }

  if (loading) {
    return (
      <div className="orders-page" data-theme={theme}>
        <div className="orders-page__container">
          <div className="orders-page__header">
            <h1 className="orders-page__title">My Orders</h1>
            <span className="orders-page__count">Loading...</span>
          </div>
          <div className="orders-page__list">
            {[1, 2].map((i) => (
              <div key={i} className="card skeleton-card" style={{ height: "300px", marginBottom: "20px" }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page" data-theme={theme}>
        <div className="orders-page__container">
          <div className="empty-state">
            <div className="empty-state__glow">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <h2 className="empty-state__title">No Orders Found</h2>
            <p className="empty-state__subtitle">
              Looks like you haven't placed any orders yet. Start exploring our latest collections!
            </p>
            <Link to="/" className="btn btn--primary empty-state__btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page" data-theme={theme}>
      <div className="orders-page__container">
        
        {/* Breadcrumb + Header */}
        <header className="orders-page__header">
          <div className="orders-page__header-left">
            <nav className="breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">/</span>
              <span className="current">Orders</span>
            </nav>
            <h1 className="orders-page__title">My Orders</h1>
            <p className="orders-page__subtitle">
              Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>
          
          <div className="orders-page__header-right">
            <button onClick={toggleTheme} className="action-icon-link theme-toggle-btn" title="Toggle Light/Dark Mode">
              <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}></i>
            </button>
            <Link to="/" className="btn btn--secondary btn--sm">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>storefront</span>
              Shop
            </Link>
          </div>
        </header>

        {error && (
          <div className="error-alert" role="alert">
            <span className="material-symbols-outlined alert-icon">warning</span>
            <span className="alert-message">{error}</span>
          </div>
        )}

        {/* Orders List */}
        <div className="orders-page__list">
          {orders.map((order) => {
            const displayId = order._id.length > 10 ? `#${order._id.slice(-8).toUpperCase()}` : `#${order._id}`
            return (
              <article key={order._id} className="order-card card">
                
                {/* Order Top Summary */}
                <div className="order-card__header">
                  <div className="order-card__header-item">
                    <span className="label">Order Ref</span>
                    <span className="value mono" title={order._id}>{displayId}</span>
                  </div>
                  <div className="order-card__header-item">
                    <span className="label">Placed On</span>
                    <span className="value">
                      {getOrderDate(order)} <span className="time">{getOrderTime(order)}</span>
                    </span>
                  </div>
                  <div className="order-card__header-item">
                    <span className="label">Total Amount</span>
                    <span className="value price">{formatPriceObj(order.price)}</span>
                  </div>
                  <div className="order-card__header-item">
                    <span className="label">Payment Status</span>
                    <span className="value status-badge status-badge--success">
                      <span className="dot" /> Paid
                    </span>
                  </div>
                </div>

                <div className="order-card__divider" />

                {/* Card Main Body: Items + Shipping */}
                <div className="order-card__body">
                  
                  {/* Items List */}
                  <div className="order-card__items">
                    <h3 className="section-title">Items</h3>
                    <div className="items-list">
                      {order.orderItems?.map((item, index) => {
                        const itemImg = item.images?.[0]?.url || "/placeholder.png"
                        return (
                          <div key={item.variantId || index} className="order-item">
                            <div className="order-item__image-wrapper" onClick={() => navigate(`/product/${item.productId}`)}>
                              <img src={itemImg} alt={item.title} className="order-item__image" />
                            </div>
                            
                            <div className="order-item__details">
                              <h4 className="order-item__title" onClick={() => navigate(`/product/${item.productId}`)}>
                                {item.title}
                              </h4>
                              <div className="order-item__meta">
                                {item.size && (
                                  <span className="meta-badge">
                                    Size: <strong>{item.size}</strong>
                                  </span>
                                )}
                                <span className="meta-badge">
                                  Qty: <strong>{item.quantity}</strong>
                                </span>
                              </div>
                            </div>
                            
                            <div className="order-item__pricing">
                              <span className="unit-price">{formatPriceObj(item.price)} each</span>
                              <span className="total-price">
                                {formatPriceObj({
                                  amount: (item.price?.amount || 0) * item.quantity,
                                  currency: item.price?.currency || "INR"
                                })}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="order-card__shipping">
                      <h3 className="section-title">Shipping Address</h3>
                      <div className="shipping-info-card">
                        <div className="shipping-info-card__icon">
                          <span className="material-symbols-outlined">local_shipping</span>
                        </div>
                        <div className="shipping-info-card__details">
                          <h4 className="name">{order.shippingAddress.fullname}</h4>
                          <p className="phone">
                            <span className="material-symbols-outlined inline-icon">phone</span>
                            {order.shippingAddress.phone}
                          </p>
                          <div className="address-lines">
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </article>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Orders
