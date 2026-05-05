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
}

export interface TRD {
  id: string;
  dependenciaId: string | Dependencia;
  subserieId: string | SubserieDocumental;
  codigoTRD: string;
  estado: 'vigente' | 'obsoleto';
}

export interface AccessTokenResponse {
  statusCode: number;
  body: {
    accessToken: string;
  };
  error?: string;
}
