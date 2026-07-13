export interface AuthResponse {
  body: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
export interface AuthResponseError {
  body: {
    error: string;
  };
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  username: string;
  nombre?: string;
  email?: string;
}

export interface Empresa {
  id: string;
  razonSocial: string;
  nit: string;
  logo?: string;
  isPersonal: boolean;
  rol: string;
  estado: string;
  direccion?: string;
  tipoPersona: 'natural' | 'juridica';
  nombreComercial?: string;
  sigla?: string;
  onboardingCompleted?: boolean;
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  tipoDocumentoId: string;
  numeroDocumentoId?: string;
  digitoVerificacion?: string;
  ciudad?: string;
  departamento?: string;
  telefono?: string;
  correo?: string;
  sitioWeb?: string;
  logoAlturaMm?: number;
  logoAnchoMm?: number;
  configuracion?: {
    tipografia: string;
    colores: {
      primario: string;
      secundario: string;
    };
    margenesDefecto: {
      top: string;
      bottom: string;
      left: string;
      right: string;
    };
  };
}

export interface Dependencia {
  id: string;
  codigoDependencia: string;
  nombreDependencia: string;
  dependenciaPadreId?: string;
  esJuntaDirectiva: boolean;
  estado: 'activo' | 'inactivo';
  jefeDependenciaId?: string;
}

export interface SerieDocumental {
  id: string;
  codigoSerie: string;
  nombreSerie: string;
  tiempoRetencionGestion?: number;
  tiempoRetencionCentral?: number;
  disposicionFinal?: 'Conservación Total' | 'Eliminación' | 'Selección' | 'Medio Técnico';
  origen: 'BANTER' | 'manual';
}

export interface SubserieDocumental {
  id: string;
  serieId: string | SerieDocumental;
  codigoSubserie: string;
  nombreSubserie: string;
  tiempoRetencionGestion?: number;
  tiempoRetencionCentral?: number;
  disposicionFinal?: 'Conservación Total' | 'Eliminación' | 'Selección' | 'Medio Técnico';
}

export interface TRD {
  id: string;
  dependenciaId: string | Dependencia;
  subserieId: string | SubserieDocumental;
  codigoTRD: string;
  estado: 'vigente' | 'obsoleto';
}

export interface Expediente {
  id: string;
  nombreExpediente: string;
  codigoTRD: string;
  dependenciaId: Dependencia;
  subserieId: SubserieDocumental;
  descripcion?: string;
  estado: 'ABIERTO' | 'CERRADO';
  ubicacion: 'GESTION' | 'CENTRAL' | 'HISTORICO' | 'ELIMINADO';
  fechaApertura: string;
  fechaCierre?: string;
  indiceXml?: string;
  responsableId?: string;
  ubicacionFisica?: {
    seccion?: string;
    bloque?: string;
    estante?: string;
    peldano?: string;
    caja?: string;
    carpeta?: string;
  };
}

export interface Transferencia {
  id: string;
  tipoTransferencia: 'PRIMARIA' | 'SECUNDARIA';
  expedientes: string[] | Expediente[];
  estado: 'BORRADOR' | 'FINALIZADA';
  fechaTransferencia: string;
  observaciones?: string;
  numeroActa?: string;
  createdAt: string;
}

export interface ActaEliminacion {
  id: string;
  numeroActa: string;
  usuarioResponsableId: string | User;
  expedientesEliminados: Array<{
    expedienteId: string;
    nombreExpediente: string;
    codigoTRD: string;
    fechaApertura: string;
    fechaCierre: string;
  }>;
  fechaEliminacion: string;
  justificacion: string;
  estado: 'BORRADOR' | 'APROBADA';
  createdAt: string;
}

export interface TareaChecklist {
  titulo: string;
  moduloDestino: string;
  completada: boolean;
}

export interface OnboardingWizard {
  id: string;
  estadoActual: 'INICIO' | 'DIAGNOSTICO_MGDA' | 'COMITE_ARCHIVO' | 'POLITICA_DOCUMENTAL' | 'PGD' | 'COMPLETO';
  pasoActual: number;
  respuestas: Record<string, any>;
  documentosGenerados: Array<{
    tipo: string;
    documentoId: string;
    fechaGeneracion: string;
  }>;
  tareasChecklist: TareaChecklist[];
  progreso: number;
}

export interface HistorialDocumento {
  id: string;
  plantillaId: { nombre: string };
  datosUsados: any;
  usuarioId: { name: string };
  fechaGeneracion: string;
  hashIntegridad: string;
  numeroRadicado?: string;
  expedienteId?: string;
  codigoTRD?: string;
  tipoArchivo: 'PDF' | 'DOCX';
  createdAt: string;
}

export interface AccessTokenResponse {
  statusCode: number;
  body: {
    accessToken: string;
  };
  error?: string;
}

export interface Entidad {
  id: string;
  tipo: 'NATURAL' | 'JURIDICA';
  numeroIdentificacion: string;
  nombre: string;
  apellidos?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  ciudad?: string;
  departamento?: string;
  empresaId: string;
  activa: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FondoAcumulado {
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

export interface IntervencionFondo {
  empresaId: string;
  faseActual: number;
  checklist: Record<string, boolean>;
  contingencias: Record<string, any>;
  documentosGenerados: Array<{
    tipo: string;
    documentoId: string;
    fecha: string;
  }>;
  progreso: number;
}

export interface MiembroComite {
  id?: string;
  usuarioId: string | { id: string; nombre: string; email: string; _id?: string };
  cargo: string;
  rolComite: 'Presidente' | 'Secretario Técnico' | 'Miembro Vocal' | 'Invitado';
}

export interface ComiteArchivo {
  id?: string;
  nombre: string;
  descripcion?: string;
  miembros: MiembroComite[];
  fechaCreacion?: string;
  estado: 'activo' | 'inactivo';
}

export interface CompromisoActa {
  descripcion: string;
  responsableId?: string | { id: string; nombre: string; email: string; _id?: string };
  fechaLimite?: string;
}

export interface ActaComite {
  id?: string;
  _id?: string;
  comiteId: string | ComiteArchivo;
  numeroActa: string;
  fechaReunion: string;
  temasTratados: string[];
  desarrollo: string;
  compromisos?: CompromisoActa[];
  anexo?: {
    docRefId?: string;
    url?: string;
  };
  tipo: 'CONSTITUCION' | 'ORDINARIA' | 'EXTRAORDINARIA';
  estado: 'borrador' | 'aprobada' | 'anulada';
  createdAt?: string;
}

export interface SerieTVD {
  codigo: string;
  nombre: string;
  retencionCentral: number;
  disposicionFinal: 'CT' | 'E' | 'M' | 'S'; // CT: Conservación Total, E: Eliminación, M: Microfilmación/Digitalización, S: Selección
  procedimiento: string;
}

export interface TablaValoracionDocumental {
  id?: string;
  _id?: string;
  version: string;
  nombre: string;
  descripcion?: string;
  series: SerieTVD[];
  actaAprobacionId?: string | null;
  estado: 'borrador' | 'en_revision' | 'aprobada' | 'obsoleta';
  createdAt?: string;
}

export interface RiesgoDeposito {
  id?: string;
  _id?: string;
  codigoRiesgo: string;
  descripcion: string;
  probabilidad: number;
  impacto: number;
  nivelRiesgo?: number;
  controles?: string;
  estado: 'activo' | 'mitigado' | 'materializado';
}

export interface MatrizRiesgosDeposito {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion?: string;
  riesgos: RiesgoDeposito[];
  createdAt?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  body: T & { error?: string };
}

export interface SignOutResponse {
  success: boolean;
}

export interface MisEmpresasResponse {
  empresas: Empresa[];
}

export interface AuditLog {
  _id: string;
  accion: string;
  tipoRecurso?: string;
  recursoId?: string;
  usuario: {
    name: string;
    username: string;
  };
  detalles: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  fecha: string;
}

export interface AuditStats {
  totalEventos: number;
  ultimas24h: number;
  accionesTop: Array<{ _id: string; count: number }>;
}

export interface AuditTimelineItem {
  fecha: string;
  accion: string;
  numero?: number;
  usuario: string;
  ip?: string;
  comentario?: string;
  tipo?: string;
}

export interface AuditVerifyResponse {
  hashRegistrado: string;
  fechaEmision: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
}



