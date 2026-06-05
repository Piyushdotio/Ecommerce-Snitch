import cartModel from "../models/cart.model.js";
import mongoose from "mongoose";


export async function getCartDetails(userId){
   // Use aggregate to populate product AND compute totalPrice in one query.
    // IMPORTANT: use $lookup pipeline so variants are kept as an array (not unwound),
    // which correctly handles items that have no variant selected.
    const results = await cartModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "items.product",
        },
      },
      { $unwind: { path: "$items.product", preserveNullAndEmptyArrays: true } },
      // Compute the live current price for each item (variant price or product price)
      {
        $addFields: {
          "items.currentPrice": {
            $let: {
              vars: {
                matchedVariant: {
                  $first: {
                    $filter: {
                      input: { $ifNull: ["$items.product.variants", []] },
                      as: "v",
                      cond: { $eq: ["$$v._id", "$items.variant"] },
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ["$$matchedVariant", null] },
                      { $ne: ["$$matchedVariant.price", null] },
                    ],
                  },
                  then: "$$matchedVariant.price",
                  else: "$items.product.price",
                },
              },
            },
          },
          // savedPrice = price stored in DB at the time user added this item
          "items.savedPrice": "$items.price",
          // itemTotalAmount = quantity * live price (for totalPrice sum)
          itemTotalAmount: {
            $multiply: [
              "$items.quantity",
              {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ["$items.variant", null] },
                      {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: {
                                  $ifNull: ["$items.product.variants", []],
                                },
                                as: "v",
                                cond: { $eq: ["$$v._id", "$items.variant"] },
                              },
                            },
                          },
                          0,
                        ],
                      },
                    ],
                  },
                  then: {
                    $getField: {
                      field: "amount",
                      input: {
                        $getField: {
                          field: "price",
                          input: {
                            $first: {
                              $filter: {
                                input: {
                                  $ifNull: ["$items.product.variants", []],
                                },
                                as: "v",
                                cond: { $eq: ["$$v._id", "$items.variant"] },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  else: "$items.product.price.amount",
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          totalPrice: { $sum: "$itemTotalAmount" },
          currency: { $first: "$items.currentPrice.currency" },
          items: { $push: "$items" },
        },
      },
    ]);

    // aggregate() returns plain JS objects — no .toObject() needed
    let cart = results[0];
    if (!cart) {
      return null;
    }

    cart.items = (cart.items || []).filter((item) => item?.product?._id);
    if (cart.items.length === 0) {
      cart.totalPrice = 0;
      cart.currency = "INR";
    }

    return cart;
}
