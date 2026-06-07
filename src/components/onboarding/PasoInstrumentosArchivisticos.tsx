import { useState } from "react";
import * as IconsMd from "react-icons/md";

// Iconos Md según el patrón del proyecto
const MdDescription = (IconsMd as any).MdDescription;
const MdWarning = (IconsMd as any).MdWarning;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdNavigateNext = (IconsMd as any).MdNavigateNext;

interface PasoInstrumentosArchivisticosProps {
  respuestasPaso: Record<string, any>;
  submitting: boolean;
  isTareaCompletada: (titulo: string) => boolean;
  onGuardar: (payload: Record<string, any>) => void;
}

export default function PasoInstrumentosArchivisticos({
  respuestasPaso,
  submitting,
  isTareaCompletada,
  onGuardar,
}: PasoInstrumentosArchivisticosProps) {
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState<string>(
    respuestasPaso.instrumento || ""
  );

  const trdCompletada = isTareaCompletada("Construir y aprobar la Tabla de Retención Documental (TRD)");
  const tvdCompletada = isTareaCompletada("Construir y aprobar la Tabla de Valoración Documental (TVD)");

  // Validar según el instrumento seleccionado
  let trdRequerida = false;
  let tvdRequerida = false;
  let trdFaltante = false;
  let tvdFaltante = false;

  if (instrumentoSeleccionado === "trd") {
    trdRequerida = true;
    trdFaltante = !trdCompletada;
  } else if (instrumentoSeleccionado === "tvd") {
    tvdRequerida = true;
    tvdFaltante = !tvdCompletada;
  } else if (instrumentoSeleccionado === "ambos") {
    trdRequerida = true;
    tvdRequerida = true;
    trdFaltante = !trdCompletada;
    tvdFaltante = !tvdCompletada;
  }

  const estaBloqueado = (trdRequerida && trdFaltante) || (tvdRequerida && tvdFaltante);
  const estaAprobado = instrumentoSeleccionado && !estaBloqueado;

  const handleSeleccionarInstrumento = (instrumento: string) => {
    setInstrumentoSeleccionado(instrumento);
  };

  const handleContinuar = () => {
    if (instrumentoSeleccionado) {
      onGuardar({ instrumento: instrumentoSeleccionado });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdDescription style={{ color: "var(--primary)" }} /> Paso 4: Instrumentos Archivísticos (TRD / TVD)
      </h2>
      <p className="text-muted">
        Selecciona el instrumento archivístico que requiere tu organización. La <strong>TRD</strong> regula los documentos actuales y futuros; la <strong>TVD</strong> regula la disposición final de los fondos históricos.
      </p>

      {/* Advertencias y validaciones en vivo */}
      {instrumentoSeleccionado && estaBloqueado && (
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
            Los instrumentos archivísticos correspondientes están pendientes de construcción y aprobación oficial en la plataforma.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {trdRequerida && trdFaltante && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontSize: "0.85rem",
                }}
                onClick={() => { window.location.href = "/configuracion-trd"; }}
              >
                Construir TRD
              </button>
            )}
            {tvdRequerida && tvdFaltante && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontSize: "0.85rem",
                }}
                onClick={() => { window.location.href = "/tabla-valoracion"; }}
              >
                Construir TVD
              </button>
            )}
          </div>
        </div>
      )}

      {estaAprobado && (
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
          <span>Los instrumentos seleccionados ya se encuentran configurados y vigentes en el sistema.</span>
        </div>
      )}

      {/* Botones de selección de instrumentos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{
            justifyContent: "flex-start",
            padding: "16px",
            height: "auto",
            borderRadius: "12px",
            border: instrumentoSeleccionado === "trd"
              ? "2px solid var(--primary)"
              : "1px solid rgba(60,64,67,0.12)",
            background: instrumentoSeleccionado === "trd"
              ? "rgba(26,115,232,0.04)"
              : "transparent",
            textAlign: "left",
          }}
          onClick={() => handleSeleccionarInstrumento("trd")}
        >
          <div>
            <strong>TRD (Tabla de Retención Documental)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Recomendado. Regula la producción de documentos actuales (Gestión, Central, Disposición Final).
            </div>
          </div>
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          style={{
            justifyContent: "flex-start",
            padding: "16px",
            height: "auto",
            borderRadius: "12px",
            border: instrumentoSeleccionado === "tvd"
              ? "2px solid var(--primary)"
              : "1px solid rgba(60,64,67,0.12)",
            background: instrumentoSeleccionado === "tvd"
              ? "rgba(26,115,232,0.04)"
              : "transparent",
            textAlign: "left",
          }}
          onClick={() => handleSeleccionarInstrumento("tvd")}
        >
          <div>
            <strong>TVD (Tabla de Valoración Documental)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Requerido si solo se procesarán fondos acumulados históricos y no habrá producción documental actual.
            </div>
          </div>
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          style={{
            justifyContent: "flex-start",
            padding: "16px",
            height: "auto",
            borderRadius: "12px",
            border: instrumentoSeleccionado === "ambos"
              ? "2px solid var(--primary)"
              : "1px solid rgba(60,64,67,0.12)",
            background: instrumentoSeleccionado === "ambos"
              ? "rgba(26,115,232,0.04)"
              : "transparent",
            textAlign: "left",
          }}
          onClick={() => handleSeleccionarInstrumento("ambos")}
        >
          <div>
            <strong>Ambos Instrumentos</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Implementación completa de TRD para la producción actual y TVD para el archivo histórico.
            </div>
          </div>
        </button>
      </div>

      {/* Botón de navegación */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ borderRadius: "22px" }}
          disabled={submitting || !instrumentoSeleccionado || estaBloqueado}
          onClick={handleContinuar}
        >
          Continuar <MdNavigateNext />
        </button>
      </div>
    </div>
  );
}
