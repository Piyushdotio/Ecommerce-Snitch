import {configureStore} from '@reduxjs/toolkit'
import authSlice from '../features/auth/state/auth.slice'
import productSlice from '../features/products/state/product.slice'
import cartSlice from '../features/Cart/state/cart.slice'
export const store = configureStore({
    reducer:{
        auth:authSlice.reducer,
        product:productSlice.reducer,
        cart:cartSlice.reducer
    }
})