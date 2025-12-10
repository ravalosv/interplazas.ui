import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemMesaDataGrid } from '../interfaces/events.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  EventoAccionesEnum,
  EventoService,
} from 'src/app/core/services/evento.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EventoPayload } from 'src/app/core/interfaces/payloads/evento.payload';
import { environment } from 'src/environments/environment';
import {
  ICountTipoMesaPayload,
  ITipoMesaPayload,
} from 'src/app/core/interfaces/models/evento.dto';

@Component({
  selector: 'app-event-config-mesas-list',
  templateUrl: './event-config-mesas-list.component.html',
  styleUrls: ['./event-config-mesas-list.component.scss'],
})
export class EventConfigMesasListComponent implements OnInit {
  @Input() eventoId: string | null = null;
  @Input() allowEdit: boolean = false;

  listOfDataGrid: ItemMesaDataGrid[] = [];
  formMesa!: FormGroup;

  editCache: { [key: string]: { edit: boolean; data: ItemMesaDataGrid } } = {};

  evento: EventoPayload | null = null;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarTiposMesas();

    this.eventoService.onActualizarMesas().subscribe(() => {
      this.cargarTiposMesas();
    });
  }

  loadEventos() {
    if (this.eventoId) {
      this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.evento = ret.data[0];
            this.imagenPrevia = `${environment.fotosUrl}/${this.evento.distribucionMesasFile}`;
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
    } else {
    }
  }

  initForm() {
    // Validar que: Cantidad sea numerico, mayor a 1, minimo sea numerico, mayor a 1, maximo sea numerico, mayor a minimo

    this.formMesa = this.fb.group(
      {
        id: [null],
        tipo: ['', [Validators.required]],
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
            Validators.min(1),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
        maximo: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
      },
      { validator: this.noExcederHabitacionesDisponibles }
    );
  }

  noExcederHabitacionesDisponibles(group: FormGroup) {
    const cantidad = group.controls.cantidad.value;
    const reserva = group.controls.reserva.value;

    return Number(cantidad) >= Number(reserva)
      ? null
      : { reservasExcedenCantidad: true };
  }

  counTipoMesa: ICountTipoMesaPayload[] = [];

  basicModalCloseResult: string = '';
  openLoadImageModal(content: TemplateRef<any>) {
    this.nuevaImagenCargada = false;
    this.loadEventos();
    this.openBasicModal(content);
  }

  openBasicModal(content: TemplateRef<any>) {
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'lg' })
      .result.then((result) => {
        this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }

  startEditGrid(id: string): void {
    // buscar el item en la lista de habitaciones
    const habi = this.listOfDataGrid.find((item) => item.id === id);

    this.setFormTipoHabitacionData(habi!);
  }

  setFormTipoHabitacionData(item: ItemMesaDataGrid) {
    this.formMesa.get('id')?.setValue(item.id);
    this.formMesa.get('tipo')?.setValue(item.tipo);
    this.formMesa.get('descripcion')?.setValue(item.descripcion);
    this.formMesa.get('cantidad')?.setValue(item.cantidad);
    this.formMesa.get('maximo')?.setValue(item.maximo);
    this.formMesa.get('reserva')?.setValue(item.reserva);
  }

  clearFormTipoMesaData() {
    this.formMesa.reset();
  }

  deleteTipoMesa(id: string) {
    this.alertsService.confirm({
      titulo: 'Eliminar tipo de mesa',
      message:
        '¿Está seguro que desea eliminar esta mesa? Si ya se realizó una distribución de mesas, esta se eliminará.',
      okCallback: () => {
        this.eventoService
          .removeTipoMesaFromEvent(this.eventoId!, id)
          .subscribe({
            next: (ret) => {
              if (ret.success) {
                this.eventoService.enviarAccion(
                  EventoAccionesEnum.RecargarDistribucionMesas
                );

                this.alertsService.success('Mesa eliminada satisfactoriamente');
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

  updateEditCache(): void {
    this.listOfDataGrid.forEach((item) => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  saveEdit(id: string): void {
    const index = this.listOfDataGrid.findIndex((item) => item.id === id);
    Object.assign(this.listOfDataGrid[index], this.editCache[id].data);
    this.editCache[id].edit = false;
  }
  cancelEdit(id: string): void {
    const index = this.listOfDataGrid.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfDataGrid[index] },
      edit: false,
    };
  }

  guardarNuevaMesa(closeModal: boolean) {
    if (this.formMesa.invalid) return;

    // guardar en la BD
    if (this.formMesa.get('id')?.value) {
      // editar
      this.editarTipoMesa(closeModal);
    } else {
      // agregar
      this.agregarTipoMesa(closeModal);
    }
  }

  editarTipoMesa(closeModal: boolean) {
    let habitacionValues = { ...this.formMesa.value };
    delete habitacionValues.id;

    this.eventoService
      .updateTipoMesaFromEvent(
        this.eventoId!,
        this.formMesa.get('id')?.value,
        habitacionValues
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Mesa actualizada satisfactoriamente');

            // actualizar listOfDataGrid con los datos editados
            const index = this.listOfDataGrid.findIndex(
              (item) => item.id === this.formMesa.get('id')?.value
            );

            Object.assign(this.listOfDataGrid[index], this.formMesa.value);

            this.updateEditCache();

            this.formMesa.reset();
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
  agregarTipoMesa(closeModal: boolean) {
    let habitacionValues = { ...this.formMesa.value };
    delete habitacionValues.id;

    this.eventoService
      .addTipoMesaToEvent(this.eventoId!, habitacionValues)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Mesa agregada satisfactoriamente');

            // map de IAddTipoHabitacionPayload a ItemMesaDataGrid

            this.listOfDataGrid = [
              ...this.listOfDataGrid,
              {
                id: ret.data.id.toString(),
                tipo: ret.data.tipo,
                descripcion: ret.data.descripcion,
                cantidad: ret.data.cantidad,
                disponibles: ret.data.cantidad,
                maximo: ret.data.maximo,
                reserva: ret.data.reserva,
              },
            ];

            this.updateEditCache();

            this.formMesa.reset();

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

  cargarTiposMesas() {
    if (this.eventoId == null) return;
    this.eventoService.getTipoMesaFromEvent(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listOfDataGrid = ret.data.map((tipo: ITipoMesaPayload) => {
            return {
              id: tipo.id.toString(),
              tipo: tipo.tipo,
              descripcion: tipo.descripcion,
              cantidad: tipo.cantidad,
              disponibles: tipo.disponibles,
              maximo: tipo.maximo,
              reserva: tipo.reserva,
            };
          });
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

  cargarCountTiposMesas() {
    if (!this.eventoId) return;

    this.eventoService.getCountTipoMesaFromEvent(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.counTipoMesa = ret.data;
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

  public archivos: File[] = [];
  imagenPrevia: any;
  loading: boolean = false;
  nuevaImagenCargada: boolean = false;
  capturarFile(event: any) {
    const archivoCapturado = event.target.files[0];

    if (archivoCapturado) {
      this.archivos.length = 0;
      this.archivos.push(archivoCapturado);

      this.nuevaImagenCargada = true;

      this.mostrarDistribucionMesas(archivoCapturado);
    }
  }

  mostrarDistribucionMesas(archivoCapturado: any) {
    this.blobFile(archivoCapturado).then((res: any) => {
      this.imagenPrevia = res.base;
    });
  }

  blobFile = async ($event: any) =>
    new Promise((resolve, reject) => {
      try {
        const unsafeImg = window.URL.createObjectURL($event);
        const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
        const reader = new FileReader();
        reader.readAsDataURL($event);
        reader.onload = () => {
          resolve({
            blob: $event,
            image,
            base: reader.result,
          });
        };
        reader.onerror = (error) => {
          resolve({
            blob: $event,
            image,
            base: null,
          });
        };
      } catch (e) {
        resolve(null);
      }
    });

  subirArchivo() {
    try {
      const formData = new FormData();
      this.archivos.forEach((item: any) => {
        formData.append('file', item);
      });
      this.loading = true;
      this.eventoService
        .uploadDistribucionMesasFile(this.eventoId!, formData)
        .subscribe((res) => {
          this.loading = false;
          if (res.success) {
            this.modalService.dismissAll();
            this.alertsService.success('Archivo subido correctamente');
          } else {
            this.alertsService.error(res.error);
          }
        });
    } catch (e) {
      this.loading = false;
      this.alertsService.error('Error al subir archivo');
    } finally {
    }
  }
}
