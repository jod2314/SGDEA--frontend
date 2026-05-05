import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import { useNavigate, useParams } from "react-router-dom";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdSearch = (IconsMd as any).MdSearch;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdArrowBack = (IconsMd as any).MdArrowBack;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;

export default function Proyeccion() {
  const { plantillaId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();

  const [plantilla, setPlantilla] = useState<any>(null);
  const [identificacion, setIdentificacion] = useState("");
  const [entidad, setEntidad] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlantilla();
  }, [plantillaId]);

  async function fetchPlantilla() {
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/plantillas/${plantillaId}`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setPlantilla(json.body.plantilla);
      }
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
    }
  }

  async function handleSearchEntidad() {
    if (!identificacion) return;
    setLoading(true);
    setError("");
    const empresa = auth.getSelectedEmpresa();

    try {
      const response = await fetch(`${API_URL}/entidades/buscar/${identificacion}`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });

      if (response.ok) {
        const json = await response.json();
        setEntidad(json.body.entidad);
      } else {
        setEntidad(null);
        setError("Entidad no encontrada. ¿Deseas registrarla?");
      }
    } catch (error) {
      setError("Error al buscar entidad");
    } finally {
      setLoading(false);
    }
  }

  async function handleProyectar() {
    setGenerating(true);
    const empresa = auth.getSelectedEmpresa();

    try {
      const response = await fetch(`${API_URL}/documentos/proyectar/${plantillaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
        body: JSON.stringify({
          entidadId: entidad?._id,
          datosAdicionales: {} // Aquí se podrían añadir campos variables del formulario
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${plantilla.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Si no es OK, el backend devuelve un json con el error
        const json = await response.json();
        alert(json.body.error + (json.body.detalle ? ": " + json.body.detalle : ""));
      }
    } catch (error) {
      console.error("Error al proyectar:", error);
      alert("Error de conexión al generar el documento");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <PortalLayout>
      <div className="proyeccion-container">
        <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <button className="icon-btn" onClick={() => navigate("/plantillas")}>
            <MdArrowBack size={24} />
          </button>
          <div>
            <h1>Proyección Documental</h1>
            <p className="text-muted">Generando documento basado en: <strong>{plantilla?.nombre}</strong></p>
          </div>
        </header>

        <div className="proyeccion-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Columna Izquierda: Selección de Tercero */}
          <section className="card" style={{ padding: '20px' }}>
            <h2>1. Identificar Destinatario</h2>
            <p className="small text-muted">Ingresa la identificación de la persona o empresa para autocompletar el documento.</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <input 
                type="text" 
                className="edit-input" 
                placeholder="NIT o Cédula" 
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                style={{ flexGrow: 1 }}
              />
              <button className="btn btn-secondary" onClick={handleSearchEntidad} disabled={loading}>
                <MdSearch /> {loading ? "..." : "Buscar"}
              </button>
            </div>

            {error && (
              <div className="errorMessage" style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                {/* Aquí se podría abrir un modal para crear entidad rápido */}
              </div>
            )}

            {entidad && (
              <div className="info-card success-card" style={{ marginTop: '20px' }}>
                <div className="info-header">
                  <MdCheckCircle className="icon-success" />
                  <h3>Entidad Cargada</h3>
                </div>
                <div className="empresa-details">
                  <p><strong>Nombre:</strong> {entidad.nombre} {entidad.apellidos || entidad.razonSocial}</p>
                  <p><strong>Identificación:</strong> {entidad.numeroIdentificacion}</p>
                  <p><strong>Dirección:</strong> {entidad.direccion || "No registrada"}</p>
                </div>
              </div>
            )}
          </section>

          {/* Columna Derecha: Configuración Final */}
          <section className="card" style={{ padding: '20px' }}>
            <h2>2. Finalizar Generación</h2>
            <p className="small text-muted">Revisa que los datos sean correctos antes de emitir el documento oficial.</p>

            <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(26,115,232,0.05)', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ marginBottom: '20px' }}>Se generará un archivo PDF con sello de integridad (Hash SHA-256).</p>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', height: '60px', fontSize: '1.2rem' }}
                onClick={handleProyectar}
                disabled={generating}
              >
                <MdFileDownload size={24} /> 
                {generating ? "Generando PDF..." : "Generar y Descargar"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}
