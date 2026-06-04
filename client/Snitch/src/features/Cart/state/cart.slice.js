import {createSlice} from "@reduxjs/toolkit"

const cartSlice=createSlice({
    name:"cart",
    initialState:{
        totalPrice:null,
        currency:null,
        items:[],
    },
    reducers:{
        setItems(state,action){
            state.items=action.payload
            state.currency=action.payload.currency
            state.totalPrice=action.payload.totalPrice
        },
        addItem(state,action){
            state.items.push(action.payload)
        }
    }
})

export const {setItems,addItem}=cartSlice.actions
export default cartSlice