import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./routes/Login.tsx";
import Signup from "./routes/Signup.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import Profile from "./routes/Profile.tsx";
import SelectEmpresa from "./routes/SelectEmpresa.tsx";
import CrearEmpresa from "./routes/CrearEmpresa.tsx";
import Plantillas from "./routes/Plantillas.tsx";
import CrearEditarPlantilla from "./routes/CrearEditarPlantilla.tsx";
import Proyeccion from "./routes/Proyeccion.tsx";
import HistorialPlantilla from "./routes/HistorialPlantilla.tsx";
import ConfiguracionTRD from "./routes/ConfiguracionTRD.tsx";
import EstructuraOrganizacional from "./routes/EstructuraOrganizacional.tsx";
import SeriesSubseries from "./routes/SeriesSubseries.tsx";

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
        path: "/plantillas",
        element: <Plantillas />,
      },
      {
        path: "/series-subseries",
        element: <SeriesSubseries />,
      },
      {
        path: "/plantillas/nueva",
        element: <CrearEditarPlantilla />,
      },
      {
        path: "/plantillas/editar/:id",
        element: <CrearEditarPlantilla />,
      },
      {
        path: "/proyeccion/:plantillaId",
        element: <Proyeccion />,
      },
      {
        path: "/configuracion-trd",
        element: <ConfiguracionTRD />,
      },
      {
        path: "/estructura-organizacional",
        element: <EstructuraOrganizacional />,
      },
      {
        path: "/plantillas/:id/historial",
        element: <HistorialPlantilla />,
      },
      {
        path: "/",
        element: <Navigate to="/dashboard" />,
      },
    ],
  },
  {
    path: "/select-empresa",
    element: <SelectEmpresa />,
  },
  {
    path: "/crear-empresa",
    element: <CrearEmpresa />,
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
