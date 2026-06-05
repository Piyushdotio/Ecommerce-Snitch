import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const paymentSchema = new mongoose.Schema({
    status:{
        type:String,
        enum:["pending","completed","failed"],
        default:"pending"
    },
    price:{
        type: priceSchema,
        required:true
    },
    razorpay:{
        orderId:String,
        paymentId:String,
        signature:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderItems:[
        {
            title:String,   
            productId:mongoose.Schema.Types.ObjectId,
            variantId:mongoose.Schema.Types.ObjectId,
            size:String,
            quantity:Number,
            price:{
                type: priceSchema,
                required: true
            },
            images:[{url:String}]
        }
    ],
    shippingAddress: {
        fullname: { type: String },
        phone: { type: String },
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    }
}, { timestamps: true })
const paymentModel = mongoose.model("Payment",paymentSchema)
export default paymentModel
