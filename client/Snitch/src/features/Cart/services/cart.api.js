import axios from "axios"

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

const getApiErrorMessage = (err) => {
    return err?.response?.data?.message || err?.message || "Request failed"
}

export const addItem = async ({ productId, variantId, quantity = 1, size }) => {
    try {
        const url = variantId ? `/add/${productId}/${variantId}` : `/add/${productId}`
        const response = await cartApiInstance.post(url, { quantity, size })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const getCart = async () => {
    try {
        const response = await cartApiInstance.get("/getCart", { withCredentials: true })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const removeItem = async ({ productId, variantId, size }) => {
    try {
        let url = variantId ? `/remove/${productId}/${variantId}` : `/remove/${productId}`
        if (size) {
            url += `?size=${encodeURIComponent(size)}`
        }
        const response = await cartApiInstance.delete(url)
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const updateCartItemApi = async ({ productId, oldVariantId, oldSize, newVariantId, newSize }) => {
    try {
        const response = await cartApiInstance.put(`/update/${productId}`, {
            oldVariantId,
            oldSize,
            newVariantId,
            newSize
        })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const createOrder = async (shippingAddress) => {
    try {
        const response = await cartApiInstance.post("/payment/create/order", { shippingAddress })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const verifyPayment = async ({razorpay_order_id,razorpay_payment_id,razorpay_signature}) => {
    try {
        const response = await cartApiInstance.post("/payment/verify",{
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        })
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const getOrders = async () => {
    try {
        const response = await cartApiInstance.get("/orders")
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}
