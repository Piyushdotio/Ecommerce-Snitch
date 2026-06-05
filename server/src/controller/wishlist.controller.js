import wishlistModel from "../models/wishlist.model.js";

/**
 * GET /api/wishlist
 * Returns the authenticated user's wishlist with populated product details.
 */
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await wishlistModel
      .findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        model: "product",
        select: "title price images variants description",
      });

    if (!wishlist) {
      wishlist = { items: [] };
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch wishlist",
    });
  }
};

/**
 * POST /api/wishlist/toggle/:productId
 * Adds the product if not in wishlist; removes it if already present.
 * Returns { wishlisted: true/false } so the client can update UI.
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await wishlistModel.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await wishlistModel.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId
    );

    let wishlisted;
    if (existingIndex !== -1) {
      // Already in wishlist — remove it
      wishlist.items.splice(existingIndex, 1);
      wishlisted = false;
    } else {
      // Not in wishlist — add it
      wishlist.items.push({ product: productId });
      wishlisted = true;
    }

    await wishlist.save();

    return res.status(200).json({
      success: true,
      wishlisted,
      message: wishlisted
        ? "Added to wishlist"
        : "Removed from wishlist",
    });
  } catch (error) {
    console.error("toggleWishlist error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update wishlist",
    });
  }
};
