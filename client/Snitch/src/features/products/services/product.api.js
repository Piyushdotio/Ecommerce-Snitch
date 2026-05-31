import axios from "axios"

export const PRODUCT_BASE_URL =
    import.meta.env.VITE_PRODUCTS_API_BASE_URL?.replace(/\/$/, "") ||
    (import.meta.env.DEV ? "http://localhost:3000/api/products" : "/api/products")

const productApiInstance=axios.create({
    baseURL: PRODUCT_BASE_URL,
    withCredentials:true
})

export async function createProduct(formData){
    const response=await productApiInstance.post("/create",formData)
    return response.data
}

export async function viewProduct(){
    const response=await productApiInstance.get("/showproduct")
    return response.data
}
export async function allProducts(){
    const response=await productApiInstance.get("/")
    return response.data
}

export async function getProductById(productId){
    const response=await productApiInstance.get(`/detail/${productId}`)
    return response.data
}
