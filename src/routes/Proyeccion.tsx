import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdSearch = (IconsMd as any).MdSearch;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdArrowBack = (IconsMd as any).MdArrowBack;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdInfo = (IconsMd as any).MdInfo;

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
  
  // Datos variables para el formulario dinámico
  const [extraData, setExtraData] = useState<any>({});

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchPlantilla();
    }
  }, [plantillaId, auth.isAuthenticated]);

  async function fetchPlantilla() {
    try {
      const json = await auth.request<any>(`/plantillas/${plantillaId}`);
      setPlantilla(json.body.plantilla);
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
    }
  }

  async function handleSearchEntidad() {
    if (!identificacion) return;
    setLoading(true);
    setError("");

    try {
      // Usamos el nuevo endpoint de búsqueda de entidades
      const json = await auth.request<any>(`/entidades/buscar?q=${identificacion}`);
      if (json.body.entidades && json.body.entidades.length > 0) {
        setEntidad(json.body.entidades[0]); // Tomamos la coincidencia exacta si existe
      } else {
        setEntidad(null);
        setError("Entidad no encontrada. Verifique el número de identificación.");
      }
    } catch (error) {
      setError("Error al buscar entidad");
    } finally {
      setLoading(false);
    }
  }

  async function handleProyectar() {
    setGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/documentos/proyectar/${plantillaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": auth.getSelectedEmpresa()?.id || "",
        },
        body: JSON.stringify({
          entidadId: entidad?._id,
          datosAdicionales: extraData
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreArchivo = `${plantilla.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        // Redirigir opcionalmente al historial o dashboard
        if(confirm("¿Documento generado con éxito! ¿Deseas ir al historial?")) {
           navigate("/auditoria");
        }
      } else {
        const json = await response.json();
        alert(json.body.error || "Error al generar");
      }
    } catch (error) {
      console.error("Error al proyectar:", error);
      alert("Error de conexión");
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
          {/* Columna Izquierda: Selección de Tercero y Datos Extra */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h2>1. Identificar Destinatario (Entidad)</h2>
              <p className="small text-muted">Ingresa la identificación (NIT/Cédula) para cargar los datos del tercero.</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <input 
                  type="text" 
                  className="edit-input" 
                  placeholder="NIT o Cédula" 
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchEntidad()}
                  style={{ flexGrow: 1 }}
                />
                <button className="btn btn-secondary" onClick={handleSearchEntidad} disabled={loading}>
                  <MdSearch /> {loading ? "..." : "Buscar"}
                </button>
              </div>

              {error && <div className="errorMessage" style={{ marginTop: '15px' }}>{error}</div>}

              {entidad && (
                <div className="info-card success-card" style={{ marginTop: '20px', padding: '15px', background: '#f0f9eb', border: '1px solid #c2e7b0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <MdCheckCircle color="#67c23a" />
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Entidad Cargada</h3>
                  </div>
                  <div className="empresa-details" style={{ fontSize: '0.9rem' }}>
                    <p><strong>{entidad.nombre} {entidad.apellidos || entidad.razonSocial}</strong></p>
                    <p className="text-muted">ID: {entidad.numeroIdentificacion} | {entidad.ciudad}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h2>2. Información Adicional</h2>
              <p className="small text-muted">Completa los campos que no son maestros ni de la entidad.</p>
              
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label>Asunto / Título del documento</label>
                  <input 
                    type="text" 
                    className="edit-input" 
                    style={{ width: '100%' }}
                    placeholder="Ej: Entrega de suministros oficina norte"
                    onChange={(e) => setExtraData({...extraData, asunto: e.target.value})}
                  />
                </div>
                <div>
                  <label>Observaciones adicionales (para la plantilla)</label>
                  <textarea 
                    className="edit-input" 
                    style={{ width: '100%', minHeight: '80px' }}
                    placeholder="Contenido específico que se fusionará si existe el token {{observaciones}}..."
                    onChange={(e) => setExtraData({...extraData, observaciones: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Columna Derecha: Resumen y Emisión */}
          <section className="card" style={{ padding: '20px', height: 'fit-content' }}>
            <h2>3. Sello de Integridad y Emisión</h2>
            <div style={{ marginTop: '20px', padding: '20px', background: '#f4f7fe', borderRadius: '10px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <MdInfo size={40} color="#2b5fcc" />
                <div style={{ fontSize: '0.9rem' }}>
                  <p><strong>Aviso Normativo:</strong> Este proceso generará un radicado oficial inalterable.</p>
                  <p className="text-muted" style={{ marginTop: '5px' }}>El documento PDF resultante incluirá un Hash SHA-256 basado en los datos del snapshot actual.</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #dce4ff', paddingTop: '20px' }}>
                <button 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%', height: '70px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  onClick={handleProyectar}
                  disabled={generating || !entidad}
                >
                  <MdFileDownload size={28} /> 
                  {generating ? "Generando PDF..." : "Emitir Radicado y Descargar"}
                </button>
                {!entidad && <p className="text-center small text-danger" style={{ marginTop: '10px' }}>Debes identificar una entidad para proceder.</p>}
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <h3>Trazabilidad de la Plantilla</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', fontSize: '0.85rem' }}>
                <li style={{ padding: '5px 0' }}>📂 <strong>Subserie:</strong> {plantilla?.subserieId?.nombreSubserie || 'Cargando...'}</li>
                <li style={{ padding: '5px 0' }}>🏷️ <strong>Versión:</strong> v{plantilla?.versionActual}</li>
                <li style={{ padding: '5px 0' }}>📅 <strong>Vigencia:</strong> {new Date(plantilla?.updatedAt).toLocaleDateString()}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}
