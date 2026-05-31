import {configureStore} from '@reduxjs/toolkit'
import authSlice from '../features/auth/state/auth.slice'
import productSlice from '../features/products/state/product.slice'

export const store = configureStore({
    reducer:{
        auth:authSlice.reducer,
        product:productSlice.reducer
    }
})