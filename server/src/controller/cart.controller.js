import mongoose from "mongoose"
import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"
import { stockOfVariant } from "../dao/product.dao.js"

export const addToCart = async (req, res) => {
    console.log("DEBUG: addToCart controller hit! params:", req.params, "body:", req.body, "user:", req.user?._id)
    try {
        const { productId, variantId } = req.params
        const quantity = Number(req.body.quantity || 1)

        const product = await productModel.findById(productId)
        if (!product) {
            console.log("DEBUG: Product not found:", productId)
            return res.status(404).json({
                message: "Product not found",
                success: false
            })
        }

        let activeVariant = null
        if (variantId) {
            activeVariant = product.variants.id(variantId)
            if (!activeVariant) {
                console.log("DEBUG: Product variant not found:", variantId)
                return res.status(404).json({
                    message: "Product variant not found",
                    success: false
                })
            }
        }

        const stock = await stockOfVariant(productId, variantId)
        console.log("DEBUG: Stock resolved:", stock)

        const cart = await cartModel.findOne({ user: req.user._id }) || await cartModel.create({ user: req.user._id })
        console.log("DEBUG: Cart resolved. Current items count:", cart.items.length)

        const cartItem = cart.items.find(item =>
            item.product.toString() === productId &&
            (item.variant ? item.variant.toString() : "") === (variantId || "") &&
            (item.size || "") === (req.body.size || "")
        )

        if (cartItem) {
            const quantityInCart = cartItem.quantity
            console.log("DEBUG: Item already in cart. Current qty:", quantityInCart)
            if (quantityInCart + quantity <= 0) {
                cart.items = cart.items.filter(item =>
                    !(item.product.toString() === productId &&
                        (item.variant ? item.variant.toString() : "") === (variantId || "") &&
                        (item.size || "") === (req.body.size || ""))
                )
                await cart.save()
                console.log("DEBUG: Item removed from cart. Saved items count:", cart.items.length)
                return res.status(200).json({
                    message: "Item removed from cart successfully",
                    success: true
                })
            }
            if (quantityInCart + quantity > stock) {
                console.log("DEBUG: Stock limit exceeded. Stock:", stock, "Requested:", quantityInCart + quantity)
                return res.status(400).json({
                    message: `Only ${stock} items are in stock, and you already have ${quantityInCart} items in cart`,
                    success: false
                })
            }
            cartItem.quantity += quantity
            const savedCart = await cart.save()
            console.log("DEBUG: Cart updated successfully. Saved items count:", savedCart.items.length)
            return res.status(200).json({
                message: "Item quantity updated successfully",
                success: true
            })
        }

        if (quantity > stock) {
            console.log("DEBUG: Quantity exceeds stock. Stock:", stock, "Requested:", quantity)
            return res.status(400).json({
                message: `Only ${stock} items are in stock.`,
                success: false
            })
        }

        const itemPrice = activeVariant && activeVariant.price ? activeVariant.price : product.price
        console.log("DEBUG: Adding new item with price:", itemPrice)

        cart.items.push({
            product: productId,
            variant: variantId || undefined,
            size: req.body.size || undefined,
            quantity,
            price: itemPrice
        })
        const savedCart = await cart.save()
        console.log("DEBUG: New item added successfully. Saved items count:", savedCart.items.length)
        return res.status(200).json({
            message: "Item added to cart successfully",
            success: true
        })

    } catch (error) {
        console.error("DEBUG ERROR: Error in addToCart:", error)
        return res.status(500).json({
            message: error.message,
            success: false
        })
    }
}
export const getCart = async (req, res) => {
    try {
        const user = req.user

        // Use aggregate to populate product AND compute totalPrice in one query.
        // IMPORTANT: use $lookup pipeline so variants are kept as an array (not unwound),
        // which correctly handles items that have no variant selected.
        const results = await cartModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user._id)
                }
            },
            { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'items.product'
                }
            },
            { $unwind: { path: '$items.product', preserveNullAndEmptyArrays: true } },
            // Compute the live current price for each item (variant price or product price)
            {
                $addFields: {
                    'items.currentPrice': {
                        $let: {
                            vars: {
                                matchedVariant: {
                                    $first: {
                                        $filter: {
                                            input: { $ifNull: ['$items.product.variants', []] },
                                            as: 'v',
                                            cond: { $eq: ['$$v._id', '$items.variant'] }
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$$matchedVariant', null] }, { $ne: ['$$matchedVariant.price', null] }] },
                                    then: '$$matchedVariant.price',
                                    else: '$items.product.price'
                                }
                            }
                        }
                    },
                    // savedPrice = price stored in DB at the time user added this item
                    'items.savedPrice': '$items.price',
                    // itemTotalAmount = quantity * live price (for totalPrice sum)
                    'itemTotalAmount': {
                        $multiply: [
                            '$items.quantity',
                            {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $ne: ['$items.variant', null] },
                                            {
                                                $gt: [{
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$items.product.variants', []] },
                                                            as: 'v',
                                                            cond: { $eq: ['$$v._id', '$items.variant'] }
                                                        }
                                                    }
                                                }, 0]
                                            }
                                        ]
                                    },
                                    then: {
                                        $getField: {
                                            field: 'amount',
                                            input: {
                                                $getField: {
                                                    field: 'price',
                                                    input: {
                                                        $first: {
                                                            $filter: {
                                                                input: { $ifNull: ['$items.product.variants', []] },
                                                                as: 'v',
                                                                cond: { $eq: ['$$v._id', '$items.variant'] }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    else: '$items.product.price.amount'
                                }
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    user: { $first: '$user' },
                    totalPrice: { $sum: '$itemTotalAmount' },
                    currency: { $first: '$items.currentPrice.currency' },
                    items: { $push: '$items' }
                }
            }
        ])

        // aggregate() returns plain JS objects — no .toObject() needed
        let cart = results[0]

        if (!cart) {
            // Empty or new cart — create one
            await cartModel.create({ user: user._id, items: [] })
            cart = { _id: null, user: user._id, items: [], totalPrice: 0, currency: 'INR' }
        }

        // Attach priceChanged flag to each item
        for (const item of cart.items) {
            if (item.savedPrice && item.currentPrice) {
                item.priceChanged = item.savedPrice.amount !== item.currentPrice.amount
            }
        }

        return res.status(200).json({
            message: "Cart fetched successfully",
            success: true,
            cart
        })
    } catch (error) {
        console.error("getCart error:", error)
        return res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId, variantId } = req.params
        const { size } = req.query
        const cart = await cartModel.findOne({ user: req.user._id })

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            })
        }

        cart.items = cart.items.filter(item =>
            !(item.product.toString() === productId &&
                (item.variant ? item.variant.toString() : "") === (variantId || "") &&
                (!size || item.size === size))
        )

        await cart.save()
        return res.status(200).json({
            message: "Item removed from cart successfully",
            success: true,
            cart
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { oldVariantId, oldSize, newVariantId, newSize } = req.body;

        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false });
        }

        // Find the item to update
        const item = cart.items.find(item =>
            item.product.toString() === productId &&
            (item.variant ? item.variant.toString() : "") === (oldVariantId || "") &&
            (item.size || "") === (oldSize || "")
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart", success: false });
        }

        // Target values
        const targetVariantId = newVariantId !== undefined ? newVariantId : (item.variant ? item.variant.toString() : undefined);
        const targetSize = newSize !== undefined ? newSize : item.size;

        // Check if another item with the target variant and size already exists. If so, merge them!
        const existingItem = cart.items.find(i =>
            i !== item &&
            i.product.toString() === productId &&
            (i.variant ? i.variant.toString() : "") === (targetVariantId || "") &&
            (i.size || "") === (targetSize || "")
        );

        if (existingItem) {
            existingItem.quantity += item.quantity;
            cart.items = cart.items.filter(i => i !== item);
        } else {
            if (newVariantId !== undefined) {
                item.variant = newVariantId || undefined;
            }
            if (newSize !== undefined) {
                item.size = newSize || undefined;
            }
        }

        await cart.save();
        return res.status(200).json({ message: "Cart item updated successfully", success: true, cart });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}