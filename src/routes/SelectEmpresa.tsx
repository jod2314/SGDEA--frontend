import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import { API_URL } from "../auth/authConstants";
import { Empresa } from "../types/types";
import PortalLayout from "../layout/PortalLayout";
import { MdPerson, MdBusiness, MdAddBusiness } from "react-icons/md";

export default function SelectEmpresa() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const response = await fetch(`${API_URL}/empresas/mis-empresas`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });
        if (response.ok) {
          const json = await response.json();
          setEmpresas(json.body.empresas);
        }
      } catch (error) {
        console.error("Error al cargar empresas:", error);
      } finally {
        setLoading(false);
      }
    }

    if (auth.isAuthenticated) {
      fetchEmpresas();
    }
  }, [auth.isAuthenticated, auth]);

  function handleSelect(empresa: Empresa) {
    auth.setSelectedEmpresa(empresa);
    navigate("/dashboard");
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="select-empresa-container">
          <p>Cargando tus espacios de trabajo...</p>
        </div>
      </PortalLayout>
    );
  }

  const personalSpace = empresas.find(e => e.isPersonal);
  const corporateEmpresas = empresas.filter(e => !e.isPersonal);

  return (
    <PortalLayout>
      <div className="select-empresa-container">
        <header className="select-header">
          <h1>¡Bienvenido, {auth.getUser()?.name}!</h1>
          <p>Selecciona el entorno de trabajo para esta sesión.</p>
        </header>

        <section className="selection-section">
          <h2>Área Personal</h2>
          <div className="personal-selection">
            {personalSpace ? (
              <div 
                className="empresa-card personal-card" 
                onClick={() => handleSelect(personalSpace)}
              >
                <div className="card-icon"><MdPerson /></div>
                <div className="card-info">
                  <h3>Entrar a nombre propio</h3>
                  <p>Gestiona tus documentos individuales</p>
                </div>
              </div>
            ) : (
              <p>No se encontró tu espacio personal. Por favor, contacta a soporte.</p>
            )}
          </div>
        </section>

        <section className="selection-section">
          <div className="section-header">
            <h2>Organizaciones Corporativas</h2>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/crear-empresa")}
            >
              <MdAddBusiness />
              <span>Registrar Empresa</span>
            </button>
          </div>
          
          <div className="empresas-grid">
            {corporateEmpresas.map((empresa) => (
              <div 
                key={empresa.id} 
                className="empresa-card"
                onClick={() => handleSelect(empresa)}
              >
                <div className="card-icon"><MdBusiness /></div>
                <div className="card-info">
                  <h3>{empresa.name}</h3>
                  <p>NIT: {empresa.nit}</p>
                  <span className="rol-badge">{empresa.rol}</span>
                </div>
              </div>
            ))}

            {corporateEmpresas.length === 0 && (
              <div className="no-data-info">
                <p>No perteneces a ninguna organización corporativa aún.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
