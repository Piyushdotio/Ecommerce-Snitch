import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CreateProducts from "../features/products/pages/createProducts.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx";
import Protected from "../features/auth/components/protected.jsx";
import Home from "../features/products/pages/Home.jsx";

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
    path: "/seller",
    children: [
      {
        path: "create-product",
        element: (
          <Protected role="seller">
            <CreateProducts />
          </Protected>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Protected role="seller">
            <Dashboard />
          </Protected>
        ),
      },
    ],
  },
]);
