import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import {
  EventoAccionesEnum,
  EventoService,
} from 'src/app/core/services/evento.service';
import { ItemDataGrid } from '../interfaces/events.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ICountTipoHabitacionPayload,
  ITipoHabitacionPayload,
} from 'src/app/core/interfaces/models/evento.dto';

@Component({
  selector: 'app-event-config-habitaciones-list',
  templateUrl: './event-config-habitaciones-list.component.html',
  styleUrls: ['./event-config-habitaciones-list.component.scss'],
})
export class EventConfigHabitacionesListComponent implements OnInit {
  @Input() eventoId: string | null = null;
  @Input() allowEdit: boolean = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private eventoService: EventoService,
    private alertsService: AlertsService
  ) {}

  formHabitacion!: FormGroup;

  ngOnInit(): void {
    this.cargarTiposHabitaciones();

    this.formHabitacion = this.fb.group(
      {
        id: [null],
        tipoHabitacion: ['', [Validators.required]],
        descripcion: ['', [Validators.required]],
        cantidad: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
        reserva: [
          '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern('^[0-9]+$'),
          ],
        ],

        minimo: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
        maximo: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      },
      { validator: this.validarFormulario }
    );

    this.eventoService.onActualizarHabitaciones().subscribe(() => {
      this.cargarTiposHabitaciones();
    });
  }

  validarFormulario = (group: FormGroup) => {
    const ret1 = this.maximoMayorAMinimo(group);
    const ret2 = this.noExcederHabitacionesDisponibles(group);

    const ret =
      ret1 == null && ret2 == null ? null : { maximoMenorAMinimo: true };

    return { ...ret1, ...ret2 };
  };

  maximoMayorAMinimo(group: FormGroup) {
    const minimo = group.controls.minimo.value;
    const maximo = group.controls.maximo.value;

    const ret1 =
      Number(minimo) <= Number(maximo) ? null : { maximoMenorAMinimo: true };

    return ret1;
  }

  noExcederHabitacionesDisponibles(group: FormGroup) {
    const cantidad = group.controls.cantidad.value;
    const reserva = group.controls.reserva.value;

    return Number(cantidad) >= Number(reserva)
      ? null
      : { reservasExcedenCantidad: true };
  }

  /*  HABITACIONES GRID */
  editCache: { [key: string]: { edit: boolean; data: ItemDataGrid } } = {};
  listOfDataGrid: ItemDataGrid[] = [];
  listOfDataGridMesas: ItemDataGrid[] = [];

  counTipoHabitacion: ICountTipoHabitacionPayload[] = [];

  startEditGrid(id: string): void {
    // buscar el item en la lista de habitaciones
    const habi = this.listOfDataGrid.find((item) => item.id === id);

    this.setFormTipoHabitacionData(habi!);
  }

  setFormTipoHabitacionData(item: ItemDataGrid) {
    this.formHabitacion.get('id')?.setValue(item.id);
    this.formHabitacion.get('tipoHabitacion')?.setValue(item.tipoHabitacion);
    this.formHabitacion.get('descripcion')?.setValue(item.descripcion);
    this.formHabitacion.get('cantidad')?.setValue(item.cantidad);
    this.formHabitacion.get('minimo')?.setValue(item.minimo);
    this.formHabitacion.get('maximo')?.setValue(item.maximo);
    this.formHabitacion.get('reserva')?.setValue(item.reserva);
  }

  clearFormTipoHabitacionData() {
    this.formHabitacion.reset();
  }

  cancelEdit(id: string): void {
    const index = this.listOfDataGrid.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfDataGrid[index] },
      edit: false,
    };
  }

  deleteTipoHabitacion(id: string) {
    this.alertsService.confirm({
      titulo: 'Eliminar tipo de habitación',
      message:
        '¿Está seguro que desea eliminar esta habitación? Si ya se realizó una distribución de habitaciones, esta se eliminará.',
      okCallback: () => {
        this.eventoService
          .removeTipoHabitacionFromEvent(this.eventoId!, id)
          .subscribe({
            next: (ret) => {
              if (ret.success) {
                this.eventoService.enviarAccion(
                  EventoAccionesEnum.RecargarDistribucionMesas
                );
                this.alertsService.success(
                  'Habitación eliminada satisfactoriamente'
                );
                this.listOfDataGrid = this.listOfDataGrid.filter(
                  (item) => item.id !== id
                );
                this.updateEditCache();
              } else {
                this.alertsService.error(ret.error);
              }
            },
            error: (e) => {
              this.alertsService.error(e);
            },
            complete: () => {},
          });
      },
    });
  }

  saveEdit(id: string): void {
    const index = this.listOfDataGrid.findIndex((item) => item.id === id);
    Object.assign(this.listOfDataGrid[index], this.editCache[id].data);
    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.listOfDataGrid.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  cargarTiposHabitaciones() {
    if (!this.eventoId) return;

    this.eventoService.getTipoHabitacionFromEvent(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listOfDataGrid = ret.data.map(
            (tipoHabitacion: ITipoHabitacionPayload) => {
              return {
                id: tipoHabitacion.id.toString(),
                tipoHabitacion: tipoHabitacion.tipoHabitacion,
                descripcion: tipoHabitacion.descripcion,
                cantidad: tipoHabitacion.cantidad,
                disponibles: tipoHabitacion.disponibles,
                minimo: tipoHabitacion.minimo,
                maximo: tipoHabitacion.maximo,
                reserva: tipoHabitacion.reserva,
              };
            }
          );
          this.updateEditCache();
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }

  cargarCountTiposHabitaciones() {
    if (!this.eventoId) return;

    this.eventoService
      .getCountTipoHabitacionFromEvent(this.eventoId!)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.counTipoHabitacion = ret.data;
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
  }

  guardarNuevaHabitacion(closeModal: boolean) {
    if (this.formHabitacion.invalid) return;

    // guardar en la BD
    if (this.formHabitacion.get('id')?.value) {
      // editar
      this.editarTipoHabitacion(closeModal);
    } else {
      // agregar
      this.agregarTipoHabitacion(closeModal);
    }
  }

  agregarTipoHabitacion(closeModal: boolean) {
    let habitacionValues = { ...this.formHabitacion.value };
    delete habitacionValues.id;

    this.eventoService
      .addTipoHabitacionToEvent(this.eventoId!, habitacionValues)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success(
              'Habitación agregada satisfactoriamente'
            );

            // map de IAddTipoHabitacionPayload a ItemDataGrid

            this.listOfDataGrid = [
              ...this.listOfDataGrid,
              {
                id: ret.data.id.toString(),
                tipoHabitacion: ret.data.tipoHabitacion,
                descripcion: ret.data.descripcion,
                cantidad: ret.data.cantidad,
                disponibles: ret.data.cantidad,
                minimo: ret.data.minimo,
                maximo: ret.data.maximo,
                reserva: ret.data.reserva,
              },
            ];

            this.updateEditCache();

            this.formHabitacion.reset();

            if (closeModal) {
              this.modalService.dismissAll();
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
  }

  editarTipoHabitacion(closeModal: boolean) {
    let habitacionValues = { ...this.formHabitacion.value };
    delete habitacionValues.id;

    this.eventoService
      .updateTipoHabitacionFromEvent(
        this.eventoId!,
        this.formHabitacion.get('id')?.value,
        habitacionValues
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success(
              'Habitación actualizada satisfactoriamente'
            );

            // actualizar listOfDataGrid con los datos editados
            const index = this.listOfDataGrid.findIndex(
              (item) => item.id === this.formHabitacion.get('id')?.value
            );

            Object.assign(
              this.listOfDataGrid[index],
              this.formHabitacion.value
            );

            this.updateEditCache();

            this.formHabitacion.reset();

            if (closeModal) {
              this.modalService.dismissAll();
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
  }

  basicModalCloseResult: string = '';
  openBasicModal(content: TemplateRef<any>) {
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'lg' })
      .result.then((result) => {
        this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }
}
