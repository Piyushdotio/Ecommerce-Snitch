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

export async function addProductVariant(productId, newProductVariant) {
    const formdata = new FormData();
    
    // Extract price and currency to match backend expectation
    const priceAmount = typeof newProductVariant.price === "object" ? newProductVariant.price.amount : newProductVariant.price;
    const priceCurrency = typeof newProductVariant.price === "object" ? newProductVariant.price.currency : "INR";
    
    formdata.append("priceAmount", priceAmount);
    formdata.append("priceCurrency", priceCurrency);
    formdata.append("stock", newProductVariant.stock);
    
    // Map attributes string array (e.g. ["Color: Black"]) to key-value pairs object for backend JSON parsing
    const attributesObj = {};
    if (Array.isArray(newProductVariant.attributes)) {
        newProductVariant.attributes.forEach((attr) => {
            const separatorIndex = attr.indexOf(":");
            const key = separatorIndex !== -1 ? attr.slice(0, separatorIndex).trim() : attr;
            const value = separatorIndex !== -1 ? attr.slice(separatorIndex + 1).trim() : "";
            if (key) {
                attributesObj[key.toLowerCase()] = value;
            }
        });
    }
    formdata.append("attributes", JSON.stringify(attributesObj));
    
    // Safely append files only if they exist
    if (newProductVariant.images && Array.isArray(newProductVariant.images)) {
        newProductVariant.images.forEach((image) => {
            if (image.file) {
                formdata.append(`images`, image.file);
            }
        });
    }
    
    const response = await productApiInstance.post(`/${productId}/variants`, formdata);
    return response.data;
}
