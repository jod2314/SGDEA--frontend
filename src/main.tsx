import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./routes/Login.tsx";
import Signup from "./routes/Signup.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Profile from "./routes/Profile.tsx";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/me",
        element: <Profile />,
      },
      {
        path: "/",
        element: <Navigate to="/dashboard" />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
