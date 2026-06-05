import {configureStore} from '@reduxjs/toolkit'
import authSlice from '../features/auth/state/auth.slice'
import productSlice from '../features/products/state/product.slice'
import cartSlice from '../features/Cart/state/cart.slice'
import wishlistSlice from '../features/Wishlist/state/wishlist.slice'
export const store = configureStore({
    reducer:{
        auth:authSlice.reducer,
        product:productSlice.reducer,
        cart:cartSlice.reducer,
        wishlist:wishlistSlice.reducer,
    }
})