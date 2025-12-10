import { IInvitadoToEventoPayload } from 'src/app/core/interfaces/models/evento.dto';

export interface IHabitacion {
  id: number;
  nombre: string;
  descripcion: string;
  capacidadMaxima: number;
  capacidadMinima: number;
  actual: number;
  invitados: IInvitado[];
}

export interface IDroppedItem {
  originType: string;
  originId: string;
  originItemId: IInvitado;
  destinationType: string;
  destinationId: string;
  confirmedOverCapacity: boolean;
  //destinationItemId: string;
}

export interface IOcupationDateEvent {
  habitacionId: number;
  tipoHabitacionId: number;
  unidadNegocioId: number;
  fechaOcupacionInicio: Date | null;
  fechaOcupacionFin: Date | null;
}

export interface GrupoData {
  id: number;
  nombre: string;
  invitados: number;
}

export interface TreeNode {
  id: number;
  name: string;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface FlatNode {
  id: number;
  expandable: boolean;
  name: string;
  level: number;
  disabled: boolean;
}

export interface ItemDataGrid {
  id: string;
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
  disponibles: number;
  minimo: number;
  maximo: number;
  reserva: number;
}

export interface ItemMesaDataGrid {
  id: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  disponibles: number;
  maximo: number;
  reserva: number;
}

export interface ITipoHabitacion {
  id: string;
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
  minimo: number;
  maximo: number;
  actual: number;
}

export interface IInvitado {
  id?: number;
  nombre: string;
  edad: string;
  habitacion?: string;
  mesa?: string;
  grupoId: number;
  unidadNegocioId: number;
  filialId: number;
}

export interface IDistribucionMesasPayload {
  id: number;
  eventoId: number;
  grupoId: number;
  unidadNegocioId: number;
  tipoMesaId: number;
  proporcion: number;
  cantidad: number;
  tipoMesa: ITipoMesa;
  grupo: INombreData;
  unidadNegocio: INombreData;
}

export interface IDistribucionHabitacionesPayload {
  id: number;
  eventoId: number;
  grupoId: number;
  unidadNegocioId: number;
  tipoHabitacionId: number;
  proporcion: number;
  cantidad: number;
  tipoHabitacion: ITipoHabitacion;
  grupo: INombreData;
  unidadNegocio: INombreData;
}

export interface INombreData {
  nombre: string;
}

export interface ITipoMesa {
  tipo: string;
  descripcion: string;
}

export interface ITipoHabitacion {
  tipoHabitacion: string;
  descripcion: string;
}

export interface ResumenHabitacionesPayload {
  tipoHabitacionId?: number;
  tipoHabitacion?: string;
  grupoId?: number;
  nombreGrupo?: string;
  totalHabitaciones?: number;
  totalHabitacionesDisponibles?: number;
}

export interface ResumenMesasPayload {
  tipoMesaId?: number;
  tipoMesa?: string;
  grupoId?: number;
  nombreGrupo?: string;
  totalMesas?: number;
  totalMesasDisponibles?: number;
}
