import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const selectedEmpresa = auth.getSelectedEmpresa();

  // Si está autenticado pero no ha seleccionado empresa, redirigir a selección
  if (!selectedEmpresa) {
    return <Navigate to="/select-empresa" />;
  }

  // Si no ha completado el onboarding y no está en la ruta de estructura, redirigir
  if (!selectedEmpresa.onboardingCompleted && location.pathname !== "/estructura-organizacional") {
    // Las empresas personales pueden saltarse el onboarding si se desea, 
    // pero según el requerimiento es transversal.
    if (!selectedEmpresa.isPersonal) {
      return <Navigate to="/estructura-organizacional" />;
    }
  }

  return <Outlet />;
}
