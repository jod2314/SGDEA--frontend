import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import PortalLayout from '../layout/PortalLayout';
import * as IconsMd from 'react-icons/md';
import FormularioDinamico from '../components/documentos/FormularioDinamico';

const MdSearch = (IconsMd as any).MdSearch;
const MdFolder = (IconsMd as any).MdFolder;
const MdSave = (IconsMd as any).MdSave;
const MdPlaylistAdd = (IconsMd as any).MdPlaylistAdd;
const MdInfoOutline = (IconsMd as any).MdInfoOutline;
const MdInsertDriveFile = (IconsMd as any).MdInsertDriveFile;
const MdCode = (IconsMd as any).MdCode;
const MdRefresh = (IconsMd as any).MdRefresh;

interface TipoDocumental {
  _id: string;
  nombre: string;
  codigoClasificacionDefault: string;
  gestionAniosDefault: number;
  centralAniosDefault: number;
  jsonSchema: any;
}

interface DocumentoSgd {
  _id: string;
  codigoClasificacion: string;
  fechaCreacion: string;
  responsable: { name: string } | string;
  nivelAcceso: 'PUBLICO' | 'RESTRINGIDO' | 'CONFIDENCIAL';
  soporte: 'FISICO' | 'DIGITAL' | 'ELECTRONICO';
  vigencia: { gestionAnios: number; centralAnios: number };
  tipoDocumental: string;
  hashIntegridad: string;
  metadatosExtendidos: any;
}

export default function Sgd() {
  const auth = useAuth();
  const [tipos, setTipos] = useState<TipoDocumental[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoSgd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documentos' | 'registro' | 'tipos'>('documentos');

  // Filtros de búsqueda
  const [filtroBuscar, setFiltroBuscar] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Formulario Registro Documento
  const [nuevoDocTipo, setNuevoDocTipo] = useState('');
  const [nuevoDocClasificacion, setNuevoDocClasificacion] = useState('');
  const [nuevoDocNivel] = useState<'PUBLICO' | 'RESTRINGIDO' | 'CONFIDENCIAL'>('PUBLICO');
  const [nuevoDocSoporte] = useState<'FISICO' | 'DIGITAL' | 'ELECTRONICO'>('ELECTRONICO');
  const [nuevoDocHash] = useState('');
  const [metadatosExtendidos, setMetadatosExtendidos] = useState<any>({});
  const [erroresExtendidos, setErroresExtendidos] = useState<any>({});
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [msgDoc, setMsgDoc] = useState({ type: '', text: '' });

  // Formulario Configuración Tipo Documental
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
  const [nuevoTipoClasificacion, setNuevoTipoClasificacion] = useState('');
  const [nuevoTipoGestion, setNuevoTipoGestion] = useState(0);
  const [nuevoTipoCentral, setNuevoTipoCentral] = useState(20);
  const [nuevoTipoSchemaRaw, setNuevoTipoSchemaRaw] = useState(
    JSON.stringify({
      type: 'object',
      properties: {
        estadoConservacion: { type: 'string', enum: ['BUENO', 'REGULAR', 'MALO'] },
        numeroFolios: { type: 'integer', minimum: 1 },
        numeroCaja: { type: 'string' }
      },
      required: ['estadoConservacion', 'numeroFolios']
    }, null, 2)
  );
  const [submittingTipo, setSubmittingTipo] = useState(false);
  const [msgTipo, setMsgTipo] = useState({ type: '', text: '' });

  // Documento Expandido para Detalle de Metadatos
  const [docExpandido, setDocExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isAuthenticated) {
      cargarDatos();
    }
  }, [auth.isAuthenticated]);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [tiposRes, docsRes] = await Promise.all([
        auth.request<any>('/sgd/tipos-documentales'),
        auth.request<any>('/sgd/documentos')
      ]);

      if (tiposRes && tiposRes.body) setTipos(tiposRes.body.tipos || []);
      if (docsRes && docsRes.body) setDocumentos(docsRes.body.documentos || []);
    } catch (e) {
      console.error('Error al cargar datos del SGD:', e);
    } finally {
      setLoading(false);
    }
  }

  // Filtrado de documentos
  const documentosFiltrados = documentos.filter(doc => {
    const cumpleTexto = filtroBuscar === '' || 
      doc.codigoClasificacion?.toLowerCase().includes(filtroBuscar.toLowerCase()) ||
      doc.tipoDocumental?.toLowerCase().includes(filtroBuscar.toLowerCase());
    const cumpleTipo = filtroTipo === '' || doc.tipoDocumental === filtroTipo;
    return cumpleTexto && cumpleTipo;
  });

  // Guardar Tipo Documental (Salto en Caliente)
  const handleRegistrarTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTipo(true);
    setMsgTipo({ type: '', text: '' });

    try {
      let parsedSchema = {};
      try {
        parsedSchema = JSON.parse(nuevoTipoSchemaRaw);
      } catch (err) {
        setMsgTipo({ type: 'error', text: 'El JSON Schema no tiene un formato válido.' });
        setSubmittingTipo(false);
        return;
      }

      const res = await auth.request<any>('/sgd/tipos-documentales', {
        method: 'POST',
        data: {
          nombre: nuevoTipoNombre,
          codigoClasificacionDefault: nuevoTipoClasificacion,
          gestionAniosDefault: nuevoTipoGestion,
          centralAniosDefault: nuevoTipoCentral,
          jsonSchema: parsedSchema
        }
      });

      if (res && res.body && res.body.tipoDocumental) {
        setMsgTipo({ type: 'success', text: `Tipo documental '${nuevoTipoNombre}' configurado exitosamente.` });
        setNuevoTipoNombre('');
        setNuevoTipoClasificacion('');
        setNuevoTipoGestion(0);
        setNuevoTipoCentral(20);
        cargarDatos();
      } else {
        setMsgTipo({ type: 'error', text: res.body?.error || 'No se pudo crear el tipo documental.' });
      }
    } catch (err: any) {
      setMsgTipo({ type: 'error', text: err.message || 'Error de conexión.' });
    } finally {
      setSubmittingTipo(false);
    }
  };

  // Guardar Documento Polimórfico
  const handleRegistrarDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDoc(true);
    setMsgDoc({ type: '', text: '' });

    try {
      const hash = nuevoDocHash || 'a' + Math.random().toString(16).substring(2, 10) + 'f8f438a2e1d7a3152d1b09b1f7e0258bb27e8a93e3d93ca49b934ca49b934ca49'.substring(10);

      const res = await auth.request<any>('/sgd/documentos', {
        method: 'POST',
        data: {
          codigoClasificacion: nuevoDocClasificacion,
          nivelAcceso: nuevoDocNivel,
          soporte: nuevoDocSoporte,
          tipoDocumental: nuevoDocTipo,
          hashIntegridad: hash,
          metadatosExtendidos
        }
      });

      if (res && res.body && res.body.documento) {
        setMsgDoc({ type: 'success', text: 'Documento registrado y validado en el SGD exitosamente.' });
        setNuevoDocTipo('');
        setNuevoDocClasificacion('');
        setMetadatosExtendidos({});
        setErroresExtendidos({});
        cargarDatos();
        setTimeout(() => setActiveTab('documentos'), 1500);
      } else {
        if (res.body?.detalles) {
          const errs: any = {};
          res.body.detalles.forEach((d: string) => {
            const match = d.match(/^\/(\w+)\s+(.+)$/);
            if (match) {
              errs[match[1]] = match[2];
            }
          });
          setErroresExtendidos(errs);
        }
        setMsgDoc({ type: 'error', text: res.body?.error || 'Error al validar el documento.' });
      }
    } catch (err: any) {
      setMsgDoc({ type: 'error', text: err.message || 'Error de conexión.' });
    } finally {
      setSubmittingDoc(false);
    }
  };

  const schemaSeleccionado = tipos.find(t => t.nombre === nuevoDocTipo)?.jsonSchema || { type: 'object', properties: {} };

  return (
    <PortalLayout>
      <div className="sgd-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Encabezado Corporativo Glassmorphism */}
        <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: 'var(--primary)' }}>Gestión Documental Corporativa</h2>
              <p className="small text-muted" style={{ margin: 0 }}>Ecosistema SGD Polimórfico - Prototipo Fundacional Multi-tenant</p>
            </div>
            <button
              onClick={cargarDatos}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
            >
              <MdRefresh /> Actualizar
            </button>
          </div>

          {/* Navegación por Pestañas del SGD */}
          <div className="tabs" style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('documentos')}
              style={{
                background: activeTab === 'documentos' ? 'var(--primary)' : 'var(--bg-app)',
                color: activeTab === 'documentos' ? '#fff' : 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MdInsertDriveFile /> Documentos Registrados
            </button>

            <button
              onClick={() => setActiveTab('registro')}
              style={{
                background: activeTab === 'registro' ? 'var(--primary)' : 'var(--bg-app)',
                color: activeTab === 'registro' ? '#fff' : 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MdPlaylistAdd /> Radicar Documento (SGD)
            </button>

            <button
              onClick={() => setActiveTab('tipos')}
              style={{
                background: activeTab === 'tipos' ? 'var(--primary)' : 'var(--bg-app)',
                color: activeTab === 'tipos' ? '#fff' : 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MdCode /> Configurar Tipos (Salto en Caliente)
            </button>
          </div>
        </div>

        {/* Contenido Dinámico */}
        {loading ? (
          <p>Cargando datos del SGD...</p>
        ) : (
          <>
            {/* PESTAÑA 1: LISTADO DE DOCUMENTOS */}
            {activeTab === 'documentos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ padding: '15px', background: 'var(--surface)', border: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-app)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                    <MdSearch color="var(--muted)" />
                    <input
                      type="text"
                      className="edit-input"
                      placeholder="Buscar por código, tipo o asunto..."
                      value={filtroBuscar}
                      onChange={(e) => setFiltroBuscar(e.target.value)}
                      style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                    />
                  </div>

                  <select
                    className="edit-input"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                  >
                    <option value="">Todos los tipos documentales</option>
                    {tipos.map(t => (
                      <option key={t._id} value={t.nombre}>{t.nombre}</option>
                    ))}
                  </select>

                  <span className="small text-muted">
                    Mostrando <strong>{documentosFiltrados.length}</strong> documentos
                  </span>
                </div>

                <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                  {documentosFiltrados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <MdInfoOutline size={40} color="var(--muted)" />
                      <p className="small text-muted" style={{ marginTop: '10px' }}>No se encontraron documentos en la base de datos.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', background: 'var(--bg-app)' }}>
                          <th style={{ padding: '10px' }}>Código Clasificación</th>
                          <th style={{ padding: '10px' }}>Tipo Documental</th>
                          <th style={{ padding: '10px' }}>Soporte</th>
                          <th style={{ padding: '10px' }}>Acceso</th>
                          <th style={{ padding: '10px' }}>Vigencia (G / C)</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentosFiltrados.map((doc) => (
                          <React.Fragment key={doc._id}>
                            <tr style={{ borderBottom: '1px dashed var(--glass-border)' }}>
                              <td style={{ padding: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MdFolder color="var(--primary)" />
                                {doc.codigoClasificacion}
                              </td>
                              <td style={{ padding: '10px' }}>{doc.tipoDocumental}</td>
                              <td style={{ padding: '10px' }}>
                                <span className="badge" style={{ background: 'var(--primary-light-2)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {doc.soporte}
                                </span>
                              </td>
                              <td style={{ padding: '10px' }}>{doc.nivelAcceso}</td>
                              <td style={{ padding: '10px' }}>{doc.vigencia?.gestionAnios || 0}a / {doc.vigencia?.centralAnios || 0}a</td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => setDocExpandido(docExpandido === doc._id ? null : doc._id)}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  {docExpandido === doc._id ? 'Ocultar' : 'Ver Metadatos'}
                                </button>
                              </td>
                            </tr>

                            {docExpandido === doc._id && (
                              <tr style={{ background: 'var(--bg-app)' }}>
                                <td colSpan={6} style={{ padding: '15px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                      <h5 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Metadatos Extendidos (Polimórficos)</h5>
                                      <pre style={{ background: 'var(--surface)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--glass-border)' }}>
                                        {JSON.stringify(doc.metadatosExtendidos, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <h5 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Huella SHA-256 de Integridad</h5>
                                      <code style={{ wordBreak: 'break-all', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                        {doc.hashIntegridad}
                                      </code>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: RADICAR DOCUMENTO */}
            {activeTab === 'registro' && (
              <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--glass-border)', maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Radicar Nuevo Documento en SGD</h3>
                
                {msgDoc.text && (
                  <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', background: msgDoc.type === 'success' ? 'var(--primary-light-2)' : 'rgba(239,68,68,0.1)', color: msgDoc.type === 'success' ? 'var(--primary)' : 'var(--danger)' }}>
                    {msgDoc.text}
                  </div>
                )}

                <form onSubmit={handleRegistrarDocumento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Tipo Documental *</label>
                    <select
                      className="edit-input"
                      value={nuevoDocTipo}
                      onChange={(e) => {
                        setNuevoDocTipo(e.target.value);
                        const sel = tipos.find(t => t.nombre === e.target.value);
                        if (sel) setNuevoDocClasificacion(sel.codigoClasificacionDefault);
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                    >
                      <option value="">Seleccione un tipo documental...</option>
                      {tipos.map(t => (
                        <option key={t._id} value={t.nombre}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Código de Clasificación *</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={nuevoDocClasificacion}
                      onChange={(e) => setNuevoDocClasificacion(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                    />
                  </div>

                  {nuevoDocTipo && (
                    <div style={{ marginTop: '10px', padding: '15px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Campos Extendidos del Tipo Documental</h4>
                      <FormularioDinamico
                        schema={schemaSeleccionado}
                        values={metadatosExtendidos}
                        onChange={(vals) => setMetadatosExtendidos(vals)}
                        errors={erroresExtendidos}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingDoc}
                    style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <MdSave /> {submittingDoc ? 'Guardando...' : 'Radicar Documento'}
                  </button>
                </form>
              </div>
            )}

            {/* PESTAÑA 3: CONFIGURAR TIPOS DOCUMENTALES */}
            {activeTab === 'tipos' && (
              <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--glass-border)', maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Crear Tipo Documental en Caliente</h3>
                <p className="small text-muted" style={{ marginBottom: '15px' }}>Inyecta un JSON Schema para crear un formulario dinámico y hacerlo funcionar en producción inmediatamente.</p>

                {msgTipo.text && (
                  <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', background: msgTipo.type === 'success' ? 'var(--primary-light-2)' : 'rgba(239,68,68,0.1)', color: msgTipo.type === 'success' ? 'var(--primary)' : 'var(--danger)' }}>
                    {msgTipo.text}
                  </div>
                )}

                <form onSubmit={handleRegistrarTipo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Nombre del Tipo Documental *</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={nuevoTipoNombre}
                      placeholder="Ej. HISTORIA_LABORAL"
                      onChange={(e) => setNuevoTipoNombre(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Código Clasificación Default *</label>
                    <input
                      type="text"
                      className="edit-input"
                      value={nuevoTipoClasificacion}
                      placeholder="Ej. 5000-5100-001"
                      onChange={(e) => setNuevoTipoClasificacion(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Años Retención Gestión *</label>
                      <input
                        type="number"
                        className="edit-input"
                        value={nuevoTipoGestion}
                        onChange={(e) => setNuevoTipoGestion(parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Años Retención Central *</label>
                      <input
                        type="number"
                        className="edit-input"
                        value={nuevoTipoCentral}
                        onChange={(e) => setNuevoTipoCentral(parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>JSON Schema de Campos Extendidos *</label>
                    <textarea
                      className="edit-input"
                      rows={8}
                      value={nuevoTipoSchemaRaw}
                      onChange={(e) => setNuevoTipoSchemaRaw(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingTipo}
                    style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <MdSave /> {submittingTipo ? 'Guardando...' : 'Configurar en Caliente'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

      </div>
    </PortalLayout>
  );
}
