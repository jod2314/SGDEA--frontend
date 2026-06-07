import { useState } from "react";
import * as IconsMd from "react-icons/md";

// Iconos Md según el patrón del proyecto
const MdPeople = (IconsMd as any).MdPeople;
const MdWarning = (IconsMd as any).MdWarning;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdNavigateNext = (IconsMd as any).MdNavigateNext;

interface PasoComiteArchivoProps {
  respuestasPaso: Record<string, any>;
  submitting: boolean;
  isTareaCompletada: (titulo: string) => boolean;
  onGuardar: (payload: Record<string, any>) => void;
  onDownloadDoc: (tipo: string) => void;
}

export default function PasoComiteArchivo({
  respuestasPaso,
  submitting,
  isTareaCompletada,
  onGuardar,
  onDownloadDoc,
}: PasoComiteArchivoProps) {
  const [tieneComite, setTieneComite] = useState<string>(respuestasPaso.tieneComite || "");
  const [presidente, setPresidente] = useState<string>(respuestasPaso.presidente || "");
  const [secretario, setSecretario] = useState<string>(respuestasPaso.secretario || "");
  const [responsableArchivo, setResponsableArchivo] = useState<string>(respuestasPaso.responsableArchivo || "");
  const funciones = respuestasPaso.funciones || "";

  const actaAprobada = isTareaCompletada("Aprobar acta institucional del Comité de Archivo");

  // Es bloqueante si tieneComite es 'no' o 'verbal', y el acta está incompleta
  const necesitaValidacionComite = tieneComite === "no" || tieneComite === "verbal";
  const estaBloqueado = necesitaValidacionComite && !actaAprobada;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      tieneComite,
      presidente,
      secretario,
      responsableArchivo,
      funciones,
    });
  };

  const handleDescargarBorrador = () => {
    if (!presidente || !secretario) {
      alert("Ingresa los nombres de los miembros para generar el acta.");
      return;
    }
    onGuardar({
      tieneComite,
      presidente,
      secretario,
      responsableArchivo,
      funciones,
    });
    onDownloadDoc("ACTA_COMITE");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdPeople style={{ color: "var(--primary)" }} /> Paso 3: Comité de Archivo (Gobernanza)
      </h2>
      <p className="text-muted">
        El Comité de Archivo es el órgano colegiado interno encargado de aprobar los manuales, TRD y la disposición documental en la empresa.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "0.95rem" }}>
            ¿Cuenta con un Comité de Archivo legalmente conformado?
          </label>
          <select
            className="edit-input"
            style={{ width: "100%" }}
            value={tieneComite}
            onChange={(e) => setTieneComite(e.target.value)}
            required
          >
            <option value="">Seleccione...</option>
            <option value="si">Sí, tenemos acta de conformación vigente</option>
            <option value="verbal">Existe de manera informal (verbal, sin acta)</option>
            <option value="no">No existe</option>
          </select>
        </div>

        {/* Mensaje Informativo o Bloqueo */}
        {necesitaValidacionComite && (
          <>
            {!actaAprobada ? (
              <div style={{
                padding: "16px",
                background: "rgba(217, 48, 37, 0.06)",
                color: "var(--danger)",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                border: "1px solid rgba(217, 48, 37, 0.2)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MdWarning size={20} />
                  <strong>Acción Bloqueada:</strong>
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  Debes oficializar la conformación y aprobar el acta del Comité de Archivo en la base de datos antes de continuar al Paso 4.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    alignSelf: "flex-start",
                    border: "1px solid var(--danger)",
                    color: "var(--danger)",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    fontSize: "0.85rem",
                  }}
                  onClick={() => { window.location.href = "/comite-archivo"; }}
                >
                  Ir a Conformar Comité de Archivo
                </button>
              </div>
            ) : (
              <div style={{
                padding: "16px",
                background: "rgba(52, 168, 83, 0.06)",
                color: "#34a853",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid rgba(52, 168, 83, 0.2)",
                fontSize: "0.9rem",
              }}>
                <MdCheckCircle size={20} />
                <span>¡Perfecto! El Acta de Constitución del Comité de Archivo ha sido aprobada de manera oficial en la base de datos.</span>
              </div>
            )}

            <div className="alert alert-info" style={{ margin: "8px 0", fontSize: "0.9rem" }}>
              💡 <strong>Sugerencia Normativa:</strong> El sistema puede autogenerar el Acta de Constitución obligatoria para que sea firmada y declarada oficial. Ingresa los miembros a continuación:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "3px solid var(--primary)", paddingLeft: "16px", marginTop: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Presidente (Representante Legal o Delegado)</label>
                  <input
                    type="text"
                    className="edit-input"
                    style={{ width: "100%" }}
                    value={presidente}
                    placeholder="Nombre del cargo/miembro"
                    onChange={(e) => setPresidente(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Secretario del Comité</label>
                  <input
                    type="text"
                    className="edit-input"
                    style={{ width: "100%" }}
                    value={secretario}
                    placeholder="Nombre del secretario"
                    onChange={(e) => setSecretario(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>Responsable de Archivo o Tecnología (Secretaría Técnica)</label>
                <input
                  type="text"
                  className="edit-input"
                  style={{ width: "100%" }}
                  value={responsableArchivo}
                  placeholder="Nombre del líder de archivo"
                  onChange={(e) => setResponsableArchivo(e.target.value)}
                  required
                />
              </div>
            </div>
          </>
        )}

        {tieneComite === "si" && (
          <div style={{
            padding: "16px",
            background: "rgba(52, 168, 83, 0.06)",
            color: "#34a853",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid rgba(52, 168, 83, 0.2)",
            fontSize: "0.9rem",
          }}>
            <MdCheckCircle size={20} />
            <span>Al poseer un Comité de Archivo legalmente constituido, puedes avanzar al Paso 4 sin validación de actas adicionales.</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
          {necesitaValidacionComite && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ borderRadius: "22px" }}
              onClick={handleDescargarBorrador}
            >
              <MdFileDownload /> Generar Acta de Conformación
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: "22px" }}
            disabled={submitting || estaBloqueado || !tieneComite}
          >
            Continuar <MdNavigateNext />
          </button>
        </div>
      </form>
    </div>
  );
}
