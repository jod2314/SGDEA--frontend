import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";
import * as IconsMd from "react-icons/md";
import { OnboardingWizard } from "../types/types";

const MdAutoAwesome = (IconsMd as any).MdAutoAwesome;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;
const MdFileDownload = (IconsMd as any).MdFileDownload;
const MdPlayArrow = (IconsMd as any).MdPlayArrow;
const MdNavigateNext = (IconsMd as any).MdNavigateNext;
const MdInfo = (IconsMd as any).MdInfo;

export default function AsistenteOnboarding() {
  const auth = useAuth();
  const [wizard, setWizard] = useState<OnboardingWizard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estado del formulario para el paso actual
  const [respuestasPaso, setRespuestasPaso] = useState<any>({});

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchEstado();
    }
  }, [auth.isAuthenticated]);

  async function fetchEstado() {
    try {
      const json = await auth.request<any>("/onboarding/estado");
      setWizard(json.body.wizard);
      // Pre-cargar respuestas si existen para el paso actual
      const pasoKey = getPasoClave(json.body.wizard.estadoActual);
      setRespuestasPaso(json.body.wizard.respuestas[pasoKey] || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getPasoClave(estado: string): string {
    switch (estado) {
      case 'INICIO': return 'diagnostico';
      case 'DIAGNOSTICO_MGDA': return 'comite';
      case 'COMITE_ARCHIVO': return 'politica';
      case 'POLITICA_DOCUMENTAL': return 'pgd';
      case 'PGD': return 'fondos';
      default: return '';
    }
  }

  async function handleResponder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const pasoMapping: { [key: string]: string } = {
      'INICIO': 'DIAGNOSTICO',
      'DIAGNOSTICO_MGDA': 'COMITE',
      'COMITE_ARCHIVO': 'POLITICA',
      'POLITICA_DOCUMENTAL': 'PGD',
      'PGD': 'FONDOS'
    };

    const pasoNombre = pasoMapping[wizard!.estadoActual];

    try {
      await auth.request<any>("/onboarding/responder", {
        method: "POST",
        body: JSON.stringify({
          paso: pasoNombre,
          respuestas: respuestasPaso
        })
      });
      fetchEstado();
      setRespuestasPaso({});
    } catch (error) {
      alert("Error al guardar respuestas");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadDoc(tipo: string) {
    try {
      const blob = await auth.request<Blob>(`/onboarding/generar/${tipo}`, {
        method: "POST",
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SISTEMA_${tipo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error: any) {
      alert(error.message || "Error al descargar documento");
    }
  }

  if (loading) return <PortalLayout><p>Cargando asistente...</p></PortalLayout>;

  return (
    <PortalLayout>
      <div className="wizard-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <MdAutoAwesome size={48} color="var(--primary-color)" />
          <h1 style={{ marginTop: '10px' }}>Asistente Inteligente de Implementación</h1>
          <p className="text-muted">Guía paso a paso para formalizar tu gestión documental bajo la norma colombiana.</p>
          
          <div className="progress-bar-container" style={{ marginTop: '30px', background: '#eee', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div className="progress-bar" style={{ width: `${wizard?.progreso}%`, background: 'var(--primary-color)', height: '100%', transition: 'width 0.5s ease' }}></div>
          </div>
          <p className="small" style={{ marginTop: '10px' }}>Progreso: <strong>{wizard?.progreso}%</strong></p>
        </header>

        <div className="wizard-step card" style={{ padding: '30px' }}>
          {wizard?.estadoActual === 'INICIO' && (
            <div className="step-content">
              <h2>1. Diagnóstico Inicial (MGDA)</h2>
              <p className="text-muted">Evaluemos el estado actual de tu archivo para definir la hoja de ruta.</p>
              <form onSubmit={handleResponder} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label>¿Cuenta actualmente con un área responsable de gestión documental?</label>
                  <select className="edit-input" style={{ width: '100%' }} onChange={e => setRespuestasPaso({...respuestasPaso, areaResponsable: e.target.value})}>
                    <option value="">Seleccione...</option>
                    <option value="si">Sí, un área formal</option>
                    <option value="no">No, se maneja de forma dispersa</option>
                  </select>
                </div>
                <div>
                  <label>¿Tiene inventariada la documentación física?</label>
                  <select className="edit-input" style={{ width: '100%' }} onChange={e => setRespuestasPaso({...respuestasPaso, inventarioFisico: e.target.value})}>
                    <option value="">Seleccione...</option>
                    <option value="si">Sí, completo</option>
                    <option value="parcial">Parcialmente</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
                  Continuar <MdNavigateNext />
                </button>
              </form>
            </div>
          )}

          {wizard?.estadoActual === 'DIAGNOSTICO_MGDA' && (
            <div className="step-content">
              <h2>2. Constitución del Comité de Archivo</h2>
              <p className="text-muted">Definamos los responsables del gobierno de información.</p>
              <form onSubmit={handleResponder} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label>Presidente del Comité</label>
                    <input type="text" className="edit-input" style={{ width: '100%' }} placeholder="Nombre del Representante Legal" onChange={e => setRespuestasPaso({...respuestasPaso, presidente: e.target.value})} />
                  </div>
                  <div>
                    <label>Secretario del Comité</label>
                    <input type="text" className="edit-input" style={{ width: '100%' }} placeholder="Nombre del Secretario General" onChange={e => setRespuestasPaso({...respuestasPaso, secretario: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label>Responsable de Archivo / Tecnología</label>
                  <input type="text" className="edit-input" style={{ width: '100%' }} placeholder="Nombre del encargado" onChange={e => setRespuestasPaso({...respuestasPaso, responsableArchivo: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
                  Generar Acta y Continuar <MdNavigateNext />
                </button>
              </form>
            </div>
          )}

          {wizard?.estadoActual === 'COMITE_ARCHIVO' && (
            <div className="step-content">
              <h2>3. Política de Gestión Documental</h2>
              <p className="text-muted">Establezcamos las directrices institucionales.</p>
              <form onSubmit={handleResponder} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label>Misión del Sistema (Propósito)</label>
                  <textarea className="edit-input" style={{ width: '100%', minHeight: '80px' }} placeholder="Ej: Garantizar la integridad y acceso a la memoria institucional..." onChange={e => setRespuestasPaso({...respuestasPaso, mision: e.target.value})} />
                </div>
                <div>
                  <label>Alcance de la Política</label>
                  <input type="text" className="edit-input" style={{ width: '100%' }} placeholder="Ej: Todas las dependencias y contratistas de la entidad" onChange={e => setRespuestasPaso({...respuestasPaso, alcance: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
                  Generar Política y Continuar <MdNavigateNext />
                </button>
              </form>
            </div>
          )}

          {wizard?.estadoActual === 'POLITICA_DOCUMENTAL' && (
            <div className="step-content">
              <h2>4. Programa de Gestión Documental (PGD)</h2>
              <p className="text-muted">El plan estratégico de tu archivo para los próximos 4 años.</p>
              <form onSubmit={handleResponder} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label>Presupuesto anual estimado para Archivo ($)</label>
                  <input type="number" className="edit-input" style={{ width: '100%' }} onChange={e => setRespuestasPaso({...respuestasPaso, presupuesto: e.target.value})} />
                </div>
                <div>
                  <label>Objetivo Estratégico 2026</label>
                  <input type="text" className="edit-input" style={{ width: '100%' }} placeholder="Ej: Implementar el SGDEA y eliminar el papel en un 80%" onChange={e => setRespuestasPaso({...respuestasPaso, objetivo: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
                  Generar PGD y Continuar <MdNavigateNext />
                </button>
              </form>
            </div>
          )}

          {wizard?.estadoActual === 'PGD' && (
            <div className="step-content">
              <h2>5. Gestión de Fondos Acumulados</h2>
              <p className="text-muted">¿Tu empresa cuenta con documentación histórica previa que deba ser valorada y ordenada?</p>
              <form onSubmit={handleResponder} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label>¿Tienen archivos o carpetas acumuladas sin clasificar?</label>
                  <select 
                    className="edit-input" 
                    style={{ width: '100%' }} 
                    onChange={e => setRespuestasPaso({...respuestasPaso, tieneFondos: e.target.value})}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="si">Sí, tenemos fondos acumulados</option>
                    <option value="no">No, toda la documentación está al día</option>
                  </select>
                </div>
                {respuestasPaso.tieneFondos === 'si' && (
                  <>
                    <div>
                      <label>Volumen aproximado (en metros lineales o cajas/carpetas)</label>
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ width: '100%' }} 
                        placeholder="Ej: 15 cajas, 50 carpetas o 5 metros lineales"
                        onChange={e => setRespuestasPaso({...respuestasPaso, volumen: e.target.value})} 
                        required
                      />
                    </div>
                    <div>
                      <label>Plan de Ordenación y Valoración Documental (Breve descripción)</label>
                      <textarea 
                        className="edit-input" 
                        style={{ width: '100%', minHeight: '80px' }} 
                        placeholder="Ej: Se realizará inventario preliminar FUID y valoración histórica para definir Tabla de Valoración Documental..."
                        onChange={e => setRespuestasPaso({...respuestasPaso, planOrdenacion: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={submitting}>
                  Guardar y Finalizar Implementación <MdCheckCircle />
                </button>
              </form>
            </div>
          )}

          {wizard?.estadoActual === 'COMPLETO' && (
            <div className="step-content" style={{ textAlign: 'center', padding: '20px' }}>
              <MdCheckCircle size={60} color="#2ecc71" />
              <h2 style={{ marginTop: '20px' }}>¡Implementación Archivística Exitosa!</h2>
              <p>Has completado todas las fases requeridas por la normativa. Ahora puedes descargar tu dossier archivístico.</p>
              
              <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '40px auto 0 auto' }}>
                <button className="btn btn-secondary" onClick={() => handleDownloadDoc('ACTA_COMITE')}>
                  <MdFileDownload /> Acta de Constitución del Comité
                </button>
                <button className="btn btn-secondary" onClick={() => handleDownloadDoc('POLITICA')}>
                  <MdFileDownload /> Política de Gestión Documental
                </button>
                <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
                  Ir al Dashboard Operativo <MdPlayArrow />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar informativo */}
        <aside style={{ marginTop: '40px' }}>
          <div className="card" style={{ padding: '20px', background: '#f8f9fa' }}>
            <h3><MdInfo color="var(--primary-color)" /> Nota Normativa</h3>
            <p className="small text-muted" style={{ marginTop: '10px' }}>
              Este asistente genera borradores basados en el Decreto 1080 de 2015 y las guías del Archivo General de la Nación. 
              Es responsabilidad del Comité de Archivo revisar y formalizar estos documentos con sus firmas originales.
            </p>
          </div>
        </aside>
      </div>
    </PortalLayout>
  );
}
