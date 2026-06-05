import { useDispatch, useSelector } from "react-redux";
import { getWishlist, toggleWishlist } from "../services/wishlist.api";
import { setWishlistItems, optimisticToggle } from "../state/wishlist.slice";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  /** Fetch wishlist from server and hydrate Redux store */
  async function handleGetWishlist() {
    const data = await getWishlist();
    dispatch(setWishlistItems(data.wishlist.items || []));
    return data;
  }

  /**
   * Optimistically toggle in Redux, then sync with server.
   * On server error, reverts by re-fetching.
   */
  async function handleToggleWishlist(productId) {
    dispatch(optimisticToggle(productId));
    try {
      const data = await toggleWishlist(productId);
      return data;
    } catch (err) {
      // Revert optimistic update on failure
      await handleGetWishlist();
      throw err;
    }
  }

  /** Instant check against Redux store — no async needed */
  function isWishlisted(productId) {
    return wishlistItems.some(
      (item) =>
        item.product?._id === productId || item.product === productId
    );
  }

  return { handleGetWishlist, handleToggleWishlist, isWishlisted, wishlistItems };
};
