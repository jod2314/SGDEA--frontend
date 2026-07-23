export interface InsumosCalculados {
  metrosLineales: number;
  almacenamiento: {
    cajasX200: number;
    carpetas4Aletas: number;
    rollosCintaAlgodon: number;
  };
  bioseguridadEPP: {
    tapabocasN95Unidades: number;
    cajasGuantesNitrilo100: number;
    batasTyvek: number;
    lapicesHB: number;
  };
}

export interface MuestraDIACalculada {
  poblacionTotalN: number;
  margenErrorUsado: number;
  nivelConfianzaZ: number;
  muestraRequeridaCarpetasn: number;
}

export interface DiagnosticoDIAData {
  _id?: string;
  poblacionTotalCarpetas: number;
  margenError: number;
  nivelConfianza: number;
  muestraCalculada: number;
  medicionVolumetrica: {
    metrosLinealesPapel: number;
    almacenamientoDigitalGB: number;
    estanteriasCantidad: number;
    estanteriasSaturacionPorcentaje: number;
  };
  indicadoresSIC: {
    porcentajeOxidacionTintas: number;
    porcentajeDeterioroBiologico: number;
    porcentajeDeformacionFisica: number;
  };
  lecturasAmbientales: {
    temperaturaPromedio: number;
    humedadRelativaPromedio: number;
    iluminacionLuxes: number;
    presenciaPlagasActivas: boolean;
  };
  dofa?: {
    debilidades: string[];
    oportunidades: string[];
    fortalezas: string[];
    amenazas: string[];
  };
  estado: "BORRADOR" | "EN_EVALUACION" | "FINALIZADO";
}

export interface CEOFData {
  _id?: string;
  cuestionarioHistoria: {
    fechaCreacionEntidad?: string;
    actoAdministrativoCreacion?: string;
    entidadesPredecesoras?: string[];
    cambiosEstructuralesHistoricos?: string;
    soporteLegalAdjuntoUrl?: string;
  };
  periodosHistoricos: Array<{
    nombrePeriodo: string;
    fechaInicial: string;
    fechaFinal?: string;
    dependenciasHistoricas: Array<{
      codigo: string;
      nombre: string;
      funcionesAsignadas: string[];
      oficinaProductora: boolean;
    }>;
  }>;
  estado: "EN_REVISION" | "APROBADO";
}
