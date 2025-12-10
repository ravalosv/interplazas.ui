import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, map, catchError, throwError, takeUntil } from 'rxjs';
import { AlertsService } from 'src/app/core/services/alerts.service';
import {
  EventoService,
  EventoAccionesEnum,
} from 'src/app/core/services/evento.service';
import { HabitacionAsignadaData } from '../event-config-asignar-habitacion-reserva/event-config-asignar-habitacion-reserva.component';
import { EventoPayload } from 'src/app/core/interfaces/payloads/evento.payload';
import { IDistribucionHabitacionesPayload } from '../interfaces/events.interface';

@Component({
  selector: 'app-event-config-habitaciones-distribucion',
  templateUrl: './event-config-habitaciones-distribucion.component.html',
  styleUrls: ['./event-config-habitaciones-distribucion.component.scss'],
})
export class EventConfigHabitacionesDistribucionComponent implements OnInit {
  @Input() eventoId: string | null = null;
  @Input() allowEdit: boolean = false;
  @Input() evento: EventoPayload;

  listOfGrupoData: IHabitacionesPorGrupo[] = [];
  listOfTipoHabitacionData: IHabitacionPorTipoHabitacion[] = [];

  loading: boolean = false;

  form!: FormGroup;

  habitacionPorGrupoInEdit: IHabitacionesPorGrupoData | null = null;
  habitacionPorTipoHabitacionInEdit: IHabitacionPorTipoHabitacionData | null =
    null;

  private destroy$ = new Subject<void>();

  constructor(
    private eventoService: EventoService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.cargarDistribucionHabitaciones();

    this.eventoService.accionObservable.subscribe({
      next: (accion) => {
        // Realizar algo con la acción
        if (accion === EventoAccionesEnum.RecargarDistribucionHabitaciones) {
          this.cargarDistribucionHabitaciones();
        }
      },
    });
  }

  cargarDistribucionHabitaciones() {
    if (!this.eventoId) return;

    this.eventoService
      .getDistribucionHabitacionesXGrupo(this.eventoId!.toString())
      .pipe(
        map((data) => {
          if (!data.success) {
            throw new Error(data.error);
          }
          return data.data; // Continúa con el procesamiento de los datos
        }),
        catchError((error) => {
          this.alertsService.error(error.message);
          return throwError(error); // Maneja el error y permite que el flujo de errores continúe
        }),
        takeUntil(this.destroy$) // Asegura la desuscripción automática
      )
      .subscribe(
        (distribucionHabitaciones: IDistribucionHabitacionesPayload[]) => {
          // Paso 2: Llenar listOfParents
          this.listOfGrupoData = this.transformarDistribucionToGruposView(
            distribucionHabitaciones
          );

          // Paso 3: Agrupar por tipoHabitacionId
          this.listOfTipoHabitacionData =
            this.transformarDistribucionToHabitacionesView(
              distribucionHabitaciones
            );

          return;
        }
      );
  }

  transformarDistribucionToGruposView(
    distribucionHabitaciones: IDistribucionHabitacionesPayload[]
  ): IHabitacionesPorGrupo[] {
    // Paso 1: Agrupar datos por unidadNegocioId
    const agrupadosPorUnidadNegocio = distribucionHabitaciones.reduce(
      (acc: any, distribucionHabitacion) => {
        const key = distribucionHabitacion.unidadNegocioId;
        if (!acc[key]) {
          acc[key] = {
            key: distribucionHabitacion.unidadNegocioId,
            eventoId: this.eventoId,
            grupoId: distribucionHabitacion.grupoId,
            grupo: distribucionHabitacion.grupo?.nombre ?? 'RESERVADO',
            unidadNegocioId: distribucionHabitacion.unidadNegocioId,
            unidadNegocio: distribucionHabitacion.unidadNegocio?.nombre,
            expand: false,
            children: [], // Preparar para detalles
          };
        }
        // Añadir detalles para listOfChildrenData
        acc[key].children.push({
          key: distribucionHabitacion.unidadNegocioId,
          id: distribucionHabitacion.id,
          tipoHabitacionId: distribucionHabitacion.tipoHabitacionId,
          tipoHabitacion: distribucionHabitacion.tipoHabitacion.tipoHabitacion,
          descripcion: distribucionHabitacion.tipoHabitacion.descripcion,
          cantidad: distribucionHabitacion.cantidad,
        });
        return acc;
      },
      {}
    );

    return Object.values(agrupadosPorUnidadNegocio);
  }

  transformarDistribucionToHabitacionesView(
    distribucionHabitaciones: IDistribucionHabitacionesPayload[]
  ): IHabitacionPorTipoHabitacion[] {
    // Agrupamos por tipoHabitacionId
    const groupedByTipoHabitacion = distribucionHabitaciones.reduce(
      (acc, curr) => {
        if (!acc[curr.tipoHabitacionId]) {
          acc[curr.tipoHabitacionId] = {
            tipoHabitacionId: curr.tipoHabitacionId,
            tipoHabitacion: curr.tipoHabitacion.tipoHabitacion,
            descripcion: curr.tipoHabitacion.descripcion,
            expand: false,
            children: [],
          };
        }

        // Agregamos los detalles del grupo
        acc[curr.tipoHabitacionId].children.push({
          id: curr.id,
          grupoId: curr.grupoId ?? -1,
          grupo: curr.grupo != null ? curr.grupo.nombre : 'RESERVADO',
          unidadNegocioId: curr.unidadNegocioId ?? -1,
          unidadNegocio:
            curr.unidadNegocio != null
              ? curr.unidadNegocio.nombre
              : 'RESERVADO',
          cantidad: curr.cantidad,
        });

        return acc;
      },
      {} as { [key: number]: any }
    );

    // Convertimos el objeto a array
    return Object.values(groupedByTipoHabitacion);
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para desuscribirse
    this.destroy$.complete(); // Cierra el observable
  }

  openEditorByGrupoModal(
    content: TemplateRef<any>,
    parent: IHabitacionesPorGrupo,
    data: IHabitacionesPorGrupoData
  ) {
    this.form.get('id')?.setValue(data.id);
    this.form.get('grupo')?.setValue(parent.grupo);
    this.form.get('unidadNegocio')?.setValue(parent.unidadNegocio);
    this.form.get('tipoHabitacion')?.setValue(data.tipoHabitacion);
    this.form.get('cantidad')?.setValue(data.cantidad);

    this.habitacionPorGrupoInEdit = data;
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openEditorByTipoHabitacionModal(
    content: TemplateRef<any>,
    parent: IHabitacionPorTipoHabitacion,
    data: IHabitacionPorTipoHabitacionData
  ) {
    this.form.get('id')?.setValue(data.id);
    this.form.get('grupo')?.setValue(data.grupo);
    this.form.get('unidadNegocio')?.setValue(data.unidadNegocio);
    this.form.get('tipoHabitacion')?.setValue(parent.tipoHabitacion);
    this.form.get('cantidad')?.setValue(data.cantidad);

    this.habitacionPorTipoHabitacionInEdit = data;
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  habitacionAReservar: IHabitacionesPorGrupoData;
  openAsignarHabitacionReservada(
    content: TemplateRef<any>,
    habitacionAReservar:
      | IHabitacionesPorGrupoData
      | IHabitacionPorTipoHabitacion
  ) {
    if (habitacionAReservar.type === 'grupo') {
      this.habitacionAReservar = habitacionAReservar;
    } else {
      this.habitacionAReservar = {
        id: habitacionAReservar.children[0].id,
        type: 'grupo',
        key: habitacionAReservar.children[0].id,
        tipoHabitacionId: habitacionAReservar.tipoHabitacionId,
        tipoHabitacion: habitacionAReservar.tipoHabitacion,
        descripcion: habitacionAReservar.descripcion,
        cantidad: habitacionAReservar.children[0].cantidad,
      };
    }

    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openAsignarHabitacionReservada2(
    content: TemplateRef<any>,
    parent: IHabitacionPorTipoHabitacion,
    data: IHabitacionPorTipoHabitacionData
  ) {
    this.habitacionAReservar = {
      id: data.id,
      type: 'grupo',
      key: data.id,
      tipoHabitacionId: parent.tipoHabitacionId,
      tipoHabitacion: parent.tipoHabitacion,
      descripcion: parent.descripcion,
      cantidad: data.cantidad,
    };

    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openReasignarHabitacionReservada(
    content: TemplateRef<any>,
    grupo: IHabitacionesPorGrupo,
    habitacion: IHabitacionesPorGrupoData
  ) {
    this.habitacionAReservar = {
      id: habitacion.id,
      type: 'grupo',
      key: habitacion.id,
      tipoHabitacionId: habitacion.tipoHabitacionId,
      tipoHabitacion: habitacion.tipoHabitacion,
      descripcion: habitacion.descripcion,
      cantidad: habitacion.cantidad,
    };

    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openReasignarHabitacionReservada2(
    content: TemplateRef<any>,
    habitacion: IHabitacionPorTipoHabitacion,
    grupo: IHabitacionPorTipoHabitacionData
  ) {
    this.habitacionAReservar = {
      id: grupo.id,
      type: 'grupo',
      key: grupo.id,
      tipoHabitacionId: habitacion.tipoHabitacionId,
      tipoHabitacion: habitacion.tipoHabitacion,
      descripcion: habitacion.descripcion,
      cantidad: grupo.cantidad,
    };

    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  initForm() {
    this.form = this.fb.group({
      id: [''],
      grupo: [''],
      unidadNegocio: [''],
      tipoHabitacion: [''],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  habitacionesViewMode: number = 1;
  changeHabitacionesView(viewMode: number) {
    this.habitacionesViewMode = viewMode;
  }

  saveConfigHabitaciones() {
    this.eventoService
      .updateDistribucionHabitacionesXGrupo(
        this.eventoId!.toString(),
        this.form.value.id,
        this.form.value.cantidad
      )
      .subscribe((data) => {
        if (data.success) {
          this.eventoService.actualizarHabitacionesEmitEvent();

          if (this.habitacionPorGrupoInEdit) {
            this.habitacionPorGrupoInEdit.cantidad = this.form.value.cantidad;

            this.listOfTipoHabitacionData
              .find(
                (p) =>
                  p.tipoHabitacionId ==
                  this.habitacionPorGrupoInEdit!.tipoHabitacionId
              )!
              .children.find(
                (c) => c.id == this.habitacionPorGrupoInEdit!.id
              )!.cantidad = this.form.value.cantidad;
          } else if (this.habitacionPorTipoHabitacionInEdit) {
            this.habitacionPorTipoHabitacionInEdit.cantidad =
              this.form.value.cantidad;

            this.listOfGrupoData
              .find(
                (p) =>
                  p.unidadNegocioId ==
                  this.habitacionPorTipoHabitacionInEdit!.unidadNegocioId
              )!
              .children.find(
                (c) => c.id == this.habitacionPorTipoHabitacionInEdit!.id
              )!.cantidad = this.form.value.cantidad;
          }

          this.habitacionPorGrupoInEdit = null;
          this.habitacionPorTipoHabitacionInEdit = null;

          this.alertsService.success(
            'Cantidad de habitaciones actualizada correctamente'
          );
          this.modalService.dismissAll();
        } else {
          this.alertsService.error(data.error);
        }
      });
  }
  distribuirHabitaciones() {
    this.alertsService.confirm({
      titulo: 'Distribuir habitaciones',
      message:
        '¿Está seguro de distribuir las habitaciones? Se eliminará la distribución actual.',
      okCallback: () => {
        this.loading = true;
        this.eventoService
          .distribuirHabitaciones(this.eventoId!.toString())
          .subscribe((data) => {
            this.loading = false;
            if (data.success) {
              this.cargarDistribucionHabitaciones();

              this.alertsService.success(
                'Habitaciones distribuidas correctamente'
              );
            } else {
              this.alertsService.error(data.error);
            }
          });
      },
    });
  }

  habitacionAsignada($event: HabitacionAsignadaData) {
    this.cargarDistribucionHabitaciones();
  }

  permitirAsignarHabitacion(
    parent: IHabitacionesPorGrupo,
    data: IHabitacionesPorGrupoData
  ) {
    if (!this.evento) return false;

    let ret = true;

    // el grupoId debe ser nulo (RESERVADO)
    ret = ret && parent.grupoId == null;
    // la cantidad de habitaciones disponibles debe ser mayor a 0
    ret = ret && data.cantidad > 0;

    return ret;
  }

  permitirReasignarHabitacion(
    parent: IHabitacionesPorGrupo,
    data: IHabitacionesPorGrupoData
  ) {
    if (!this.evento) return false;

    if (!this.allowEdit) return false;

    let ret = true;

    // el grupoId debe ser nulo (RESERVADO)
    //ret = ret && parent.grupoId == null;
    // la cantidad de habitaciones disponibles debe ser mayor a 0
    ret = ret && data.cantidad > 0;

    return ret;
  }

  permitirReasignarHabitacion2(
    parent: IHabitacionPorTipoHabitacion,
    data: IHabitacionPorTipoHabitacionData
  ) {
    if (!this.evento) return false;

    if (!this.allowEdit) return false;

    let ret = true;

    // el grupoId debe ser nulo (RESERVADO)
    //ret = ret && parent.grupoId == null;
    // la cantidad de habitaciones disponibles debe ser mayor a 0
    ret = ret && data.cantidad > 0;

    return ret;
  }

  permitirAsignarHabitacion2(
    parent: IHabitacionPorTipoHabitacion,
    data: IHabitacionPorTipoHabitacionData
  ) {
    if (!this.evento) return false;

    let ret = true;

    // el grupoId debe (RESERVADO)
    ret = ret && data.grupo == 'RESERVADO';
    // la cantidad de habitaciones disponibles debe ser mayor a 0
    ret = ret && data.cantidad > 0;

    return ret;
  }

  permitirEditarHabitacion(
    parent: IHabitacionesPorGrupo,
    data: IHabitacionesPorGrupoData
  ) {
    if (!this.evento) return false;

    // No debe ser reserva
    if (!parent.grupoId) return false;

    if (!this.allowEdit) return false;

    return true;
  }

  permitirEditarHabitacion2(
    parent: IHabitacionPorTipoHabitacion,
    data: IHabitacionPorTipoHabitacionData
  ) {
    if (!this.evento) return false;

    // No debe ser reserva
    if (data.grupo == 'RESERVADO') return false;

    if (!this.allowEdit) return false;

    return true;
  }

  crearEstructuraHabitaciones() {
    this.eventoService
      .generarHabitaciones(this.eventoId!.toString())
      .subscribe((data) => {
        if (data.success) {
          this.cargarDistribucionHabitaciones();

          this.alertsService.success(
            'Estructura de habitaciones creada correctamente'
          );
        } else {
          this.alertsService.error(data.error);
        }
      });
  }

  exportRooming() {}
}

interface IHabitacionesPorGrupo {
  key: number;
  type: 'grupo';
  grupoId: number;
  grupo: string;
  unidadNegocioId: number;
  unidadNegocio: string;
  expand: boolean;
  children: IHabitacionesPorGrupoData[];
}

export interface IHabitacionesPorGrupoData {
  id: number;
  type: 'grupo';
  key: number;
  tipoHabitacionId: number;
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
}

export interface IHabitacionPorTipoHabitacion {
  id: number;
  type: 'tipoHabitacion';
  key: number;
  tipoHabitacionId: number;
  tipoHabitacion: string;
  descripcion: string;
  cantidad: number;
  expand: boolean;
  children: IHabitacionPorTipoHabitacionData[];
}

export interface IHabitacionPorTipoHabitacionData {
  id: number;
  type: 'tipoHabitacion';
  grupoId: number;
  grupo: string;
  unidadNegocioId: number;
  unidadNegocio: string;
  cantidad: number;
}
