import productModel from "../models/product.model.js"


export const stockOfVariant = async (productId, variantId) => {
    const product = await productModel.findById(productId)
    if (!product) return 0
    if (!variantId) {
        if (!product.variants || product.variants.length === 0) {
            return product.stock !== undefined ? product.stock : 10
        }
        return product.variants[0].stock
    }
    const variant = product.variants.find(v => v._id.toString() === variantId)
    return variant ? variant.stock : 0
}

export const adjustProductStock = async (productId, variantId, quantityChange) => {
    const product = await productModel.findById(productId)
    if (!product) return
    if (variantId) {
        const variant = product.variants.id(variantId)
        if (variant) {
            variant.stock = Math.max(0, (variant.stock || 0) + quantityChange)
        }
    } else {
        if (product.variants && product.variants.length > 0) {
            product.variants[0].stock = Math.max(0, (product.variants[0].stock || 0) + quantityChange)
        } else {
            product.stock = Math.max(0, (product.stock || 0) + quantityChange)
        }
    }
    await product.save()
}

