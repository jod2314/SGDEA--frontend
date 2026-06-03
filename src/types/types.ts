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
  name: string;
  username: string;
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

export interface OnboardingWizard {
  id: string;
  estadoActual: 'INICIO' | 'DIAGNOSTICO_MGDA' | 'COMITE_ARCHIVO' | 'POLITICA_DOCUMENTAL' | 'PGD' | 'COMPLETO';
  respuestas: {
    diagnostico?: any;
    comite?: any;
    politica?: any;
    pgd?: any;
  };
  documentosGenerados: Array<{
    tipo: string;
    documentoId: string;
    fechaGeneracion: string;
  }>;
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
