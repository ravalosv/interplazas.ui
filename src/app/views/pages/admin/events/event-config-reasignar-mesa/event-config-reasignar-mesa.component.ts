import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  GrupoFilial,
  UnidadNegocio,
  Filial,
} from 'src/app/core/interfaces/payloads/evento.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { EventoService } from 'src/app/core/services/evento.service';
import {
  IMesaPorTipoMesa,
  IMesasPorGrupoData,
} from '../event-config-mesas-distribucion/event-config-mesas-distribucion.component';

@Component({
  selector: 'app-event-config-reasignar-mesa',
  templateUrl: './event-config-reasignar-mesa.component.html',
  styleUrls: ['./event-config-reasignar-mesa.component.scss'],
})
export class EventConfigReasignarMesaComponent implements OnInit {
  @Input() eventoId: string | null = null;
  @Input() mesaAReservar: IMesasPorGrupoData | IMesaPorTipoMesa;
  @Output() mesaAsignada = new EventEmitter<MesaAsignadaData>();

  form!: FormGroup;
  grupos: GrupoFilial[];
  selectedFiltroGrupo: GrupoFilial | null = null;
  selectedFiltroUN: any;
  selectedFiltroFilial: any;
  filtroUN: UnidadNegocio[];
  filtroFiliales: Filial[] | null = null;
  grupoId: string;
  unidadNegocioId: string | null = null;
  constructor(
    private eventoService: EventoService,
    private modalService: NgbModal,
    private alertsService: AlertsService,

    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarEvento();
  }

  initForm() {
    this.form = this.fb.group(
      {
        id: [''],
        grupoId: ['', Validators.required],
        unidadNegocioId: ['', Validators.required],
        tipoMesaId: [''],
        tipoMesa: [this.mesaAReservar.tipoMesa],
        cantidad: [this.mesaAReservar.cantidad],
        cantidadAsignar: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9]+$'),
            Validators.min(1),
          ],
        ],
      },
      {
        validator: this.noExcederCantidadDisponible,
      }
    );
  }

  noExcederCantidadDisponible = (group: FormGroup) => {
    const cantidad = group.controls.cantidad.value;
    const cantidadAsignar = group.controls.cantidadAsignar.value;

    return Number(cantidad) < Number(cantidadAsignar)
      ? { asignarMenorACantidad: true }
      : null;
  };

  cargarEvento() {
    if (!this.eventoId) return;

    this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
      next: (ret) => {
        if (ret.success) {
          const reserva = {
            id: -1,
            nombre: 'RESERVA',
            unidadesNegocio: [
              {
                id: -1,
                nombre: 'RESERVA',
                filiales: [
                  {
                    id: -1,
                    nombre: 'RESERVA',
                  },
                ],
              },
            ],
          };
          this.grupos = ret.data[0].gruposFiliales;
          this.grupos.unshift(reserva);
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

  onFiltroGrupoChange($event: GrupoFilial) {
    this.selectedFiltroGrupo = $event;

    this.selectedFiltroUN = null;
    this.selectedFiltroFilial = null;

    this.form.get('unidadNegocioId')?.setValue(null);

    this.filtroUN = $event.unidadesNegocio;
    this.filtroFiliales = [];

    this.grupoId = $event.id.toString();
  }

  onFiltroUNChanged($event: UnidadNegocio) {
    this.selectedFiltroUN = $event;
    this.unidadNegocioId = null;

    if (!$event) {
      return;
    }

    this.unidadNegocioId = $event.id.toString();
  }

  saveConfigMesas() {
    this.alertsService.confirm({
      titulo: 'Distribuir mesa',
      message: '¿Está seguro de reasignar la mesa?',
      okCallback: () => {
        this.eventoService
          .reasignarMesa({
            eventoId: this.eventoId!.toString(),
            idOrigen: this.mesaAReservar.id.toString(),
            cantidadAsignar: this.form.value.cantidadAsignar,
            grupoId: this.grupoId,
            unidadNegocioId: this.unidadNegocioId!,
          })
          .subscribe((data) => {
            if (data.success) {
              this.alertsService.success('Mesa asignada correctamente');
              this.modalService.dismissAll();
              this.mesaAsignada.emit({
                tipoMesaId: this.mesaAReservar.tipoMesaId,
                cantidadAsignada: this.form.value.cantidadAsignar,
              });
            } else {
              this.alertsService.error(data.error);
            }
          });
      },
    });
  }
}

export interface MesaAsignadaData {
  tipoMesaId: number;
  cantidadAsignada: number;
}
