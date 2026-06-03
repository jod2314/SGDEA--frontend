import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";

const MdAdd = (IconsMd as any).MdAdd;
const MdDelete = (IconsMd as any).MdDelete;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdHistory = (IconsMd as any).MdHistory;

interface FondoAcumulado {
  _id: string;
  codigoInventario: string;
  seccion: string;
  subseccion?: string;
  asunto: string;
  fechasExtremas?: {
    inicial?: string;
    final?: string;
  };
  soporte: "FISICO" | "DIGITAL" | "AMBOS";
  volumen?: {
    cajas?: number;
    carpetas?: number;
    folios?: number;
  };
  estadoConservacion: "BUENO" | "REGULAR" | "MALO";
  createdAt: string;
}

export default function FondosAcumulados() {
  const auth = useAuth();
  const [fondos, setFondos] = useState<FondoAcumulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Estado del formulario
  const [showForm, setShowForm] = useState(false);
  const [codigoInventario, setCodigoInventario] = useState("");
  const [seccion, setSeccion] = useState("");
  const [subseccion, setSubseccion] = useState("");
  const [asunto, setAsunto] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [soporte, setSoporte] = useState<"FISICO" | "DIGITAL" | "AMBOS">("FISICO");
  const [cajas, setCajas] = useState(0);
  const [carpetas, setCarpetas] = useState(0);
  const [folios, setFolios] = useState(0);
  const [estadoConservacion, setEstadoConservacion] = useState<"BUENO" | "REGULAR" | "MALO">("BUENO");

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchFondos();
    }
  }, [auth.isAuthenticated]);

  async function fetchFondos() {
    try {
      setLoading(true);
      const json = await auth.request<any>("/fondos-acumulados");
      setFondos(json.body.fondos || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await auth.request<any>("/fondos-acumulados", {
        method: "POST",
        body: JSON.stringify({
          codigoInventario,
          seccion,
          subseccion: subseccion || undefined,
          asunto,
          fechasExtremas: {
            inicial: fechaInicial || undefined,
            final: fechaFinal || undefined,
          },
          soporte,
          volumen: {
            cajas: Number(cajas) || 0,
            carpetas: Number(carpetas) || 0,
            folios: Number(folios) || 0,
          },
          estadoConservacion,
        }),
      });

      setShowForm(false);
      resetForm();
      fetchFondos();
    } catch (err: any) {
      setError(err.message || "Error al guardar el registro");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Deseas eliminar este registro de inventario histórico?")) return;
    try {
      await auth.request<any>(`/fondos-acumulados/${id}`, {
        method: "DELETE",
      });
      fetchFondos();
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  }

  async function handleExportarFuid() {
    try {
      const blob = await auth.request<Blob>("/fondos-acumulados/exportar-fuid", {
        method: "GET",
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FUID_Historico_Fondos_Acumulados.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al exportar el inventario");
    }
  }

  function resetForm() {
    setCodigoInventario("");
    setSeccion("");
    setSubseccion("");
    setAsunto("");
    setFechaInicial("");
    setFechaFinal("");
    setSoporte("FISICO");
    setCajas(0);
    setCarpetas(0);
    setFolios(0);
    setEstadoConservacion("BUENO");
  }

  return (
    <PortalLayout>
      <div className="fondos-container">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1>Inventario de Fondos Acumulados</h1>
            <p className="text-muted">Levantamiento y valoración del archivo histórico previo a la creación del SGDEA.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={handleExportarFuid} disabled={fondos.length === 0}>
              <MdFileDownload /> Exportar FUID (CSV)
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <MdAdd /> {showForm ? "Cerrar Formulario" : "Registrar Fondo Histórico"}
            </button>
          </div>
        </header>

        {error && <div className="errorMessage" style={{ marginBottom: "20px" }}>{error}</div>}

        {showForm && (
          <section className="card" style={{ padding: "20px", marginBottom: "30px", borderLeft: "4px solid var(--primary-color)" }}>
            <h2>Registrar Inventario Histórico (FUID)</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Código Inventario (Consecutivo)</label>
                  <input
                    type="text"
                    value={codigoInventario}
                    onChange={(e) => setCodigoInventario(e.target.value)}
                    required
                    className="edit-input"
                    placeholder="Ej: FUID-2026-001"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Sección Productora</label>
                  <input
                    type="text"
                    value={seccion}
                    onChange={(e) => setSeccion(e.target.value)}
                    required
                    className="edit-input"
                    placeholder="Ej: Contabilidad"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Subsección (Opcional)</label>
                  <input
                    type="text"
                    value={subseccion}
                    onChange={(e) => setSubseccion(e.target.value)}
                    className="edit-input"
                    placeholder="Ej: Impuestos"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label>Asunto / Serie Documental Histórica</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  required
                  className="edit-input"
                  placeholder="Ej: Comprobantes de Pago y Facturas"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Fecha Inicial (Fecha Extrema Inicial)</label>
                  <input
                    type="date"
                    value={fechaInicial}
                    onChange={(e) => setFechaInicial(e.target.value)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Fecha Final (Fecha Extrema Final)</label>
                  <input
                    type="date"
                    value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Soporte de Conservación</label>
                  <select
                    value={soporte}
                    onChange={(e) => setSoporte(e.target.value as any)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  >
                    <option value="FISICO">Físico</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Volumen Cajas</label>
                  <input
                    type="number"
                    value={cajas}
                    onChange={(e) => setCajas(Number(e.target.value))}
                    min={0}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Volumen Carpetas</label>
                  <input
                    type="number"
                    value={carpetas}
                    onChange={(e) => setCarpetas(Number(e.target.value))}
                    min={0}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Volumen Folios</label>
                  <input
                    type="number"
                    value={folios}
                    onChange={(e) => setFolios(Number(e.target.value))}
                    min={0}
                    className="edit-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label>Estado Conservación</label>
                  <select
                    value={estadoConservacion}
                    onChange={(e) => setEstadoConservacion(e.target.value as any)}
                    className="edit-input"
                    style={{ width: "100%" }}
                  >
                    <option value="BUENO">Bueno</option>
                    <option value="REGULAR">Regular</option>
                    <option value="MALO">Malo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Registrando..." : "Registrar Inventario"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="card" style={{ padding: "20px" }}>
          <h2><MdHistory /> Registros de Fondos Históricos</h2>
          <div style={{ marginTop: "20px", overflowX: "auto" }}>
            {loading ? (
              <p>Cargando inventarios...</p>
            ) : fondos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <MdHistory size={60} style={{ opacity: 0.3, marginBottom: "15px" }} />
                <p>No se han registrado fondos acumulados en el inventario.</p>
                <p className="small">Haz clic en "Registrar Fondo Histórico" para comenzar.</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Código</th>
                    <th style={{ padding: "10px" }}>Sección / Subsección</th>
                    <th style={{ padding: "10px" }}>Asunto / Serie</th>
                    <th style={{ padding: "10px" }}>Fechas Extremas</th>
                    <th style={{ padding: "10px" }}>Volumen</th>
                    <th style={{ padding: "10px" }}>Estado</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {fondos.map((f) => (
                    <tr key={f._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "10px" }}>
                        <strong>{f.codigoInventario}</strong>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div>{f.seccion}</div>
                        {f.subseccion && (
                          <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
                            {f.subseccion}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px" }}>{f.asunto}</td>
                      <td style={{ padding: "10px" }} className="small">
                        {f.fechasExtremas?.inicial
                          ? new Date(f.fechasExtremas.inicial).toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {f.fechasExtremas?.final
                          ? new Date(f.fechasExtremas.final).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={{ padding: "10px" }} className="small">
                        {f.volumen?.cajas || 0} cajas, {f.volumen?.carpetas || 0} carp., {f.volumen?.folios || 0} fols.
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          Soporte: {f.soporte}
                        </div>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background:
                              f.estadoConservacion === "BUENO"
                                ? "#e6f4ea"
                                : f.estadoConservacion === "REGULAR"
                                ? "#fef7e0"
                                : "#fce8e6",
                            color:
                              f.estadoConservacion === "BUENO"
                                ? "#137333"
                                : f.estadoConservacion === "REGULAR"
                                ? "#b06000"
                                : "#c5221f",
                          }}
                        >
                          {f.estadoConservacion}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => handleDelete(f._id)}
                          title="Eliminar"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
