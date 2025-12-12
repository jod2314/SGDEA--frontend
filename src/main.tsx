import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./routes/Login.tsx";
import Signup from "./routes/Signup.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Profile from "./routes/Profile.tsx";
import Diagnostico from "./routes/Diagnostico.tsx";
import Inventario from "./routes/Inventario.tsx";
import Tvd from "./routes/Tvd.tsx";
import DiagnosticoAssistant from "./routes/DiagnosticoAssistant.tsx";
import Trd from "./routes/Trd.tsx"; // Import the new Trd component

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
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
        path: "/diagnostico",
        element: <Diagnostico />,
      },
      {
        path: "/diagnostico-assistant",
        element: <DiagnosticoAssistant />,
      },
      {
        path: "/inventario",
        element: <Inventario />,
      },
      {
        path: "/tvd",
        element: <Tvd />,
      },
      {
        path: "/trd", // New TRD route
        element: <Trd />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
