import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CreateProducts from "../features/products/pages/createProducts.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx";
import Protected from "../features/auth/components/protected.jsx";
import Home from "../features/products/pages/Home.jsx";
import ProductDetail from "../features/products/pages/ProductDetail.jsx";
import SellerProductDetails from "../features/products/pages/SellerProductDetails.jsx";
import Cart from "../features/Cart/pages/Cart.jsx";
import OrderSuccess from "../features/Cart/pages/orderSuccess.jsx";
import Wishlist from "../features/Wishlist/pages/Wishlist.jsx";
import Orders from "../features/Cart/pages/Orders.jsx";
export const router = createBrowserRouter([
  {
    path: "/",
    element:<Home/>,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path:"/product/:productId",
    element:<ProductDetail/>
  },
  {
    path:"/cart",
    element:<Protected>
      <Cart/>
    </Protected>
  },
  {
    path:"/order-success",
    element:<Protected>
      <OrderSuccess/>
    </Protected>
  },
  {
    path:"/orders",
    element:<Protected>
      <Orders/>
    </Protected>
  },
  {
    path:"/wishlist",
    element:<Protected>
      <Wishlist/>
    </Protected>
  },
  {
    path: "/seller",
    children: [
      {
        path: "/seller/create-product",
        element: (
          <Protected role="seller">
            <CreateProducts />
          </Protected>
        ),
      },
      {
        path: "/seller/dashboard",
        element: (
          <Protected role="seller">
            <Dashboard />
          </Protected>
        ),
      },
      {
        path:"/seller/product/:productId",
        element:(
          <Protected role="seller">
            <SellerProductDetails/>
          </Protected>
        ),
      },
    ],
  },
]);
