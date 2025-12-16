import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  IDroppedItem,
  IHabitacion,
  IInvitado,
  IOcupationDateEvent,
} from '../../interfaces/events.interface';
import { ITipoHabitacionXGrupoPayload } from 'src/app/core/interfaces/models/evento.dto';
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import {
  grupoEvento,
  GrupoFilial,
  UnidadNegocio,
} from 'src/app/core/interfaces/payloads/evento.payload';
import {
  EventoAccionesEnum,
  EventoService,
} from 'src/app/core/services/evento.service';
import { ApiReturn } from 'src/app/core/interfaces/payloads/api_return';

@Component({
  selector: 'app-evento-habitacion',
  templateUrl: './habitacion.component.html',
  styleUrls: ['./habitacion.component.scss'],
})
export class HabitacionComponent implements OnInit {
  @Input() habitacion: ITipoHabitacionXGrupoPayload; //IHabitacion;
  @Input() readOnlyMode: boolean = false;
  @Input() grupoActual: any;
  @Input() grupos: GrupoFilial[];
  @Output() droppedItemEvent = new EventEmitter<IDroppedItem>();
  @Output() setOcupationDateEvent = new EventEmitter<IOcupationDateEvent>();
  @Output() editEvent = new EventEmitter<IInvitado>();

  listaInvitados: IInvitado[] = [];
  isDragging: any;
  habId: string;
  currentUser: IUser | null = null;

  form: FormGroup;

  unidadesNegocio: UnidadNegocio[];
  grupoDest: string | null = null;
  unidadNegocioDest: string | null = null;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private alertsService: AlertsService,
    private eventoService: EventoService
  ) {}

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    //console.log('Grupos', this.grupos);
    this.habId = this.habitacion.id.toString();

    this.listaInvitados = this.habitacion.invitados;

    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user!;
    });

    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async drop(event: CdkDragDrop<IInvitado[]>) {
    var confirmedOverCapacity = false;
    this.isDragging = false;

    if (this.habitacion.maximo <= this.habitacion.invitados.length) {
      if (this.currentUser?.user.tipoUsuarioId !== 1) return;

      const result = await this.confirmOverCapacity();
      if (!result) {
        return;
      }
      confirmedOverCapacity = true;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // avisar a el componente padre que se ha movido un item
      this.droppedItemEvent.emit({
        originType:
          event.previousContainer.id == 'invitados' ? 'invitado' : 'habitacion',
        originId: event.previousContainer.id,
        originItemId: event.previousContainer.data[event.previousIndex],
        destinationType: 'habitacion',
        destinationId: `${
          this.habitacion.id //event.container.id
        }|${this.habitacion.tipoHabitacionId.toString()}|${this.habitacion.unidadNegocioId.toString()}`,
        confirmedOverCapacity,
      });
    }
  }

  async confirmOverCapacity(): Promise<boolean> {
    const result = await new Promise<boolean>((resolve, reject) => {
      this.alertsService.confirm({
        titulo: 'Habitación con sobrecupo',
        message:
          'La habitación tiene más invitados de los permitidos. ¿Desea continuar?',
        okCallback: () => resolve(true),
        noCallback: () => resolve(false),
      });
    });

    return result;
  }

  dragEntered($event: any) {
    this.isDragging = true;
  }

  dragExited($event: any) {
    this.isDragging = false;
  }
  // convierte la lista de invitados (IInvitados) en una lista de strings
  generarListaInvitados() {
    /*     this.habitacion.invitados.forEach((invitado) => {
      this.listaInvitados.push(invitado);
    }); */
  }

  validateMaxCapacity(item: any) {
    if (this.habitacion == undefined) {
      return true;
    }

    if (this.habitacion.maximo > this.habitacion.invitados.length) {
      return true;
    } else {
      return false;
    }
  }

  onClick(invitado: IInvitado) {
    this.editEvent.emit(invitado);
  }

  cambiarFechaOcupacion(content: TemplateRef<any>) {
    if (
      this.habitacion.fechaOcupacionInicio != null &&
      this.habitacion.fechaOcupacionFin != null
    ) {
      let fechaOcupacionInicio = new Date(this.habitacion.fechaOcupacionInicio);
      let ngbFechaIni = {
        year: fechaOcupacionInicio.getFullYear(),
        month: fechaOcupacionInicio.getMonth() + 1,
        day: fechaOcupacionInicio.getDate(),
      };

      let fechaOcupacionFin = new Date(this.habitacion.fechaOcupacionFin);
      let ngbFechaFin = {
        year: fechaOcupacionFin.getFullYear(),
        month: fechaOcupacionFin.getMonth() + 1,
        day: fechaOcupacionFin.getDate(),
      };

      this.form.get('fechaOcupacionInicio')?.setValue(ngbFechaIni);
      this.form.get('fechaOcupacionFin')?.setValue(ngbFechaFin);
    } else {
      this.form.reset();
    }
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'md' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  showMoverHabitacionDeGrupoDialog(content: TemplateRef<any>) {
    if (
      this.habitacion.fechaOcupacionInicio != null &&
      this.habitacion.fechaOcupacionFin != null
    ) {
      let fechaOcupacionInicio = new Date(this.habitacion.fechaOcupacionInicio);
      let ngbFechaIni = {
        year: fechaOcupacionInicio.getFullYear(),
        month: fechaOcupacionInicio.getMonth() + 1,
        day: fechaOcupacionInicio.getDate(),
      };

      let fechaOcupacionFin = new Date(this.habitacion.fechaOcupacionFin);
      let ngbFechaFin = {
        year: fechaOcupacionFin.getFullYear(),
        month: fechaOcupacionFin.getMonth() + 1,
        day: fechaOcupacionFin.getDate(),
      };

      this.form.get('fechaOcupacionInicio')?.setValue(ngbFechaIni);
      this.form.get('fechaOcupacionFin')?.setValue(ngbFechaFin);
    } else {
      this.form.reset();
    }
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'md' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  initForm() {
    this.form = this.fb.group(
      {
        fechaOcupacionInicio: [null, [Validators.required]],
        fechaOcupacionFin: [null, [Validators.required]],
      },
      {
        validators: this.dateLessThan(
          'fechaOcupacionInicio',
          'fechaOcupacionFin'
        ),
      }
    );
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let requTrans = group.controls['requiereTransporte']?.value;
      if (requTrans == false) {
        return {};
      }

      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value && t.value) {
        let startDate = new Date(f.value.year, f.value.month - 1, f.value.day);
        let endDate = new Date(t.value.year, t.value.month - 1, t.value.day);
        if (startDate > endDate) {
          return {
            dates: 'Rango de fechas inválido',
          };
        }
      }
      return {};
    };
  }

  guardarFechaOcupacion(mismaQueElEvento: boolean = false) {
    var fechaOcupacionInicio: Date | null = null;
    var fechaOcupacionFin: Date | null = null;

    if (!mismaQueElEvento) {
      fechaOcupacionInicio = new Date(
        this.form.get('fechaOcupacionInicio')?.value.year,
        this.form.get('fechaOcupacionInicio')?.value.month - 1,
        this.form.get('fechaOcupacionInicio')?.value.day
      );

      fechaOcupacionFin = new Date(
        this.form.get('fechaOcupacionFin')?.value.year,
        this.form.get('fechaOcupacionFin')?.value.month - 1,
        this.form.get('fechaOcupacionFin')?.value.day
      );
    }

    this.habitacion.fechaOcupacionInicio = fechaOcupacionInicio;
    this.habitacion.fechaOcupacionFin = fechaOcupacionFin;

    this.setOcupationDateEvent.emit({
      habitacionId: this.habitacion.id,
      tipoHabitacionId: this.habitacion.tipoHabitacionId,
      unidadNegocioId: this.habitacion.unidadNegocioId,
      fechaOcupacionInicio: fechaOcupacionInicio,
      fechaOcupacionFin: fechaOcupacionFin,
    });
  }

  onGrupoToMoveChange($event: number) {
    const g = this.grupos.find((g) => g.id == $event);
    this.unidadesNegocio = g!.unidadesNegocio;
    this.unidadNegocioDest = null;
  }

  moverHabitacionDeGrupo() {
    if (this.grupoDest == null) {
      return;
    }
    if (this.grupoDest == this.grupoActual.id) {
      return;
    }

    if (this.unidadNegocioDest == null) {
      return;
    }

    this.eventoService
      .moveHabitacionToGrupo(
        this.habitacion.eventoId.toString(),
        this.habitacion.grupoId.toString(),
        this.habitacion.unidadNegocioId.toString(),
        this.grupoDest,
        this.unidadNegocioDest,
        this.habitacion.tipoHabitacionId.toString()
      )
      .subscribe({
        next: (ret: ApiReturn<string[]>) => {
          if (ret.success) {
            this.alertsService.success('Habitación movida correctamente');
            this.eventoService.enviarAccion(
              EventoAccionesEnum.RecargarHabitaciones
            );
            this.modalService.dismissAll();
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
}
