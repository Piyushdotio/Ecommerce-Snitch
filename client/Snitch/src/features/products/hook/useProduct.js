import { setProducts, setSellerProducts } from "../state/product.slice";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { createProduct, viewProduct,allProducts } from "../services/product.api";

export const useProduct = () => {
  const dispatch = useDispatch();

  const handleCreateProducts = useCallback(async (formdata) => {
    try {
      const data = await createProduct(formdata);
      console.log("Created product response:", data);
      return data.product;
    } catch (error) {
      console.error("Create product failed:", error?.response?.data || error.message);
      throw error;
    }
  }, []);

  const handleSellerProducts = useCallback(async () => {
    try {
      const data = await viewProduct();
      console.log("Seller products API response:", data);
      console.log("Seller products array:", data.products);
      dispatch(setSellerProducts(data.products ?? []));
      return data.products ?? [];
    } catch (error) {
      console.error("Fetch seller products failed:", error?.response?.data || error.message);
      dispatch(setSellerProducts([]));
      throw error;
    }
  }, [dispatch]);
  const handleallproducts=useCallback(async ()=>{
    const data=await allProducts()
    dispatch(setProducts(data.products))
  },[dispatch])

  return { handleCreateProducts, handleSellerProducts,handleallproducts };
};
