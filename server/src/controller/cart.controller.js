import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant, adjustProductStock } from "../dao/product.dao.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service.js";
import { config } from "../config/config.js";
import { getCartDetails } from "../dao/cart.dao.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

export const addToCart = async (req, res) => {
  console.log(
    "DEBUG: addToCart controller hit! params:",
    req.params,
    "body:",
    req.body,
    "user:",
    req.user?._id,
  );
  try {
    const { productId, variantId } = req.params;
    const quantity = Number(req.body.quantity || 1);

    const product = await productModel.findById(productId);
    if (!product) {
      console.log("DEBUG: Product not found:", productId);
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    let activeVariant = null;
    if (variantId) {
      activeVariant = product.variants.id(variantId);
      if (!activeVariant) {
        console.log("DEBUG: Product variant not found:", variantId);
        return res.status(404).json({
          message: "Product variant not found",
          success: false,
        });
      }
    }

    const stock = await stockOfVariant(productId, variantId);
    console.log("DEBUG: Stock resolved:", stock);

    const cart =
      (await cartModel.findOne({ user: req.user._id })) ||
      (await cartModel.create({ user: req.user._id }));
    console.log(
      "DEBUG: Cart resolved. Current items count:",
      cart.items.length,
    );

    const cartItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (item.variant ? item.variant.toString() : "") === (variantId || "") &&
        (item.size || "") === (req.body.size || ""),
    );

    if (cartItem) {
      const quantityInCart = cartItem.quantity;
      console.log("DEBUG: Item already in cart. Current qty:", quantityInCart);
      if (quantityInCart + quantity <= 0) {
        cart.items = cart.items.filter(
          (item) =>
            !(
              item.product.toString() === productId &&
              (item.variant ? item.variant.toString() : "") ===
                (variantId || "") &&
              (item.size || "") === (req.body.size || "")
            ),
        );
        await cart.save();
        await adjustProductStock(productId, variantId, quantityInCart);
        console.log(
          "DEBUG: Item removed from cart. Saved items count:",
          cart.items.length,
        );
        return res.status(200).json({
          message: "Item removed from cart successfully",
          success: true,
        });
      }
      if (quantity > 0 && quantity > stock) {
        console.log(
          "DEBUG: Stock limit exceeded. Stock:",
          stock,
          "Requested:",
          quantity,
        );
        return res.status(400).json({
          message: `Only ${stock} more items are in stock.`,
          success: false,
        });
      }
      cartItem.quantity += quantity;
      await cart.save();
      await adjustProductStock(productId, variantId, -quantity);
      console.log(
        "DEBUG: Cart updated successfully. Saved items count:",
        cart.items.length,
      );
      return res.status(200).json({
        message: "Item quantity updated successfully",
        success: true,
      });
    }

    if (quantity > 0 && quantity > stock) {
      console.log(
        "DEBUG: Quantity exceeds stock. Stock:",
        stock,
        "Requested:",
        quantity,
      );
      return res.status(400).json({
        message: `Only ${stock} items are in stock.`,
        success: false,
      });
    }

    const itemPrice =
      activeVariant && activeVariant.price
        ? activeVariant.price
        : product.price;
    console.log("DEBUG: Adding new item with price:", itemPrice);

    cart.items.push({
      product: productId,
      variant: variantId || undefined,
      size: req.body.size || undefined,
      quantity,
      price: itemPrice,
    });
    await cart.save();
    await adjustProductStock(productId, variantId, -quantity);
    console.log(
      "DEBUG: New item added successfully. Saved items count:",
      cart.items.length,
    );
    return res.status(200).json({
      message: "Item added to cart successfully",
      success: true,
    });
  } catch (error) {
    console.error("DEBUG ERROR: Error in addToCart:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
export const getCart = async (req, res) => {
  try {
    const user = req.user;

    let cart = await getCartDetails(user._id);

    if (!cart) {
      // Empty or new cart — create one
      await cartModel.create({ user: user._id, items: [] });
      cart = {
        _id: null,
        user: user._id,
        items: [],
        totalPrice: 0,
        currency: "INR",
      };
    }

    // Attach priceChanged flag to each item
    for (const item of cart.items) {
      if (item.savedPrice && item.currentPrice) {
        item.priceChanged = item.savedPrice.amount !== item.currentPrice.amount;
      }
    }

    return res.status(200).json({
      message: "Cart fetched successfully",
      success: true,
      cart,
    });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { size } = req.query;
    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        success: false,
      });
    }

    const itemToRemove = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (item.variant ? item.variant.toString() : "") === (variantId || "") &&
        (!size || item.size === size)
    );

    if (itemToRemove) {
      await adjustProductStock(productId, variantId, itemToRemove.quantity);
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          (item.variant ? item.variant.toString() : "") === (variantId || "") &&
          (!size || item.size === size)
        ),
    );

    await cart.save();
    return res.status(200).json({
      message: "Item removed from cart successfully",
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { oldVariantId, oldSize, newVariantId, newSize } = req.body;

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Cart not found", success: false });
    }

    // Find the item to update
    const item = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (item.variant ? item.variant.toString() : "") ===
          (oldVariantId || "") &&
        (item.size || "") === (oldSize || ""),
    );

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found in cart", success: false });
    }

    // Target values
    const targetVariantId =
      newVariantId !== undefined
        ? newVariantId
        : item.variant
          ? item.variant.toString()
          : undefined;
    const targetSize = newSize !== undefined ? newSize : item.size;

    const isVariantChanging = newVariantId !== undefined && (item.variant ? item.variant.toString() : "") !== (newVariantId || "");
    const isSizeChanging = newSize !== undefined && (item.size || "") !== (newSize || "");

    if (isVariantChanging || isSizeChanging) {
      const targetStock = await stockOfVariant(productId, targetVariantId);
      if (item.quantity > targetStock) {
        return res.status(400).json({
          message: `Only ${targetStock} items are in stock for the selected option.`,
          success: false,
        });
      }
      // Adjust database stocks: restore old, decrement new
      await adjustProductStock(productId, item.variant ? item.variant.toString() : undefined, item.quantity);
      await adjustProductStock(productId, targetVariantId, -item.quantity);
    }

    // Check if another item with the target variant and size already exists. If so, merge them!
    const existingItem = cart.items.find(
      (i) =>
        i !== item &&
        i.product.toString() === productId &&
        (i.variant ? i.variant.toString() : "") === (targetVariantId || "") &&
        (i.size || "") === (targetSize || ""),
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
      cart.items = cart.items.filter((i) => i !== item);
    } else {
      if (newVariantId !== undefined) {
        item.variant = newVariantId || undefined;
      }
      if (newSize !== undefined) {
        item.size = newSize || undefined;
      }
    }

    await cart.save();
    return res
      .status(200)
      .json({ message: "Cart item updated successfully", success: true, cart });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress || !shippingAddress.fullname || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        message: "A complete shipping address is required",
        success: false,
      });
    }

    const cart = await getCartDetails(req.user._id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        success: false,
      });
    }

    const amount = cart.items.reduce((total, item) => {
      const itemAmount = item.price?.amount || 0;
      return total + itemAmount * item.quantity;
    }, 0);

    const currency = cart.items[0]?.price?.currency || "INR";
    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: `cart_${Date.now()}`,
      notes: {
        userId: String(req.user._id),
      },
    });
    const payment =await paymentModel.create({
      user: req.user._id,
      razorpay:{
          orderId: order.id,
      },
      price:{
        amount:cart.totalPrice,
        currency:cart.currency
       },
       shippingAddress: {
         fullname: shippingAddress.fullname,
         phone: shippingAddress.phone,
         line1: shippingAddress.line1,
         line2: shippingAddress.line2 || "",
         city: shippingAddress.city,
         state: shippingAddress.state,
         pincode: shippingAddress.pincode
       },
       orderItems:cart.items.map(item=>({
        title:item.product.title,
        productId:item.product._id,
        variantId:item.variant?._id,
        size:item.size,
        quantity:item.quantity,
        description:item.product.description,
        images:item.product.images,
        price:{
            amount:item.price?.amount || item.product.price?.amount,
            currency:item.price?.currency || item.product.price?.currency
        }
        }))
    })

    return res.status(200).json({
      message: "Order created successfully",
      success: true,
      order,
      keyId: config.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createOrder error:", error);

    return res.status(500).json({
      message:
        error?.error?.description ||
        error?.description ||
        error?.message ||
        "Unable to create Razorpay order",
      success: false,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    // Verify signature first (no DB needed)
    const isValid = validatePaymentVerification({
      order_id: orderId,
      payment_id: paymentId,
    }, signature, config.RAZORPAY_KEY_SECRET);

    const payment = await paymentModel.findOne({
      "razorpay.orderId": orderId,
      status: "pending",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found or already processed",
      });
    }

    if (!isValid) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Use "completed" to match the schema enum ["pending","completed","failed"]
    payment.status = "completed";
    payment.razorpay.paymentId = paymentId;
    payment.razorpay.signature = signature;
    await payment.save();

    // Clear user's cart on successful payment
    await cartModel.findOneAndUpdate(
      { user: payment.user },
      { $set: { items: [] } }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        orderId,
        paymentId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await paymentModel.find({
      user: req.user._id,
      status: "completed"
    }).sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders
    });
  } catch (error) {
    console.error("getUserOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders"
    });
  }
};
