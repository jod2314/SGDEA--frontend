import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado pero no ha seleccionado empresa, redirigir a selección
  // (La ruta /select-empresa debe estar fuera de este ProtectedRoute o manejar su propia excepción)
  if (!auth.getSelectedEmpresa()) {
    return <Navigate to="/select-empresa" />;
  }

  return <Outlet />;
}
