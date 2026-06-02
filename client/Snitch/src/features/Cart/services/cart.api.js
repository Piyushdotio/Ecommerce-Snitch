import axios from "axios"

const cartApiInstancse=axios.create({
    baseURL:"/api/cart",
    withCredentials:true
})

export const addItem =async({productId,variantId})=>{
    try{
        const url = variantId ? `add/${productId}/${variantId}` : `add/${productId}`
        const response=await cartApiInstancse.post(url,{quantity:1})
        return response.data
    }catch(err){
        throw err.response.data
    }
}