import React from "react";
import "./app.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./app.route";
import { useSelector } from "react-redux";
import { useAuth } from "../features/auth/hook/useAuth";
import { useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";

const App = () => {
  const { handlegetme } = useAuth();
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  useEffect(() => {
    handlegetme();
  }, []);
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
