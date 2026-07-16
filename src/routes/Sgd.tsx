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
  const [nuevoDocNivel, setNuevoDocNivel] = useState<'PUBLICO' | 'RESTRINGIDO' | 'CONFIDENCIAL'>('PUBLICO');
  const [nuevoDocSoporte, setNuevoDocSoporte] = useState<'FISICO' | 'DIGITAL' | 'ELECTRONICO'>('ELECTRONICO');
  const [nuevoDocHash, setNuevoDocHash] = useState('');
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

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const cumpleBuscar = filtroBuscar === '' || 
      doc.codigoClasificacion.toLowerCase().includes(filtroBuscar.toLowerCase()) ||
      doc.tipoDocumental.toLowerCase().includes(filtroBuscar.toLowerCase()) ||
      JSON.stringify(doc.metadatosExtendidos).toLowerCase().includes(filtroBuscar.toLowerCase());
    
    const cumpleTipo = filtroTipo === '' || doc.tipoDocumental === filtroTipo;

    return cumpleBuscar && cumpleTipo;
  });

  // Al cambiar tipo documental seleccionado en registro
  const handleTipoDocChange = (nombre: string) => {
    setNuevoDocTipo(nombre);
    setMetadatosExtendidos({});
    setErroresExtendidos({});
    
    const config = tipos.find(t => t.nombre === nombre);
    if (config) {
      setNuevoDocClasificacion(config.codigoClasificacionDefault);
    }
  };

  // Crear Tipo Documental (Test del Salto)
  const handleCrearTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTipo(true);
    setMsgTipo({ type: '', text: '' });

    try {
      let parsedSchema;
      try {
        parsedSchema = JSON.parse(nuevoTipoSchemaRaw);
      } catch (err: any) {
        setMsgTipo({ type: 'error', text: 'El JSON Schema no tiene un formato válido: ' + err.message });
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
      // Simular cálculo de hash simple si no se provee
      const hash = nuevoDocHash || 'a' + Math.random().toString(16).substring(2, 10) + 'f' + '8f438a2e1d7a3152d1b09b1f7e0258bb27e8a93e3d93ca49b934ca49b934ca49'.substring(10);

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
        // Limpiar
        setNuevoDocTipo('');
        setNuevoDocClasificacion('');
        setNuevoDocHash('');
        setMetadatosExtendidos({});
        setErroresExtendidos({});
        cargarDatos();
        setTimeout(() => setActiveTab('documentos'), 1500);
      } else {
        // Mapear errores de validación
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
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto text-slate-100">
        
        {/* Encabezado Premium */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              Gestión Documental Corporativa
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ecosistema SGD Polimórfico - Prototipo Fundacional Multi-tenant
            </p>
          </div>
          <button
            onClick={cargarDatos}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <MdRefresh className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2 border-b border-slate-700/40 pb-px">
          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'documentos'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <MdInsertDriveFile className="w-4 h-4" />
              Documentos Registrados
            </span>
          </button>
          <button
            onClick={() => setActiveTab('registro')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'registro'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <MdPlaylistAdd className="w-4 h-4" />
              Radicar Documento (SGD)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tipos')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'tipos'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <MdCode className="w-4 h-4" />
              Configurar Tipos (Salto en Caliente)
            </span>
          </button>
        </div>

        {/* Contenido de Pestañas */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
          </div>
        ) : (
          <>
            {/* PESTAÑA: LISTADO DE DOCUMENTOS */}
            {activeTab === 'documentos' && (
              <div className="flex flex-col gap-4">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl">
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                    <MdSearch className="text-slate-400 mr-2 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por código, tipo o asunto..."
                      value={filtroBuscar}
                      onChange={(e) => setFiltroBuscar(e.target.value)}
                      className="bg-transparent w-full text-slate-200 focus:outline-none"
                    />
                  </div>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="">Todos los tipos documentales</option>
                    {tipos.map(t => (
                      <option key={t._id} value={t.nombre}>{t.nombre}</option>
                    ))}
                  </select>
                  <div className="flex items-center justify-end text-xs text-slate-400">
                    Mostrando {documentosFiltrados.length} documentos
                  </div>
                </div>

                {/* Tabla de Documentos */}
                {documentosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-slate-800/10 border border-slate-800 rounded-xl text-slate-500">
                    <MdInfoOutline className="w-12 h-12 mb-2" />
                    <p className="text-sm">No se encontraron documentos en la base de datos.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-700/50 rounded-xl bg-slate-850">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/50 text-xs font-semibold text-sky-400 uppercase border-b border-slate-700">
                          <th className="px-4 py-3">Código Clasificación</th>
                          <th className="px-4 py-3">Tipo Documental</th>
                          <th className="px-4 py-3">Soporte</th>
                          <th className="px-4 py-3">Acceso</th>
                          <th className="px-4 py-3">Vigencia (G / C)</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                        {documentosFiltrados.map((doc) => (
                          <React.Fragment key={doc._id}>
                            <tr className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-mono font-bold text-slate-100 flex items-center gap-1.5">
                                <MdFolder className="text-sky-400 w-4 h-4" />
                                {doc.codigoClasificacion}
                              </td>
                              <td className="px-4 py-3 font-semibold">{doc.tipoDocumental}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  doc.soporte === 'ELECTRONICO' ? 'bg-sky-500/15 text-sky-400' : 'bg-amber-500/15 text-amber-400'
                                }`}>
                                  {doc.soporte}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  doc.nivelAcceso === 'PUBLICO' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                                }`}>
                                  {doc.nivelAcceso}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400">
                                {doc.vigencia.gestionAnios} años / {doc.vigencia.centralAnios} años
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => setDocExpandido(docExpandido === doc._id ? null : doc._id)}
                                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                  {docExpandido === doc._id ? 'Ocultar Metadatos' : 'Ver Metadatos'}
                                </button>
                              </td>
                            </tr>
                            
                            {/* Desglose de Metadatos Extendidos */}
                            {docExpandido === doc._id && (
                              <tr className="bg-slate-900/60">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-xs font-bold text-sky-400 border-b border-slate-700/60 pb-1.5 mb-2">
                                        Metadatos Extendidos (Polimórficos)
                                      </h4>
                                      {Object.keys(doc.metadatosExtendidos || {}).length === 0 ? (
                                        <p className="text-xs text-slate-500">Sin metadatos específicos.</p>
                                      ) : (
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          {Object.entries(doc.metadatosExtendidos).map(([k, v]) => (
                                            <div key={k} className="flex flex-col bg-slate-900/40 p-2 rounded border border-slate-800">
                                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{k}</span>
                                              <span className="text-slate-200 mt-0.5">{String(v)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col justify-between border-l border-slate-800 pl-4">
                                      <div>
                                        <h4 className="text-xs font-bold text-slate-400 border-b border-slate-700/60 pb-1.5 mb-2">
                                          Huella Criptográfica e Integridad
                                        </h4>
                                        <div className="flex flex-col bg-slate-900/40 p-2 rounded border border-slate-800">
                                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">SHA-256</span>
                                          <span className="text-[10px] font-mono text-slate-300 mt-0.5 break-all">
                                            {doc.hashIntegridad}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-[10px] text-slate-500 mt-2">
                                        Creado el: {new Date(doc.fechaCreacion).toLocaleString('es-CO')}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA: RADICACIÓN DE DOCUMENTOS (FORMULARIO DINÁMICO) */}
            {activeTab === 'registro' && (
              <form onSubmit={handleRegistrarDocumento} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 flex flex-col gap-6 max-w-3xl mx-auto">
                <div className="border-b border-slate-700/60 pb-2">
                  <h2 className="text-base font-bold text-sky-400">Radicar Documento en el SGD</h2>
                  <p className="text-xs text-slate-400">Los campos se inyectarán de forma dinámica en base al tipo de documento.</p>
                </div>

                {msgDoc.text && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    msgDoc.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {msgDoc.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Tipo de Documento *</label>
                    <select
                      value={nuevoDocTipo}
                      onChange={(e) => handleTipoDocChange(e.target.value)}
                      required
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="">-- Seleccionar --</option>
                      {tipos.map(t => (
                        <option key={t._id} value={t.nombre}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Código de Clasificación</label>
                    <input
                      type="text"
                      placeholder="Ej. 1000-1100-001"
                      value={nuevoDocClasificacion}
                      onChange={(e) => setNuevoDocClasificacion(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Nivel de Acceso</label>
                    <select
                      value={nuevoDocNivel}
                      onChange={(e: any) => setNuevoDocNivel(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="PUBLICO">Público</option>
                      <option value="RESTRINGIDO">Restringido</option>
                      <option value="CONFIDENCIAL">Confidencial</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Soporte Original</label>
                    <select
                      value={nuevoDocSoporte}
                      onChange={(e: any) => setNuevoDocSoporte(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="ELECTRONICO">Electrónico</option>
                      <option value="DIGITAL">Digitalizado</option>
                      <option value="FISICO">Físico</option>
                    </select>
                  </div>

                  <div className="col-span-full flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Hash SHA-256 (Opcional - Simulado si se omite)</label>
                    <input
                      type="text"
                      placeholder="64 caracteres hexadecimales"
                      value={nuevoDocHash}
                      onChange={(e) => setNuevoDocHash(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Formulario Dinámico de Metadatos Extendidos */}
                {nuevoDocTipo && (
                  <FormularioDinamico
                    schema={schemaSeleccionado}
                    values={metadatosExtendidos}
                    onChange={(key, val) => setMetadatosExtendidos({ ...metadatosExtendidos, [key]: val })}
                    errors={erroresExtendidos}
                  />
                )}

                <button
                  type="submit"
                  disabled={submittingDoc || !nuevoDocTipo}
                  className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <MdSave className="w-5 h-5" />
                  {submittingDoc ? 'Validando y Guardando...' : 'Radicar Documento'}
                </button>
              </form>
            )}

            {/* PESTAÑA: CONFIGURACIÓN DE TIPOS DOCUMENTALES (TEST DEL SALTO) */}
            {activeTab === 'tipos' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {/* Formulario de Registro de Tipo Documental */}
                <form onSubmit={handleCrearTipo} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 flex flex-col gap-4">
                  <div className="border-b border-slate-700/60 pb-2">
                    <h2 className="text-base font-bold text-sky-400">Crear Tipo Documental en Caliente</h2>
                    <p className="text-xs text-slate-400">Inyecta un JSON Schema para crear un formulario dinámico y hacerlo funcionar en producción inmediatamente.</p>
                  </div>

                  {msgTipo.text && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${
                      msgTipo.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>
                      {msgTipo.text}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-semibold text-slate-300">Nombre del Tipo Documental *</label>
                      <input
                        type="text"
                        placeholder="Ej. HISTORIA_LABORAL"
                        value={nuevoTipoNombre}
                        onChange={(e) => setNuevoTipoNombre(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                        required
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-semibold text-slate-300">Código Clasificación Default *</label>
                      <input
                        type="text"
                        placeholder="Ej. 5000-5100-001"
                        value={nuevoTipoClasificacion}
                        onChange={(e) => setNuevoTipoClasificacion(e.target.value)}
                        required
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Años Retención Gestión *</label>
                      <input
                        type="number"
                        min={0}
                        value={nuevoTipoGestion}
                        onChange={(e) => setNuevoTipoGestion(Number(e.target.value))}
                        required
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-300">Años Retención Central *</label>
                      <input
                        type="number"
                        min={0}
                        value={nuevoTipoCentral}
                        onChange={(e) => setNuevoTipoCentral(Number(e.target.value))}
                        required
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">JSON Schema de Campos Extendidos *</label>
                    <textarea
                      rows={8}
                      value={nuevoTipoSchemaRaw}
                      onChange={(e) => setNuevoTipoSchemaRaw(e.target.value)}
                      required
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTipo}
                    className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors flex items-center justify-center gap-1.5 mt-2"
                  >
                    <MdSave className="w-5 h-5" />
                    {submittingTipo ? 'Guardando Configuración...' : 'Configurar en Caliente'}
                  </button>
                </form>

                {/* Listado de configuraciones cargadas */}
                <div className="flex flex-col gap-4 border border-slate-700/50 rounded-xl bg-slate-800/10 p-6">
                  <div className="border-b border-slate-700/60 pb-2">
                    <h2 className="text-base font-bold text-slate-300">Tipos Documentales Activos</h2>
                    <p className="text-xs text-slate-500">Esquemas en caliente registrados para el SGD de este Tenant.</p>
                  </div>

                  {tipos.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin esquemas cargados.</p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
                      {tipos.map(t => (
                        <div key={t._id} className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-sky-400">{t.nombre}</span>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Clasificación: {t.codigoClasificacionDefault}</div>
                            </div>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              {t.gestionAniosDefault + t.centralAniosDefault} años retención total
                            </span>
                          </div>
                          
                          {/* Muestra simplificada de propiedades */}
                          <div className="text-[10px] text-slate-500 font-mono bg-slate-950/40 p-2 rounded border border-slate-900/60 max-h-24 overflow-y-auto">
                            Properties: {Object.keys(t.jsonSchema.properties || {}).join(', ') || 'Ninguna'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}
