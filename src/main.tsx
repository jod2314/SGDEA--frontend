import React, { lazy, Suspense } from "react";
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
import Proyeccion from "./routes/Proyeccion.tsx";
import HistorialPlantilla from "./routes/HistorialPlantilla.tsx";
import ConfiguracionTRD from "./routes/ConfiguracionTRD.tsx";
import EstructuraOrganizacional from "./routes/EstructuraOrganizacional.tsx";
import SeriesSubseries from "./routes/SeriesSubseries.tsx";
import Consecutivos from "./routes/Consecutivos.tsx";
import DatosMaestros from "./routes/DatosMaestros.tsx";
import Expedientes from "./routes/Expedientes.tsx";
import Transferencias from "./routes/Transferencias.tsx";
import FondosAcumulados from "./routes/FondosAcumulados.tsx";
import Entidades from "./routes/Entidades.tsx";
import ComiteArchivo from "./routes/ComiteArchivo.tsx";
import TablaValoracion from "./routes/TablaValoracion.tsx";
import MatrizRiesgos from "./routes/MatrizRiesgos.tsx";

import "./index.css";

// Lazy loading de rutas pesadas (Tiptap, Recharts, etc)
const CrearEditarPlantilla = lazy(() => import("./routes/CrearEditarPlantilla.tsx"));
const Auditoria = lazy(() => import("./routes/Auditoria.tsx"));
const Disposicion = lazy(() => import("./routes/Disposicion.tsx"));
const AsistenteOnboarding = lazy(() => import("./routes/AsistenteOnboarding.tsx"));

const Loading = () => <div style={{ padding: '20px', textAlign: 'center' }}>Cargando módulo...</div>;

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
        element: (
          <Suspense fallback={<Loading />}>
            <CrearEditarPlantilla />
          </Suspense>
        ),
      },
      {
        path: "/plantillas/editar/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <CrearEditarPlantilla />
          </Suspense>
        ),
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
        path: "/auditoria",
        element: (
          <Suspense fallback={<Loading />}>
            <Auditoria />
          </Suspense>
        ),
      },
      {
        path: "/consecutivos",
        element: <Consecutivos />,
      },
      {
        path: "/datos-maestros",
        element: <DatosMaestros />,
      },
      {
        path: "/expedientes",
        element: <Expedientes />,
      },
      {
        path: "/transferencias",
        element: <Transferencias />,
      },
      {
        path: "/fondos-acumulados",
        element: <FondosAcumulados />,
      },
      {
        path: "/entidades",
        element: <Entidades />,
      },
      {
        path: "/comite-archivo",
        element: <ComiteArchivo />,
      },
      {
        path: "/tabla-valoracion",
        element: <TablaValoracion />,
      },
      {
        path: "/matriz-riesgos",
        element: <MatrizRiesgos />,
      },
      {
        path: "/disposicion",
        element: (
          <Suspense fallback={<Loading />}>
            <Disposicion />
          </Suspense>
        ),
      },
      {
        path: "/onboarding",
        element: (
          <Suspense fallback={<Loading />}>
            <AsistenteOnboarding />
          </Suspense>
        ),
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
