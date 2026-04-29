import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdDescription = (IconsMd as any).MdDescription || (IconsMd as any).MdInsertDriveFile;
const MdAdd = (IconsMd as any).MdAdd;
const MdEdit = (IconsMd as any).MdEdit;
const MdPlayArrow = (IconsMd as any).MdPlayArrow;

interface Plantilla {
  _id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
}

export default function Plantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const navigate = useNavigate();

  async function fetchPlantillas() {
    const empresa = auth.getSelectedEmpresa();
    if (!empresa) return;

    try {
      const response = await fetch(`${API_URL}/plantillas`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa.id,
        },
      });
      if (response.ok) {
        const json = await response.json();
        setPlantillas(json.body.plantillas);
      }
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlantillas();
  }, [auth]);

  return (
    <PortalLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Plantillas de Documentos</h1>
          <p className="text-muted">Gestiona los formatos base para la generación de documentos oficiales.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/plantillas/nueva")}>
          <MdAdd /> Nueva Plantilla
        </button>
      </div>

      {loading ? (
        <p>Cargando plantillas...</p>
      ) : (
        <div className="plantillas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {plantillas.map((p) => (
            <div key={p._id} className="card plantilla-card">
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
                  <MdDescription />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{p.nombre}</h3>
                  <p className="small text-muted" style={{ margin: '5px 0' }}>{p.descripcion || "Sin descripción"}</p>
                  <p className="small" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    Creado: {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="card-actions" style={{ position: 'static', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" title="Editar Formato" onClick={() => navigate(`/plantillas/editar/${p._id}`)}>
                  <MdEdit /> Editar
                </button>
                <button className="btn btn-primary btn-sm" title="Generar Documento" onClick={() => navigate(`/proyeccion/${p._id}`)}>
                  <MdPlayArrow /> Proyectar
                </button>
              </div>
            </div>
          ))}

          {plantillas.length === 0 && (
            <div className="no-data-info" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>No hay plantillas creadas para esta empresa.</p>
              <button className="btn btn-secondary" onClick={() => navigate("/plantillas/nueva")}>Crear mi primera plantilla</button>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
