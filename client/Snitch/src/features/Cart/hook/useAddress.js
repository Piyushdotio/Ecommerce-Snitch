import { useState, useCallback } from "react";
import * as addressApi from "../services/address.api";

export const useAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await addressApi.getAddresses();
            setAddresses(data.addresses || []);
            return data.addresses || [];
        } catch (err) {
            setError(err.message || "Failed to fetch addresses");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAddAddress = async (addressData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await addressApi.addAddress(addressData);
            setAddresses(data.addresses || []);
            return { success: true, addresses: data.addresses };
        } catch (err) {
            setError(err.message || "Failed to add address");
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await addressApi.deleteAddress(addressId);
            setAddresses(data.addresses || []);
            return { success: true, addresses: data.addresses };
        } catch (err) {
            setError(err.message || "Failed to delete address");
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await addressApi.setDefaultAddress(addressId);
            setAddresses(data.addresses || []);
            return { success: true, addresses: data.addresses };
        } catch (err) {
            setError(err.message || "Failed to set default address");
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        addresses,
        loading,
        error,
        fetchAddresses,
        handleAddAddress,
        handleDeleteAddress,
        handleSetDefaultAddress
    };
};
