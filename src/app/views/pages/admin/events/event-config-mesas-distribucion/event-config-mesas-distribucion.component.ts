import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { ApiReturn } from 'src/app/core/interfaces/payloads/api_return';
import {
  EventoAccionesEnum,
  EventoService,
} from 'src/app/core/services/evento.service';
import { IDistribucionMesasPayload } from '../interfaces/events.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { catchError, map, Subject, takeUntil, throwError } from 'rxjs';
import { EventoPayload } from 'src/app/core/interfaces/payloads/evento.payload';
import { MesaAsignadaData } from '../event-config-asignar-mesa-reserva/event-config-asignar-mesa-reserva.component';

@Component({
  selector: 'app-event-config-mesas-distribucion',
  templateUrl: './event-config-mesas-distribucion.component.html',
  styleUrls: ['./event-config-mesas-distribucion.component.scss'],
})
export class EventConfigMesasDistribucionComponent implements OnInit {
  @Input() eventoId: string | null = null;
  @Input() allowEdit: boolean = false;
  @Input() evento: EventoPayload;

  listOfGrupoData: IMesasPorGrupo[] = [];
  listOfTipoMesaData: IMesaPorTipoMesa[] = [];

  loading: boolean = false;

  form!: FormGroup;

  mesaPorGrupoInEdit: IMesasPorGrupoData | null = null;
  mesaPorTipoMesaInEdit: IMesaPorTipoMesaData | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private eventoService: EventoService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.cargarDistribucionMesas();

    this.eventoService.accionObservable.subscribe({
      next: (accion) => {
        // Realizar algo con la acción
        if (accion === EventoAccionesEnum.RecargarDistribucionMesas) {
          this.cargarDistribucionMesas();
        }
      },
    });
  }

  cargarDistribucionMesas() {
    if (!this.eventoId) return;
    this.eventoService
      .getDistribucionMesasXGrupo(this.eventoId!.toString())
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
      .subscribe((distribucionMesas) => {
        // Paso 1: Agrupar datos por unidadNegocioId

        // Paso 2: Llenar listOfParents
        this.listOfGrupoData =
          this.transformarDistribucionToGruposView(distribucionMesas);

        // Paso 3: Agrupar por tipoMesaId
        this.listOfTipoMesaData =
          this.transformarDistribucionToMesasView(distribucionMesas);
      });
  }

  transformarDistribucionToGruposView(
    distribucionMesas: IDistribucionMesasPayload[]
  ): IMesasPorGrupo[] {
    const agrupadosPorUnidadNegocio = distribucionMesas.reduce(
      (acc: any, distribucionMesa) => {
        const key = distribucionMesa.unidadNegocioId;
        if (!acc[key]) {
          acc[key] = {
            key: distribucionMesa.unidadNegocioId,
            eventoId: this.eventoId,
            grupoId: distribucionMesa.grupoId,
            grupo: distribucionMesa.grupo?.nombre ?? 'RESERVADO',
            unidadNegocioId: distribucionMesa.unidadNegocioId,
            unidadNegocio: distribucionMesa.unidadNegocio?.nombre,
            expand: false,
            children: [], // Preparar para detalles
          };
        }
        // Añadir detalles para listOfChildrenData
        acc[key].children.push({
          key: distribucionMesa.unidadNegocioId,
          id: distribucionMesa.id,
          tipoMesaId: distribucionMesa.tipoMesaId,
          tipoMesa: distribucionMesa.tipoMesa.tipo,
          descripcion: distribucionMesa.tipoMesa.descripcion,
          cantidad: distribucionMesa.cantidad,
        });
        return acc;
      },
      {}
    );

    return Object.values(agrupadosPorUnidadNegocio);
  }

  transformarDistribucionToMesasView(
    distribucionMesas: IDistribucionMesasPayload[]
  ): IMesaPorTipoMesa[] {
    // Agrupamos por tipoMesaId
    const groupedByTipoMesa = distribucionMesas.reduce((acc, curr) => {
      if (!acc[curr.tipoMesaId]) {
        acc[curr.tipoMesaId] = {
          tipoMesaId: curr.tipoMesaId,
          tipoMesa: curr.tipoMesa.tipo,
          descripcion: curr.tipoMesa.descripcion,
          expand: false,
          children: [],
        };
      }

      // Agregamos los detalles del grupo
      acc[curr.tipoMesaId].children.push({
        id: curr.id,
        grupoId: curr.grupoId ?? -1,
        grupo: curr.grupo != null ? curr.grupo.nombre : 'RESERVADO',
        unidadNegocioId: curr.unidadNegocioId ?? -1,
        unidadNegocio:
          curr.unidadNegocio != null ? curr.unidadNegocio.nombre : 'RESERVADO',
        cantidad: curr.cantidad,
      });

      return acc;
    }, {} as { [key: number]: any });

    // Convertimos el objeto a array
    return Object.values(groupedByTipoMesa);
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para desuscribirse
    this.destroy$.complete(); // Cierra el observable
  }

  openEditorByGrupoModal(
    content: TemplateRef<any>,
    parent: IMesasPorGrupo,
    data: IMesasPorGrupoData
  ) {
    this.form.get('id')?.setValue(data.id);
    this.form.get('grupo')?.setValue(parent.grupo);
    this.form.get('unidadNegocio')?.setValue(parent.unidadNegocio);
    this.form.get('tipoMesa')?.setValue(data.tipoMesa);
    this.form.get('cantidad')?.setValue(data.cantidad);

    this.mesaPorGrupoInEdit = data;
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openEditorByTipoMesaModal(
    content: TemplateRef<any>,
    parent: IMesaPorTipoMesa,
    data: IMesaPorTipoMesaData
  ) {
    this.form.get('id')?.setValue(data.id);
    this.form.get('grupo')?.setValue(data.grupo);
    this.form.get('unidadNegocio')?.setValue(data.unidadNegocio);
    this.form.get('tipoMesa')?.setValue(parent.tipoMesa);
    this.form.get('cantidad')?.setValue(data.cantidad);

    this.mesaPorTipoMesaInEdit = data;
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  mesaAReservar: IMesasPorGrupoData;
  openAsignarMesaReservada(
    content: TemplateRef<any>,
    mesaAReservar: IMesasPorGrupoData
  ) {
    this.mesaAReservar = mesaAReservar;

    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openReasignarMesaReservada(
    content: TemplateRef<any>,
    grupo: IMesasPorGrupo,
    mesa: IMesasPorGrupoData
  ) {
    this.mesaAReservar = {
      id: mesa.id,
      type: 'grupo',
      key: mesa.id,
      tipoMesaId: mesa.tipoMesaId,
      tipoMesa: mesa.tipoMesa,
      descripcion: mesa.descripcion,
      cantidad: mesa.cantidad,
    };

    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openReasignarMesaReservada2(
    content: TemplateRef<any>,
    mesa: IMesaPorTipoMesa,
    grupo: IMesaPorTipoMesaData
  ) {
    this.mesaAReservar = {
      id: grupo.id,
      type: 'grupo',
      key: grupo.id,
      tipoMesaId: mesa.tipoMesaId,
      tipoMesa: mesa.tipoMesa,
      descripcion: mesa.descripcion,
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
      tipoMesa: [''],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  mesasViewMode: number = 1;
  changeMesasView(viewMode: number) {
    this.mesasViewMode = viewMode;
  }

  saveConfigMesas() {
    this.eventoService
      .updateDistribucionMesasXGrupo(
        this.eventoId!.toString(),
        this.form.value.id,
        this.form.value.cantidad
      )
      .subscribe((data) => {
        if (data.success) {
          this.eventoService.actualizarMesasEmitEvent();

          if (this.mesaPorGrupoInEdit) {
            this.mesaPorGrupoInEdit.cantidad = this.form.value.cantidad;

            this.listOfTipoMesaData
              .find((p) => p.tipoMesaId == this.mesaPorGrupoInEdit!.tipoMesaId)!
              .children.find(
                (c) => c.id == this.mesaPorGrupoInEdit!.id
              )!.cantidad = this.form.value.cantidad;
          } else if (this.mesaPorTipoMesaInEdit) {
            this.mesaPorTipoMesaInEdit.cantidad = this.form.value.cantidad;

            this.listOfGrupoData
              .find(
                (p) =>
                  p.unidadNegocioId ==
                  this.mesaPorTipoMesaInEdit!.unidadNegocioId
              )!
              .children.find(
                (c) => c.id == this.mesaPorTipoMesaInEdit!.id
              )!.cantidad = this.form.value.cantidad;
          }

          this.mesaPorGrupoInEdit = null;
          this.mesaPorTipoMesaInEdit = null;

          this.alertsService.success(
            'Cantidad de mesas actualizada correctamente'
          );
          this.modalService.dismissAll();
        } else {
          this.alertsService.error(data.error);
        }
      });
  }
  distribuirMesas() {
    this.alertsService.confirm({
      titulo: 'Distribuir mesas',
      message:
        '¿Está seguro de distribuir las mesas? Se eliminará la distribución actual.',
      okCallback: () => {
        this.loading = true;

        this.eventoService
          .distribuirMesas(this.eventoId!.toString())
          .subscribe((data) => {
            this.loading = false;
            if (data.success) {
              this.cargarDistribucionMesas();

              this.alertsService.success('Mesas distribuidas correctamente');
            } else {
              this.alertsService.error(data.error);
            }
          });
      },
    });
  }

  crearEstructuraMesas() {
    this.eventoService
      .generarMesas(this.eventoId!.toString())
      .subscribe((data) => {
        if (data.success) {
          this.cargarDistribucionMesas();

          this.alertsService.success(
            'Estructura de mesas creada correctamente'
          );
        } else {
          this.alertsService.error(data.error);
        }
      });
  }

  mesaAsignada($event: MesaAsignadaData) {
    this.cargarDistribucionMesas();
  }

  permitirAsignarMesa(parent: IMesasPorGrupo, mesa: IMesasPorGrupoData) {
    if (!this.evento) return false;
    // el evento debe estar en estatus Abierto o Reabierto
    let ret = true;
    //this.evento.eventoStatusId == 2 || this.evento.eventoStatusId == 4;
    // el grupoId debe ser nulo (RESERVADO)
    ret = ret && parent.grupoId == null;
    // la cantidad de mesas disponibles debe ser mayor a 0
    ret = ret && mesa.cantidad > 0;

    return ret;
  }

  permitirReasignarMesa(parent: IMesasPorGrupo, data: IMesasPorGrupoData) {
    if (!this.evento) return false;

    if (!this.allowEdit) return false;

    let ret = true;

    // el grupoId debe ser nulo (RESERVADO)
    //ret = ret && parent.grupoId == null;
    // la cantidad de mesas disponibles debe ser mayor a 0
    ret = ret && data.cantidad > 0;

    return ret;
  }

  permitirReasignarMesa2(parent: IMesaPorTipoMesa, data: IMesaPorTipoMesaData) {
    if (!this.evento) return false;

    if (!this.allowEdit) return false;

    let ret = true;

    // el grupoId debe ser nulo (RESERVADO)
    //ret = ret && parent.grupoId == null;
    // la cantidad de mesas disponibles debe ser mayor a 0
    ret = ret && data.cantidad > 0;

    return ret;
  }
}

interface IMesasPorGrupo {
  key: number;
  type: 'grupo';
  grupoId: number;
  grupo: string;
  unidadNegocioId: number;
  unidadNegocio: string;
  expand: boolean;
  children: IMesasPorGrupoData[];
}

export interface IMesasPorGrupoData {
  id: number;
  type: 'grupo';
  key: number;
  tipoMesaId: number;
  tipoMesa: string;
  descripcion: string;
  cantidad: number;
}

export interface IMesaPorTipoMesa {
  id: number;
  key: number;
  type: 'tipoMesa';
  tipoMesaId: number;
  tipoMesa: string;
  descripcion: string;
  cantidad: number;
  expand: boolean;
  children: IMesaPorTipoMesaData[];
}

export interface IMesaPorTipoMesaData {
  id: number;
  type: 'tipoMesa';
  grupoId: number;
  grupo: string;
  unidadNegocioId: number;
  unidadNegocio: string;
  cantidad: number;
}
