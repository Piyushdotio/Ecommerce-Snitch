import { addItem, getCart, removeItem, updateCartItemApi, createOrder, verifyPayment, getOrders } from "../services/cart.api"
import { useDispatch } from "react-redux"
import { setItems } from "../state/cart.slice.js"

export const useCart = () => {
    const dispatch = useDispatch()

    async function handleGetCart() {
        const data = await getCart()
        console.log(data)
        dispatch(setItems(data.cart.items))
        return data
    }

    async function handleAddItem({ productId, variantId, quantity = 1, size }) {
        const data = await addItem({ productId, variantId, quantity, size })
        await handleGetCart()
        return data
    }

    async function handleRemoveItem({ productId, variantId, size }) {
        const data = await removeItem({ productId, variantId, size })
        await handleGetCart()
        return data
    }

    async function handleUpdateItem({ productId, oldVariantId, oldSize, newVariantId, newSize }) {
        const data = await updateCartItemApi({ productId, oldVariantId, oldSize, newVariantId, newSize })
        await handleGetCart()
        return data
    }
    async function handleCreateOrder(shippingAddress) {
        const data = await createOrder(shippingAddress)
        return data
    }

    async function handleVerifyPayment({razorpay_order_id,razorpay_payment_id,razorpay_signature}) {
        const data = await verifyPayment({razorpay_order_id,razorpay_payment_id,razorpay_signature})
        if (data.success) {
            dispatch(setItems([]))
        }
        return data.success
    }

    async function handleGetOrders() {
        const data = await getOrders()
        return data
    }

    return { handleAddItem, handleGetCart, handleRemoveItem, handleUpdateItem, handleCreateOrder, handleVerifyPayment, handleGetOrders }
}
