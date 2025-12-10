import { IInvitado } from 'src/app/views/pages/admin/events/interfaces/events.interface';

export interface EventoDto {
  id?: number;
  nombre: string;
  tipoFormulario: string;
  fechaLimite: Date;
  fechaInicio: Date;
  fechaFin: Date;
  capacidadMaxima: number;
}

export interface IAddTipoHabitacionDto {
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
  minimo: number;
  maximo: number;
}

export interface IAddTipoMesaDto {
  tipo: string;
  descripcion: string;
  cantidad: number;
  maximo: number;
}

export interface IAddTipoHabitacionPayload {
  id: number;
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
  minimo: number;
  maximo: number;
  reserva: number;
}
export interface IAddTipoMesaPayload {
  id: number;
  tipo: string;
  descripcion: string;
  cantidad: number;
  maximo: number;
  reserva: number;
}

export interface ITipoHabitacionPayload {
  id: number;
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
  disponibles: number;
  minimo: number;
  maximo: number;
  reserva: number;
}

export interface ICountTipoHabitacionPayload {
  id: number;
  tipoHabitacion: string;
  cantidad: number;
  disponibles: number;
}

export interface ICountTipoMesaPayload {
  id: number;
  tipoMesa: string;
  cantidad: number;
  disponibles: number;
}

export interface ITipoMesaPayload {
  id: number;
  tipo: string;
  descripcion: string;
  cantidad: number;
  disponibles: number;
  maximo: number;
  reserva: number;
}

export interface IAddInvitadoToEventoDto {
  eventoId: number;
  grupoId: number;
  unidadNegocioId: number;
  filialId: number;
  nombre: string;
  edad: string;
  tipoInvitado: string;
  fechaIngreso: string | null;
  requiereTransporte: boolean;
  origen: string | null;
  destino: string | null;
  comentarios: string | null;
  participaEnRifa: boolean;
  relacionarConOtroEvento: boolean;
  eventoRelacionadoId: number | null;
  fechaEstanciaInicio: Date | null;
  fechaEstanciaFin: Date | null;
}

export interface IUpdateInvitadoToEventoDto {
  id: number;
  eventoId: number;
  grupoId: number;
  unidadNegocioId: number;
  filialId: number;
  nombre: string;
  edad: string;
  tipoInvitado: string;
  fechaIngreso: string | null;
  requiereTransporte: boolean;
  origen: string | null;
  destino: string | null;
  comentarios: string | null;
  participaEnRifa: boolean;
  relacionarConOtroEvento: boolean;
  eventoRelacionadoId: number | null;
  fechaEstanciaInicio: Date | null;
  fechaEstanciaFin: Date | null;
}

export interface IInvitadoToEventoPayload {
  id: number;
  eventoId: number;
  grupoId: number;
  Grupo: any;
  unidadNegocioId: number;
  UnidadNegocio: any;
  filialId: number;
  Filial: any;
  nombre: string;

  edad: string;
  tipoInvitado: string;
  fechaIngreso: string | null;

  requiereTransporte: boolean;
  origen: string | null;
  destino: string | null;
  comentarios: string | null;
  participaEnRifa: boolean;
  creditoSolarum: boolean;
  requiereHospedaje: boolean;
  relacionarConOtroEvento: boolean;
  eventoRelacionadoId: number | null;
  fechaEstanciaInicio: Date | null;
  fechaEstanciaFin: Date | null;
  fechaHospedajeInicio: Date | null;
  fechaHospedajeFin: Date | null;
  tipoHabitacionGrupoId: number | null;
  tipoMesaGrupoId: number | null;
}

export interface ITipoHabitacionXGrupoPayload {
  id: number;
  eventoId: number;
  grupoId: number;
  tipoHabitacionId: number;
  numero: number;
  minimo: number;
  maximo: number;
  actual: number;
  fechaOcupacionInicio: Date | null;
  fechaOcupacionFin: Date | null;
  tipoHabitacion: ITipoHabitacionPayload;
  unidadNegocioId: number;
  invitados: IInvitado[];
}

export interface ITipoMesaXGrupoPayload {
  id: number;
  eventoId: number;
  grupoId: number;
  tipoMesaId: number;
  numero: number;
  maximo: number;
  actual: number;
  tipoMesa: ITipoMesaPayload;
  unidadNegocioId: number;
  invitados: IInvitado[];
}

export interface IAddInvitadoToEventPayload {
  grupoId: number;
  actualesPorGrupo: number;
  maximoPorGrupo: number;
  unidadNegocioId: number;
  actualesPorUnidad: number;
  maximoPorUnidad: number;
}

export interface ITrackingPayload {
  id: number;
  eventoId: number;
  invitadoId: number;
  invitadoNombre: string;
  accionId: number;
  detalles: string;
  accion_desc: string;
  createdAt: Date;
  createdByUserId: number;
  accion: IAccion;
  usuario: IUsuario;
}

export interface IAccion {
  nombre: string;
}

export interface IUsuario {
  name: string;
}

export interface IResumenPorEdad {
  nombre?: string;
  edad?: Edad;
  count?: number;
}

export type Edad = 'Adulto' | 'JR' | 'Menor' | 'Infante';

export interface IResumedTrackingPayload {
  id?: number;
  eventoId?: number;
  invitadoId?: number;
  invitadoNombre?: string;
  accionId?: number;
  detalles?: string;
  accion_desc?: string;
  createdAt: Date;
  createdByUserId?: number;
  accion?: IResumedTrackingAccionPayload;
}

export interface IResumedTrackingAccionPayload {
  nombre?: string;
}
