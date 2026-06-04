import express from "express";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controller/cart.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { validateAddToCart } from "../validator/cart.validator.js";


const router = express.Router();




/**
 * @route Post /api/cart/add/:productId/:variantId
 * @description Add item to cart
 * @access Private
 * @argument productId - Id of the product to add
 * @argument variantId - Id of the variant to add(optional)
 * @argument quantity  - Quantity of the item to add(optional,default: 1)
 */

router.post("/add/:productId/:variantId", verifyUser,validateAddToCart, addToCart)
router.post("/add/:productId", verifyUser,validateAddToCart, addToCart)
/**
 * @route Get /api/cart/getCart
 * @description Get user's cart
 * @access Private
 */
router.get("/getCart",verifyUser,getCart)

/**
 * @route Delete /api/cart/remove/:productId/:variantId
 * @description Remove item from cart
 * @access Private
 * @argument productId - Id of the product to remove
 * @argument variantId - Id of the variant to remove(optional)
 * @query size - Size of the item to remove(optional)
 */
router.delete("/remove/:productId/:variantId", verifyUser, removeFromCart)
router.delete("/remove/:productId", verifyUser, removeFromCart)

/**
 * @route Put /api/cart/update/:productId
 * @description Update cart item (size or variant) atomically in a single request
 * @access Private
 * @argument productId - Id of the product to update
 * @body oldVariantId - Current variant ID of the item
 * @body oldSize - Current size of the item
 * @body newVariantId - New variant ID of the item(optional)
 * @body newSize - New size of the item(optional)
 */
router.put("/update/:productId", verifyUser, updateCartItem)

export default router