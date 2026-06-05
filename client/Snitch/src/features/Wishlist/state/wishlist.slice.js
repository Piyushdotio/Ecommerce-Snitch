import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // each item: { product: { _id, title, price, images, ... }, addedAt }
  },
  reducers: {
    setWishlistItems(state, action) {
      state.items = action.payload;
    },
    // Optimistic toggle — called before the API resolves for instant UI feedback
    optimisticToggle(state, action) {
      const productId = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product?._id === productId || item.product === productId
      );
      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1);
      } else {
        // Minimal placeholder so isWishlisted() returns true immediately
        state.items.push({ product: { _id: productId }, addedAt: new Date().toISOString() });
      }
    },
  },
});

export const { setWishlistItems, optimisticToggle } = wishlistSlice.actions;
export default wishlistSlice;
