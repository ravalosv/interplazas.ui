import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { map, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  GrupoPayload,
  IEventoGrupoPayload,
} from '../interfaces/payloads/config.payload';
import {
  EventoDto,
  IAddInvitadoToEventoDto,
  IAddInvitadoToEventPayload,
  IAddTipoHabitacionDto,
  IAddTipoHabitacionPayload,
  IAddTipoMesaDto,
  IAddTipoMesaPayload,
  ICountTipoHabitacionPayload,
  ICountTipoMesaPayload,
  IInvitadoToEventoPayload,
  IResumedTrackingPayload,
  IResumenPorEdad,
  ITipoHabitacionPayload,
  ITipoHabitacionXGrupoPayload,
  ITipoMesaPayload,
  ITipoMesaXGrupoPayload,
  ITrackingPayload,
  IUpdateInvitadoToEventoDto,
} from '../interfaces/models/evento.dto';
import {
  EventoPayload,
  ValidacionAperturaEventoPayload,
} from '../interfaces/payloads/evento.payload';
import {
  IDistribucionHabitacionesPayload,
  IDistribucionMesasPayload,
  IOcupationDateEvent,
  ResumenHabitacionesPayload,
  ResumenMesasPayload,
} from 'src/app/views/pages/admin/events/interfaces/events.interface';

export enum EventoAccionesEnum {
  RecargarDistribucionMesas = 'recargar-distribucion-mesas',
  RecargarDistribucionHabitaciones = 'recargar-distribucion-habitaciones',
  RecargarHabitaciones = 'recargar-habitaciones',
}

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private baseUrl = environment.apiUrl;

  private accionSubject = new Subject<EventoAccionesEnum>();
  public accionObservable = this.accionSubject.asObservable();

  constructor(private http: HttpClient) {}

  enviarAccion(accion: EventoAccionesEnum) {
    this.accionSubject.next(accion);
  }

  addEvent(model: EventoDto) {
    const url = `${this.baseUrl}/evento`;

    return this.http.post<ApiReturn<EventoPayload>>(url, model);
  }

  updateEvent(model: EventoDto) {
    const url = `${this.baseUrl}/evento`;

    return this.http.put<ApiReturn<EventoPayload>>(url, model);
  }

  getEventos(
    filterStatus: string,
    eventoId?: string,
    includeDetails: boolean = false
  ) {
    let url = `${this.baseUrl}/evento?status=${filterStatus}`;

    if (eventoId) {
      url = `${url}&id=${eventoId}`;
    }

    if (includeDetails) {
      url = `${url}&includeDetails=${includeDetails}`;
    }

    return this.http.get<ApiReturn<EventoPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  addGroupToEvent(eventoId: string, grupoId: string, invitados: number) {
    const model = {
      grupoId: grupoId,
      invitados: invitados,
    };
    const url = `${this.baseUrl}/evento/${eventoId}/grupo`;

    return this.http.post<ApiReturn<GrupoPayload>>(url, model);
  }

  removeGroupFromEvent(eventoId: string, grupoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}`;

    return this.http.delete<ApiReturn<GrupoPayload>>(url);
  }

  addFilialToEvent(eventoId: string, filiales: any[]) {
    const url = `${this.baseUrl}/evento/${eventoId}/filial`;

    const model = {
      filiales: filiales,
    };

    return this.http.post<ApiReturn<GrupoPayload>>(url, model);
  }

  removeFilialFromEvent(eventoId: string, filiales: any[]) {
    const url = `${this.baseUrl}/evento/${eventoId}/filial`;

    const options = {
      body: {
        filiales: filiales,
      },
    };

    return this.http.delete<ApiReturn<GrupoPayload>>(url, options);
  }

  addTipoHabitacionToEvent(eventoId: string, model: IAddTipoHabitacionDto) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-habitacion/`;

    return this.http.post<ApiReturn<IAddTipoHabitacionPayload>>(url, model);
  }

  updateTipoHabitacionFromEvent(
    eventoId: string,
    tipoHabitacionId: string,
    model: IAddTipoHabitacionDto
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-habitacion/${tipoHabitacionId}`;

    return this.http.put<ApiReturn<ITipoHabitacionPayload>>(url, model);
  }

  getTipoHabitacionFromEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-habitacion/`;

    return this.http.get<ApiReturn<ITipoHabitacionPayload[]>>(url);
  }

  getCountTipoHabitacionFromEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-habitacion/count`;

    return this.http.get<ApiReturn<ICountTipoHabitacionPayload[]>>(url);
  }

  getCountTipoMesaFromEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-mesa/count`;

    return this.http.get<ApiReturn<ICountTipoMesaPayload[]>>(url);
  }

  removeTipoHabitacionFromEvent(eventoId: string, tipoHabitacionId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-habitacion/${tipoHabitacionId}`;

    return this.http.delete<ApiReturn<number>>(url);
  }

  cancelEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/cancel`;

    return this.http.post<ApiReturn<EventoPayload>>(url, null);
  }

  archiveEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/archive`;

    return this.http.post<ApiReturn<EventoPayload>>(url, null);
  }

  validarAperturaEvento(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/validar-apertura`;

    return this.http.get<ApiReturn<ValidacionAperturaEventoPayload>>(url);
  }

  openEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/open`;

    return this.http.post<ApiReturn<EventoPayload>>(url, null);
  }

  closeEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/close`;

    return this.http.post<ApiReturn<EventoPayload>>(url, null);
  }

  reopenEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/reopen`;

    return this.http.post<ApiReturn<EventoPayload>>(url, null);
  }

  addInvitadoToEvent(
    eventoId: string,
    model: IAddInvitadoToEventoDto,
    confirmOverCapacity: boolean
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado?overCapacityConfirmed=${confirmOverCapacity}`;

    return this.http.post<ApiReturn<IAddInvitadoToEventPayload>>(url, model);
  }

  addInvitadoToEventBatch(
    eventoId: string,
    model: IAddInvitadoToEventoDto[],
    overCapacityConfirmed: boolean
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/Batch?overCapacityConfirmed=${overCapacityConfirmed}`;

    return this.http.post<ApiReturn<IAddInvitadoToEventPayload>>(url, model);
  }

  updateFechasOcupacionHabitacion(
    eventoId: string,
    model: IOcupationDateEvent
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/habitacion/${model.habitacionId}/fecha-ocupacion`;

    return this.http.put<ApiReturn<IAddInvitadoToEventPayload>>(url, model);
  }

  updateInvitadoToEvent(
    eventoId: string,
    invitadoId: string,
    model: IUpdateInvitadoToEventoDto
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}`;

    return this.http.put<ApiReturn<IInvitadoToEventoPayload>>(url, model);
  }

  getInvitadosFromEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado`;

    return this.http.get<ApiReturn<IInvitadoToEventoPayload[]>>(url);
  }
  getInvitadosResumenPorEdad(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/reporte-invitados-Por-Grupo-Edad`;

    return this.http.get<ApiReturn<IResumenPorEdad[]>>(url);
  }

  getInvitadoById(eventoId: string, invitadoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}`;

    return this.http.get<ApiReturn<IInvitadoToEventoPayload[]>>(url);
  }

  getTipoHabitacionXGrupo(eventoId: string, grupoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}/tipohabitacion`;

    return this.http.get<ApiReturn<ITipoHabitacionXGrupoPayload[]>>(url);
  }

  getInvitadoXGrupo(eventoId: string, grupoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}/invitado`;

    return this.http.get<ApiReturn<IInvitadoToEventoPayload[]>>(url);
  }

  addInvitadoToHabitacion(
    eventoId: string,
    invitadoId: string,
    habitacionId: string,
    tipoHabitacionId: string,
    unidadNegocioId: string,
    confirmOverCapacity: boolean
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}/habitacion/${habitacionId}/${tipoHabitacionId}`;

    const model = {
      unidadNegocioId: unidadNegocioId,
      confirmedOverCapacity: confirmOverCapacity,
    };

    return this.http.post<ApiReturn<any>>(url, model);
  }

  removeInvitadoFromHabitacion(eventoId: string, invitadoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}/habitacion`;

    return this.http.delete<ApiReturn<any>>(url);
  }

  removeInvitadoFromMesa(eventoId: string, invitadoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}/mesa`;

    return this.http.delete<ApiReturn<any>>(url);
  }

  deleteInvitadoFromEvent(eventoId: string, invitadoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}`;

    return this.http.delete<ApiReturn<any>>(url);
  }

  obtenerContadorInvitadosPorUnidad(
    eventoId: string,
    grupoId: string,
    unidadId: string
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}/unidadNegocio/${unidadId}/count`;

    return this.http.get<ApiReturn<any>>(url);
  }

  getGruposFromEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo`;

    return this.http.get<ApiReturn<IEventoGrupoPayload[]>>(url);
  }
  updateInvitadosPorUnidad(
    eventoId: string,
    grupoId: string,
    unidadNegocioId: string,
    invitados: number
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}/unidadNegocio/${unidadNegocioId}/invitados/${invitados}`;

    return this.http.put<ApiReturn<any>>(url, {});
  }

  updateInvitadosPorGrupo(
    eventoId: string,
    grupoId: string,
    invitados: number
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}/invitados/${invitados}`;

    return this.http.put<ApiReturn<any>>(url, {});
  }

  getTracking(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tracking`;

    return this.http.get<ApiReturn<ITrackingPayload[]>>(url);
  }

  getResumedTracking(eventoId: string, fechaInicio: Date, fechaFin: Date) {
    const model = {
      fechaInicio,
      fechaFin,
    };
    const url = `${this.baseUrl}/tracking/evento/${eventoId}/resumed`;

    return this.http.post<ApiReturn<IResumedTrackingPayload[]>>(url, model);
  }

  getTrackingByInvitado(eventoId: string, invitadoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tracking/invitado/${invitadoId}`;

    return this.http.get<ApiReturn<ITrackingPayload[]>>(url);
  }

  getTipoMesaFromEvent(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-mesa/`;

    return this.http.get<ApiReturn<ITipoMesaPayload[]>>(url);
  }
  addTipoMesaToEvent(eventoId: string, model: IAddTipoMesaDto) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-mesa/`;

    return this.http.post<ApiReturn<IAddTipoMesaPayload>>(url, model);
  }

  updateTipoMesaFromEvent(
    eventoId: string,
    tipoHabitacionId: string,
    model: IAddTipoMesaDto
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-mesa/${tipoHabitacionId}`;

    return this.http.put<ApiReturn<ITipoMesaPayload>>(url, model);
  }

  removeTipoMesaFromEvent(eventoId: string, tipoHabitacionId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/tipo-mesa/${tipoHabitacionId}`;

    return this.http.delete<ApiReturn<number>>(url);
  }

  getDistribucionMesasXGrupo(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-mesas`;

    return this.http.get<ApiReturn<IDistribucionMesasPayload[]>>(url);
  }

  updateDistribucionMesasXGrupo(
    eventoId: string,
    id: number,
    cantidad: number
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-mesas/${id}`;

    return this.http.put<ApiReturn<any>>(url, { cantidad });
  }

  distribuirMesas(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribuir-mesas`;

    return this.http.post<ApiReturn<any>>(url, {});
  }

  distribuirHabitaciones(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribuir-habitaciones`;

    return this.http.post<ApiReturn<any>>(url, {});
  }

  generarHabitaciones(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/generar-habitaciones`;

    return this.http.post<ApiReturn<any>>(url, {});
  }
  generarMesas(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/generar-mesas`;

    return this.http.post<ApiReturn<any>>(url, {});
  }

  getDistribucionHabitacionesXGrupo(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-habitaciones`;

    return this.http.get<ApiReturn<IDistribucionHabitacionesPayload[]>>(url);
  }

  updateDistribucionHabitacionesXGrupo(
    eventoId: string,
    id: number,
    cantidad: number
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-habitaciones/${id}`;

    return this.http.put<ApiReturn<any>>(url, { cantidad });
  }

  getResumenHabitaciones(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/resumen-habitaciones`;

    return this.http.get<ApiReturn<ResumenHabitacionesPayload[]>>(url);
  }

  getResumenMesas(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/resumen-mesas`;

    return this.http.get<ApiReturn<ResumenMesasPayload[]>>(url);
  }

  getTipoMesaXGrupo(eventoId: string, grupoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/grupo/${grupoId}/tipoMesa`;

    return this.http.get<ApiReturn<ITipoMesaXGrupoPayload[]>>(url);
  }

  addInvitadoToMesa(
    eventoId: string,
    invitadoId: string,
    mesaId: string,
    tipoMesaId: string,
    unidadNegocioId: string,
    confirmOverCapacity: boolean
  ) {
    const url = `${this.baseUrl}/evento/${eventoId}/invitado/${invitadoId}/mesa/${mesaId}/${tipoMesaId}`;

    const model = {
      unidadNegocioId: unidadNegocioId,
      confirmedOverCapacity: confirmOverCapacity,
    };

    return this.http.post<ApiReturn<any>>(url, model);
  }

  uploadDistribucionMesasFile(eventoId: string, formData: FormData) {
    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-mesas/upload`;

    return this.http.post<ApiReturn<string>>(url, formData);
  }

  uploadCuentaFile(eventoId: string, formData: FormData) {
    const url = `${this.baseUrl}/ingresosegresos/evento/${eventoId}/uploadCuentaFile`;

    return this.http.post<ApiReturn<string>>(url, formData);
  }

  asignarMesaReservada({
    eventoId = '',
    tipoMesaId = '',
    grupoId = '',
    unidadNegocioId = '',
    cantidadAsignar = 0,
  }) {
    const model = {
      grupoId,
      unidadNegocioId,
      cantidadAsignar,
    };

    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-mesas/asignar-reserva/${tipoMesaId}`;

    return this.http.post<ApiReturn<any>>(url, model);
  }

  asignarHabitacionReservada({
    eventoId = '',
    tipoHabitacionId = '',
    grupoId = '',
    unidadNegocioId = '',
    cantidadAsignar = 0,
  }) {
    const model = {
      grupoId,
      unidadNegocioId,
      cantidadAsignar,
    };

    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-habitaciones/asignar-reserva/${tipoHabitacionId}`;

    return this.http.post<ApiReturn<any>>(url, model);
  }

  reasignarHabitacion({
    eventoId = '',
    idOrigen = '',
    grupoId = '',
    unidadNegocioId = '',
    cantidadAsignar = 0,
  }) {
    const model = {
      grupoId,
      unidadNegocioId,
      cantidadAsignar,
    };

    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-habitaciones/reasignar/${idOrigen}`;

    return this.http.post<ApiReturn<any>>(url, model);
  }

  reasignarMesa({
    eventoId = '',
    idOrigen = '',
    grupoId = '',
    unidadNegocioId = '',
    cantidadAsignar = 0,
  }) {
    const model = {
      grupoId,
      unidadNegocioId,
      cantidadAsignar,
    };

    const url = `${this.baseUrl}/evento/${eventoId}/distribucion-mesas/reasignar/${idOrigen}`;

    return this.http.post<ApiReturn<any>>(url, model);
  }

  private asignacionHabitacionesActualizadasEvent = new EventEmitter<any>();
  // Método para emitir nuevos valores
  actualizarHabitacionesEmitEvent() {
    this.asignacionHabitacionesActualizadasEvent.emit('');
  }
  onActualizarHabitaciones(): EventEmitter<any> {
    return this.asignacionHabitacionesActualizadasEvent;
  }

  private asignacionMesasActualizadasEvent = new EventEmitter<any>();
  // Método para emitir nuevos valores
  actualizarMesasEmitEvent() {
    this.asignacionMesasActualizadasEvent.emit('');
  }
  onActualizarMesas(): EventEmitter<any> {
    return this.asignacionMesasActualizadasEvent;
  }

  reporteRooming(eventoId: string) {
    const url = `${this.baseUrl}/evento/${eventoId}/reporte-rooming`;

    return this.http.get<ApiReturn<string[]>>(url);
  }

  moveHabitacionToGrupo(
    eventoId: string,
    grupoIdOri: string,
    unidadNegocioIdOri: string,
    grupoIdDest: string,
    unidadNegocioIdDest: string,
    tipoHabitacionId: string
  ) {
    const model = {
      grupoIdOri,
      unidadNegocioIdOri,
      grupoIdDest,
      unidadNegocioIdDest,
      tipoHabitacionId,
    };
    const url = `${this.baseUrl}/evento/${eventoId}/movehabitaciontogroup`;

    return this.http.put<ApiReturn<any>>(url, { model });
  }
}
