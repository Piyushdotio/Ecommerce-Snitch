import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../hook/useWishlist";
import { useCart } from "../../Cart/hook/useCart";
import { useSelector } from "react-redux";
import "./Wishlist.scss";

const Wishlist = () => {
  const navigate = useNavigate();
  const { handleGetWishlist, handleToggleWishlist, wishlistItems } = useWishlist();
  const { handleAddItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        await handleGetWishlist();
      } catch (err) {
        // silently fail — user may not be authenticated
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getProductImage = (item) => {
    const product = item.product;
    if (!product) return "";
    // Primary: top-level product images (most common)
    if (product.images?.length > 0) {
      return product.images[0].url;
    }
    // Fallback: variant images
    if (product.variants?.length > 0 && product.variants[0].images?.length > 0) {
      return product.variants[0].images[0].url;
    }
    return "";
  };

  const formatPrice = (product) => {
    const amount = product?.price?.amount || 0;
    const currency = product?.price?.currency || "INR";
    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
    return `${symbols[currency] || "₹"}${Number(amount).toLocaleString("en-IN")}`;
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await handleToggleWishlist(productId);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    const product = item.product;
    if (!product?._id) return;
    setAddingId(product._id);
    try {
      await handleAddItem({ productId: product._id, size: "M" });
      navigate("/cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert(err.message || "Failed to add product to cart");
    } finally {
      setAddingId(null);
    }
  };

  const skeletons = [1, 2, 3, 4];

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__container">

        {/* Header */}
        <header className="wishlist-page__header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              to="/"
              style={{ display: "flex", alignItems: "center", color: "inherit", textDecoration: "none" }}
              title="Back to Home"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "28px", cursor: "pointer" }}>
                arrow_back
              </span>
            </Link>
            <h1 className="wishlist-page__title">Wishlist</h1>
          </div>
          <span className="wishlist-page__count">
            {loading ? "…" : `${wishlistItems.length} ${wishlistItems.length === 1 ? "item" : "items"}`}
          </span>
        </header>

        {/* Skeleton loading */}
        {loading && (
          <div className="wishlist-grid">
            {skeletons.map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-card__image" />
                <div className="skeleton-card__text">
                  <div className="skeleton-card__line" />
                  <div className="skeleton-card__line skeleton-card__line--short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && wishlistItems.length === 0 && (
          <div className="wishlist-empty">
            <div className="wishlist-empty__glow" aria-hidden="true">♡</div>
            <h2 className="wishlist-empty__title">Your wishlist is empty</h2>
            <p className="wishlist-empty__subtitle">
              Save items you love and come back to them anytime.
            </p>
            <Link to="/" className="wishlist-empty__btn">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                storefront
              </span>
              Explore Products
            </Link>
          </div>
        )}

        {/* Product grid */}
        {!loading && wishlistItems.length > 0 && (
          <div className="wishlist-grid" role="list" aria-label="Wishlisted products">
            {wishlistItems.map((item) => {
              const product = item.product;
              if (!product?._id) return null;
              const imgUrl = getProductImage(item);
              const isRemoving = removingId === product._id;
              const isAdding = addingId === product._id;

              return (
                <article
                  key={product._id}
                  className="wishlist-card"
                  role="listitem"
                  style={{ opacity: isRemoving ? 0.5 : 1 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Image */}
                  <div className="wishlist-card__image-wrapper">
                    <img
                      src={imgUrl}
                      alt={product.title}
                      className="wishlist-card__img"
                      loading="lazy"
                    />

                    {/* Remove (heart) button */}
                    <button
                      className="wishlist-card__remove"
                      onClick={(e) => { e.stopPropagation(); handleRemove(product._id); }}
                      aria-label={`Remove ${product.title} from wishlist`}
                      disabled={isRemoving}
                      title="Remove from wishlist"
                    >
                      ♥
                    </button>

                    {/* Hover Add to Cart */}
                    <div className="wishlist-card__actions">
                      <button
                        className="wishlist-card__add-btn"
                        onClick={(e) => handleAddToCart(e, item)}
                        disabled={isAdding}
                        aria-label={`Add ${product.title} to cart`}
                      >
                        {isAdding ? "Adding…" : "Add to Cart"}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="wishlist-card__info">
                    <p className="wishlist-card__title">{product.title}</p>
                    <span className="wishlist-card__price">{formatPrice(product)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
