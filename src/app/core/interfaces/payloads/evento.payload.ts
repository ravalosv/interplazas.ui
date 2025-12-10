export interface EventoPayload {
  id: number;
  nombre: string;
  fechaLimite: Date;
  fechaInicio: Date;
  fechaFin: Date;
  capacidadMaxima: number;
  tipoFormulario: string;
  eventoStatusId: number;
  createdByUserId: number;
  incluyeHabitaciones: boolean;
  incluyeMesas: boolean;
  distribucionMesasFile: string;
  archivoCuentaUniqueId: string | null;
  eventoStatus: {
    id: number;
    nombre: string;
  };
  grupos: grupoEvento[];
  filiales: [
    {
      filialId: number;
      filial: {
        nombre: string;
      };
    }
  ];
  gruposFiliales: GrupoFilial[];
}

export interface GrupoFilial {
  id: number;
  nombre: string;
  unidadesNegocio: UnidadNegocio[];
}

export interface UnidadNegocio {
  id: number;
  nombre: string;
  filiales: Filial[];
}

export interface Filial {
  id: number;
  nombre: string;
}

export interface grupoEvento {
  id: number;
  grupoId: number;
  invitados: number;
  actuales: number;
  grupo: {
    nombre: string;
  };
}

export interface ValidacionAperturaEventoPayload {
  contieneHabitaciones: boolean;
  habitacionesDistribuidas: boolean;
  contieneMesas: boolean;
  mesasDistribuidas: boolean;
  valido: boolean;
}
