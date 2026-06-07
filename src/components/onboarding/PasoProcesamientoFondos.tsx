import { useState } from "react";
import * as IconsMd from "react-icons/md";

// Iconos Md según el patrón del proyecto
const MdWarning = (IconsMd as any).MdWarning;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdNavigateNext = (IconsMd as any).MdNavigateNext;
const MdHistory = (IconsMd as any).MdHistory;

interface PasoProcesamientoFondosProps {
  respuestasPaso: Record<string, any>;
  submitting: boolean;
  isTareaCompletada: (titulo: string) => boolean;
  onGuardar: (payload: Record<string, any>) => void;
}

export default function PasoProcesamientoFondos({
  respuestasPaso,
  submitting,
  isTareaCompletada,
  onGuardar,
}: PasoProcesamientoFondosProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string>(
    respuestasPaso.metodoProcesamiento || ""
  );

  const inventarioCompletado = isTareaCompletada(
    "Realizar inventario preliminar de fondos acumulados"
  );

  const handleSeleccionarMetodo = (metodo: string) => {
    setMetodoSeleccionado(metodo);
  };

  const handleContinuar = () => {
    if (metodoSeleccionado) {
      onGuardar({ metodoProcesamiento: metodoSeleccionado });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <MdHistory style={{ color: "var(--primary)" }} /> Paso 2: Procesamiento de Fondos Acumulados
      </h2>
      <p className="text-muted">
        Define la metodología que utilizarás para organizar, valorar y legalizar tus documentos históricos acumulados.
      </p>

      {/* Alertas y validación de la tarea */}
      {!inventarioCompletado ? (
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
            Debes completar la tarea <strong>"Realizar inventario preliminar de fondos acumulados"</strong> cargando el inventario FUID en el sistema antes de poder continuar al paso 3.
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
            onClick={() => { window.location.href = "/fondos-acumulados"; }}
          >
            Ir a Cargar FUID
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
          <span>El inventario preliminar de fondos acumulados ha sido cargado y validado en la base de datos de manera exitosa.</span>
        </div>
      )}

      {/* Opciones de metodología */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{
            justifyContent: "flex-start",
            padding: "16px",
            height: "auto",
            borderRadius: "12px",
            border: metodoSeleccionado === "valoracion_rapida"
              ? "2px solid var(--primary)"
              : "1px solid rgba(60,64,67,0.12)",
            background: metodoSeleccionado === "valoracion_rapida"
              ? "rgba(26,115,232,0.04)"
              : "transparent",
            textAlign: "left",
          }}
          onClick={() => handleSeleccionarMetodo("valoracion_rapida")}
        >
          <div>
            <strong>Valoración Rápida Asistida (Recomendado)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Te formularemos preguntas concretas sobre el lote para decidir qué conservar, digitalizar o eliminar.
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
            border: metodoSeleccionado === "tvd"
              ? "2px solid var(--primary)"
              : "1px solid rgba(60,64,67,0.12)",
            background: metodoSeleccionado === "tvd"
              ? "rgba(26,115,232,0.04)"
              : "transparent",
            textAlign: "left",
          }}
          onClick={() => handleSeleccionarMetodo("tvd")}
        >
          <div>
            <strong>Tabla de Valoración Documental (TVD)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Construiremos la TVD formal para el fondo acumulado conforme a la normativa.
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
            border: metodoSeleccionado === "ingreso_manual"
              ? "2px solid var(--primary)"
              : "1px solid rgba(60,64,67,0.12)",
            background: metodoSeleccionado === "ingreso_manual"
              ? "rgba(26,115,232,0.04)"
              : "transparent",
            textAlign: "left",
          }}
          onClick={() => handleSeleccionarMetodo("ingreso_manual")}
        >
          <div>
            <strong>Ingreso Manual (Carga masiva FUID)</strong>
            <div className="small text-muted" style={{ fontWeight: "normal", marginTop: "4px" }}>
              Carga el inventario FUID directamente a la plataforma mediante archivo Excel/CSV.
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
          disabled={submitting || !inventarioCompletado || !metodoSeleccionado}
          onClick={handleContinuar}
        >
          Continuar <MdNavigateNext />
        </button>
      </div>
    </div>
  );
}
