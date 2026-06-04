import axios from "axios"

const cartApiInstancse = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addItem = async ({ productId, variantId, quantity = 1, size }) => {
    try {
        const url = variantId ? `/add/${productId}/${variantId}` : `/add/${productId}`
        const response = await cartApiInstancse.post(url, { quantity, size })
        return response.data
    } catch (err) {
        throw err.response.data
    }
}

export const getCart = async () => {
    try {
        const response = await cartApiInstancse.get("/getCart", { withCredentials: true })
        return response.data
    } catch (err) {
        throw err.response.data
    }
}

export const removeItem = async ({ productId, variantId, size }) => {
    try {
        let url = variantId ? `/remove/${productId}/${variantId}` : `/remove/${productId}`
        if (size) {
            url += `?size=${encodeURIComponent(size)}`
        }
        const response = await cartApiInstancse.delete(url)
        return response.data
    } catch (err) {
        throw err.response.data
    }
}

export const updateCartItemApi = async ({ productId, oldVariantId, oldSize, newVariantId, newSize }) => {
    try {
        const response = await cartApiInstancse.put(`/update/${productId}`, {
            oldVariantId,
            oldSize,
            newVariantId,
            newSize
        })
        return response.data
    } catch (err) {
        throw err.response.data
    }
}