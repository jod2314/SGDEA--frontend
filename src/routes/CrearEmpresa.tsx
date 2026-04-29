import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layout/PortalLayout";
import { MdSearch, MdCheckCircle, MdBusiness } from "react-icons/md";

export default function CrearEmpresa() {
  const [name, setName] = useState("");
  const [nit, setNit] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [empresaEncontrada, setEmpresaEncontrada] = useState<any>(null);
  const [yaVinculado, setYaVinculado] = useState(false);
  
  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSearch() {
    if (!nit) return;
    setLoadingSearch(true);
    setError("");
    setEmpresaEncontrada(null);
    setYaVinculado(false);

    try {
      const response = await fetch(`${API_URL}/empresas/buscar/${nit}`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        setEmpresaEncontrada(json.body.empresa);
        setYaVinculado(json.body.yaVinculado);
        setName(json.body.empresa.name);
        setDireccion(json.body.empresa.direccion);
      } else if (response.status === 404) {
        // Empresa no existe, permitir creación
        setEmpresaEncontrada(null);
      } else {
        setError(json.body.error || "Error al buscar");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (empresaEncontrada) return; // No debería enviarse el form de creación si se encontró una

    try {
      const response = await fetch(`${API_URL}/empresas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ name, nit, direccion }),
      });

      if (response.ok) {
        navigate("/select-empresa");
      } else {
        const json = await response.json();
        setError(json.body.error);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  }

  async function handleVincular() {
    if (!empresaEncontrada) return;

    try {
      const response = await fetch(`${API_URL}/empresas/vincular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ empresaId: empresaEncontrada.id }),
      });

      if (response.ok) {
        navigate("/select-empresa");
      } else {
        const json = await response.json();
        setError(json.body.error);
      }
    } catch (err) {
      setError("Error al vincular");
    }
  }

  return (
    <PortalLayout>
      <div className="form">
        <h1>Registrar Nueva Empresa</h1>
        <p>Ingresa el NIT para verificar si la organización ya existe en SGDEA.</p>
        
        {error && <div className="errorMessage">{error}</div>}

        <div className="search-field">
          <label>NIT / Identificación Fiscal</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={nit} 
              onChange={(e) => setNit(e.target.value)} 
              disabled={!!empresaEncontrada}
              placeholder="Ej: 900.123.456-7"
              required 
            />
            {!empresaEncontrada && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleSearch}
                disabled={loadingSearch || !nit}
              >
                {loadingSearch ? "..." : <MdSearch size={20} />}
                Verificar
              </button>
            )}
            {empresaEncontrada && (
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => {
                  setEmpresaEncontrada(null);
                  setYaVinculado(false);
                  setNit("");
                  setName("");
                  setDireccion("");
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {empresaEncontrada ? (
          <div className="info-card success-card">
            <div className="info-header">
              <MdCheckCircle className="icon-success" />
              <h3>Empresa Identificada</h3>
            </div>
            <div className="empresa-details">
              <p><strong>Nombre:</strong> {empresaEncontrada.name}</p>
              <p><strong>NIT:</strong> {empresaEncontrada.nit}</p>
              <p><strong>Dirección:</strong> {empresaEncontrada.direccion || 'No registrada'}</p>
            </div>
            
            {yaVinculado ? (
              <div className="alert alert-info">
                Ya eres miembro de esta organización.
              </div>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                onClick={handleVincular}
              >
                Solicitar Vinculación
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label>Nombre de la Empresa</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="Ej: Mi Empresa S.A.S."
            />

            <label>Dirección</label>
            <input 
              type="text" 
              value={direccion} 
              onChange={(e) => setDireccion(e.target.value)} 
              placeholder="Ej: Calle 123 # 45-67"
            />

            <button type="submit" className="btn btn-primary">
              <MdBusiness />
              Crear Nueva Organización
            </button>
          </form>
        )}

        <button 
          type="button" 
          className="btn btn-ghost" 
          onClick={() => navigate("/select-empresa")}
          style={{ marginTop: '8px' }}
        >
          Cancelar
        </button>
      </div>
    </PortalLayout>
  );
}
