import axios from "axios"

const addressApiInstance = axios.create({
    baseURL: "/api/auth/addresses",
    withCredentials: true
})

const getApiErrorMessage = (err) => {
    return err?.response?.data?.message || err?.message || "Request failed"
}

export const getAddresses = async () => {
    try {
        const response = await addressApiInstance.get("/")
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const addAddress = async (addressData) => {
    try {
        const response = await addressApiInstance.post("/", addressData)
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const deleteAddress = async (addressId) => {
    try {
        const response = await addressApiInstance.delete(`/${addressId}`)
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}

export const setDefaultAddress = async (addressId) => {
    try {
        const response = await addressApiInstance.patch(`/${addressId}/default`)
        return response.data
    } catch (err) {
        throw new Error(getApiErrorMessage(err))
    }
}
