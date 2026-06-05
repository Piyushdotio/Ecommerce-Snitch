import React from 'react'
import { useLocation, Link } from "react-router-dom"
import "./orderSuccess.scss"

const OrderSuccess = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const orderId = queryParams.get("order_id")

  // Format order ID for display — short form for readability
  const displayId = orderId
    ? orderId.length > 24
      ? `${orderId.slice(0, 12)}…${orderId.slice(-8)}`
      : orderId
    : "—"

  const now = new Date()
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <>
      {/* CSS-only confetti burst on mount */}
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="confetti__dot" />
        ))}
      </div>

      <main className="order-success" role="main">
        <div className="order-success__container">

          {/* Animated checkmark badge */}
          <div className="success-badge" aria-hidden="true">
            <span className="success-badge__ring" />
            <span className="success-badge__ring success-badge__ring--delay" />
            <div className="success-badge__circle">
              <svg
                className="success-badge__check"
                viewBox="0 0 36 36"
                aria-hidden="true"
                focusable="false"
              >
                <polyline
                  className="check-path"
                  points="6,18 14,26 30,10"
                />
              </svg>
            </div>
          </div>

          {/* Main card */}
          <article className="success-card">
            <span className="success-card__eyebrow">Payment Confirmed</span>

            <h1 className="success-card__title">Order Placed!</h1>

            <p className="success-card__subtitle">
              Your order is confirmed and being prepared. You'll receive an
              email update as soon as it ships.
            </p>

            <div className="success-card__divider" role="separator" />

            {/* Order ID block */}
            {orderId && (
              <div className="order-id-block">
                <span className="order-id-block__label">Order Reference</span>
                <div
                  className="order-id-block__value"
                  title={orderId}
                  aria-label={`Order ID: ${orderId}`}
                >
                  {displayId}
                </div>
              </div>
            )}

            {/* Summary rows */}
            <dl className="success-info" aria-label="Order summary">
              <div className="success-info__row">
                <dt className="success-info__key">Status</dt>
                <dd className="success-info__val success-info__val--success">
                  Confirmed
                </dd>
              </div>
              <div className="success-info__row">
                <dt className="success-info__key">Date</dt>
                <dd className="success-info__val">{formattedDate}</dd>
              </div>
              <div className="success-info__row">
                <dt className="success-info__key">Payment</dt>
                <dd className="success-info__val">Razorpay · Paid</dd>
              </div>
            </dl>

            <div className="success-card__divider" role="separator" />

            {/* CTA buttons */}
            <nav className="success-actions" aria-label="Post-order actions">
              <Link to="/" className="btn btn--primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  storefront
                </span>
                Continue Shopping
              </Link>
              <Link to="/orders" className="btn btn--secondary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  receipt_long
                </span>
                View Orders
              </Link>
            </nav>
          </article>

        </div>
      </main>
    </>
  )
}

export default OrderSuccess