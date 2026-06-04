import mongoose from "mongoose";
import priceSchema from "./price.schema.js";
const cartItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product.variants",
            },
            size: {
                type: String
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type:priceSchema,
                required:true
            },

        }
    ]
})

const cartModel = mongoose.model("cart",cartItemSchema)
export default cartModel