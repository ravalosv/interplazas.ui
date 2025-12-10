export interface GrupoPayload {
  id: number;
  nombre: string;
  UnidadNegocios: UnidadNegocioPayload[];
}

export interface UnidadNegocioPayload {
  id: number;
  nombre: string;
  Filiales: FilialPayload[];
}

export interface FilialPayload {
  id: number;
  nombre: string;
}

export interface IEventoGrupoPayload {
  id: number;
  eventoId: number;
  grupoId: number;
  invitados: number;
  actuales: number;
  proporcion: number;
  grupo?: GrupoPayload;
  unidadesNegocio?: IEventoUnidadNegocioPayload[];
}

export interface IEventoUnidadNegocioPayload {
  id: number;
  nombre: string;
  grupoId: number;
  unidadNegocioId?: number;
  invitados: number;
  actuales: number;
  proporcion: number;
  unidadNegocio?: UnidadNegocioPayload;
}
