import axios from "axios"

export const authapiInstance=axios.create({
    baseURL:"/api/auth",
    withCredentials:true,
})

const normalizeContact = (contact) => {
    if (!contact) return undefined

    const digitsOnly = contact.replace(/\D/g, '')
    return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
}

const getApiErrorMessage = (err) => {
    const validationErrors = err?.response?.data?.errors

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        return validationErrors[0].msg
    }

    return err?.response?.data?.message || err?.message || "Request failed"
}

export const Register = async ({email,password,fullname,contact,isSeller})=>{
    try{
        const response=await authapiInstance.post("/register",{
            email: email?.trim(),
            password,
            fullname: fullname?.trim(),
            contact: normalizeContact(contact),
            isSeller
        })
        return  response.data
    }catch(err){
        const message = getApiErrorMessage(err)
        console.error("Register failed:", err?.response?.data || message)
        throw new Error(message)
    }
}

export const Login =async({email,contact,password})=>{
    try{
        const response=await authapiInstance.post("/login",{
            email: email?.trim(),
            contact: normalizeContact(contact),
            password
        })
        return response.data
    }catch(err){
        const message = getApiErrorMessage(err)
        console.error("Login failed:", err?.response?.data || message)
        throw new Error(message)
    }
}

