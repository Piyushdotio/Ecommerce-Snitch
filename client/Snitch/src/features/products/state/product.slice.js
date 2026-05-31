import { createSlice } from "@reduxjs/toolkit";

export const productSlice=createSlice({
    name:"productSlice",
    initialState:{
        sellerProducts:[],
        products:[]
    },
    reducers:{
        setSellerProducts:(state,action)=>{
            state.sellerProducts=action.payload
        },
        setProducts:(state,action)=>{
            state.products=action.payload
        }
    }
})
export const {setSellerProducts,setProducts}=productSlice.actions
export default productSlice