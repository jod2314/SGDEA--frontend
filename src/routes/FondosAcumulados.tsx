import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import PasoAlistamiento from "../components/fda/PasoAlistamiento";
import PasoHistoriaCEOF from "../components/fda/PasoHistoriaCEOF";
import PasoDiagnosticoDIA from "../components/fda/PasoDiagnosticoDIA";
import PasoOrganizacionFUID from "../components/fda/PasoOrganizacionFUID";
import PasoValoracionTVD from "../components/fda/PasoValoracionTVD";
import PasoCierreInforme from "../components/fda/PasoCierreInforme";

const MdFolderSpecial = (IconsMd as any).MdFolderSpecial || (IconsMd as any).MdFolder;
const MdCalculate = (IconsMd as any).MdCalculate || (IconsMd as any).MdFunctions;
const MdHistoryEdu = (IconsMd as any).MdHistoryEdu || (IconsMd as any).MdMenuBook;
const MdAssessment = (IconsMd as any).MdAssessment || (IconsMd as any).MdAnalytics;
const MdCleaningServices = (IconsMd as any).MdCleaningServices || (IconsMd as any).MdBroom;
const MdGavel = (IconsMd as any).MdGavel;
const MdAssignmentCheck = (IconsMd as any).MdAssignmentTurnedIn || (IconsMd as any).MdCheckCircle;

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

  // Workflow Completo de 6 Pasos para Fondos Acumulados
  const [activeTab, setActiveTab] = useState<"paso0" | "paso1" | "paso2" | "paso3" | "paso4" | "paso5" | "inventario">("paso0");

  useEffect(() => {
    fetchFondos();
  }, []);

  const fetchFondos = async () => {
    try {
      const res = await auth.request<{ fondos: FondoAcumulado[] }>("/fondos-acumulados");
      if (res && res.fondos) {
        setFondos(res.fondos);
      }
    } catch (err) {
      console.error("Error al cargar fondos acumulados", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="fondos-acumulados-container" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Cabecera Corporativa con Estética Glassmorphism */}
        <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)" }}>
          <h2 style={{ margin: "0 0 10px 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "10px" }}>
            <MdFolderSpecial size={28} /> Torre de Control: Procesamiento Técnico de Fondos Acumulados
          </h2>
          <p className="small text-muted" style={{ margin: 0 }}>
            Guía metodológica paso a paso para la intervención, diagnóstico DIA, valoración y organización de fondos acumulados desorganizados (Normativa AGN - Ley 594 de 2000).
          </p>

          {/* Navegación por Pestañas del Workflow Completo */}
          <div className="tabs" style={{ display: "flex", gap: "10px", marginTop: "20px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", overflowX: "auto" }}>
            <button
              onClick={() => setActiveTab("paso0")}
              style={{
                background: activeTab === "paso0" ? "var(--primary)" : "var(--bg-app)",
                color: activeTab === "paso0" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--glass-border)",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MdCalculate /> Paso 0: Alistamiento & N95
            </button>

            <button
              onClick={() => setActiveTab("paso1")}
              style={{
                background: activeTab === "paso1" ? "var(--primary)" : "var(--bg-app)",
                color: activeTab === "paso1" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--glass-border)",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MdHistoryEdu /> Paso 1: Historia (CEOF)
            </button>

            <button
              onClick={() => setActiveTab("paso2")}
              style={{
                background: activeTab === "paso2" ? "var(--primary)" : "var(--bg-app)",
                color: activeTab === "paso2" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--glass-border)",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MdAssessment /> Paso 2: Diagnóstico (DIA)
            </button>

            <button
              onClick={() => setActiveTab("paso3")}
              style={{
                background: activeTab === "paso3" ? "var(--primary)" : "var(--bg-app)",
                color: activeTab === "paso3" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--glass-border)",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MdCleaningServices /> Paso 3: Organización & QR
            </button>

            <button
              onClick={() => setActiveTab("paso4")}
              style={{
                background: activeTab === "paso4" ? "var(--primary)" : "var(--bg-app)",
                color: activeTab === "paso4" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--glass-border)",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MdGavel /> Paso 4: Valoración (TVD)
            </button>

            <button
              onClick={() => setActiveTab("paso5")}
              style={{
                background: activeTab === "paso5" ? "var(--primary)" : "var(--bg-app)",
                color: activeTab === "paso5" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--glass-border)",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MdAssignmentCheck /> Paso 5: FUID & Cierre
            </button>
          </div>
        </div>

        {/* Renderizado Dinámico de los 6 Pasos Metodológicos */}
        {activeTab === "paso0" && <PasoAlistamiento />}
        {activeTab === "paso1" && <PasoHistoriaCEOF />}
        {activeTab === "paso2" && <PasoDiagnosticoDIA />}
        {activeTab === "paso3" && <PasoOrganizacionFUID />}
        {activeTab === "paso4" && <PasoValoracionTVD />}
        {activeTab === "paso5" && <PasoCierreInforme />}

        {/* Tabla de Inventario FUID Registrado */}
        {activeTab === "inventario" && (
          <div className="card" style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--primary)" }}>Registros de Inventario FUID en Custodia</h3>
            {loading ? (
              <p>Cargando registros...</p>
            ) : fondos.length === 0 ? (
              <p className="small text-muted">No se han registrado inventarios aún. Utilice las pestañas superiores para iniciar el alistamiento y procesamiento.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Código Inventario</th>
                    <th style={{ padding: "10px" }}>Sección / Dependencia</th>
                    <th style={{ padding: "10px" }}>Asunto / Serie</th>
                    <th style={{ padding: "10px" }}>Estado Conservación</th>
                  </tr>
                </thead>
                <tbody>
                  {fondos.map((item) => (
                    <tr key={item._id} style={{ borderBottom: "1px dashed var(--glass-border)" }}>
                      <td style={{ padding: "10px" }}>{item.codigoInventario}</td>
                      <td style={{ padding: "10px" }}>{item.seccion}</td>
                      <td style={{ padding: "10px" }}>{item.asunto}</td>
                      <td style={{ padding: "10px" }}>
                        <span className="badge" style={{ background: "var(--primary-light-2)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px" }}>
                          {item.estadoConservacion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
