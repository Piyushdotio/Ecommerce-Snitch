import express from "express";
import { getWishlist, toggleWishlist } from "../controller/wishlist.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route  GET /api/wishlist
 * @desc   Get authenticated user's wishlist (populated products)
 * @access Private
 */
router.get("/", verifyUser, getWishlist);

/**
 * @route  POST /api/wishlist/toggle/:productId
 * @desc   Toggle product in/out of wishlist
 * @access Private
 */
router.post("/toggle/:productId", verifyUser, toggleWishlist);

export default router;
