import axios from "axios";

const wishlistApi = axios.create({
  baseURL: "/api/wishlist",
  withCredentials: true,
});

const getApiErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Request failed";

export const getWishlist = async () => {
  try {
    const response = await wishlistApi.get("/");
    return response.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
};

export const toggleWishlist = async (productId) => {
  try {
    const response = await wishlistApi.post(`/toggle/${productId}`);
    return response.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
};
