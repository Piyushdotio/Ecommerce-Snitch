import express from "express";
import { addToCart,getCart } from "../controller/cart.controller.js";
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
 * @route Post /api/cart/getCart
 * @description Get user's cart
 * @access Private
 */
router.get("/getCart",verifyUser,getCart)

export default router