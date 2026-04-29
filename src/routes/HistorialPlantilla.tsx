import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import { useNavigate, useParams } from "react-router-dom";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdArrowBack = (IconsMd as any).MdArrowBack;
const MdRestore = (IconsMd as any).MdRestore;

interface Snapshot {
  _id: string;
  version: number;
  datosVersion: {
    nombre: string;
    descripcion: string;
  };
  modificadoPor: {
    name: string;
  };
  fechaModificacion: string;
  comentario: string;
}

export default function HistorialPlantilla() {
  const { id } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorial();
  }, [id]);

  async function fetchHistorial() {
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/plantillas/${id}/historial`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setHistorial(json.body.historial);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(version: number) {
    if (!window.confirm(`¿Estás seguro de restaurar la versión ${version}? Se creará un snapshot de la versión actual.`)) return;

    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/plantillas/${id}/clonar/${version}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });

      if (response.ok) {
        alert("Versión restaurada con éxito");
        navigate(`/plantillas/editar/${id}`);
      }
    } catch (error) {
      alert("Error al restaurar");
    }
  }

  return (
    <PortalLayout>
      <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button className="icon-btn" onClick={() => navigate(`/plantillas/editar/${id}`)}>
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1>Historial de Versiones</h1>
          <p className="text-muted">Línea de tiempo de cambios para esta plantilla.</p>
        </div>
      </header>

      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <div className="timeline">
          {historial.map((item) => (
            <div key={item._id} className="card" style={{ marginBottom: '15px', padding: '20px', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Versión {item.version}</h3>
                  <p className="small text-muted">Por: {item.modificadoPor?.name} | {new Date(item.fechaModificacion).toLocaleString()}</p>
                  <p style={{ marginTop: '10px' }}><strong>Comentario:</strong> {item.comentario}</p>
                </div>
                <div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRestore(item.version)}>
                    <MdRestore /> Restaurar esta versión
                  </button>
                </div>
              </div>
            </div>
          ))}

          {historial.length === 0 && (
            <div className="no-data-info" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Aún no hay versiones anteriores registradas.</p>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
