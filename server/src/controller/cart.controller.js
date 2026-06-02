import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"
import {stockOfVariant} from "../dao/product.dao.js"

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
            (item.variant ? item.variant.toString() : "") === (variantId || "")
        )

        if (cartItem) {
            const quantityInCart = cartItem.quantity
            console.log("DEBUG: Item already in cart. Current qty:", quantityInCart)
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
export const getCart =async(req,res)=>{
    try{
        const user=req.user
        let cart=await cartModel.findOne({user:user._id}).populate("items.product")
        if(!cart){
         cart=await cartModel.create({user:user._id,items:[]})
        }
        for(const item of cart.items){
            const product=await productModel.findById(item.product)
            if(product){
                const variant=product.variant.id(item.variant)
                item.price=variant.price
            }
        }
        return res.status(200).json({
            message:"Cart fetched successfully",
            success:true,
            cart
        })
    }catch(error){
        return res.status(500).json({
            message: error.message,
            success:false
        })
    }
}