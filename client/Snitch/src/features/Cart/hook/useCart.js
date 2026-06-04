import { addItem, getCart, removeItem, updateCartItemApi } from "../services/cart.api"
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

    return { handleAddItem, handleGetCart, handleRemoveItem, handleUpdateItem }
}
