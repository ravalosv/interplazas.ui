import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IInvitadoToEventoPayload } from 'src/app/core/interfaces/models/evento.dto';
import {
  GrupoFilial,
  UnidadNegocio,
  Filial,
  EventoPayload,
} from 'src/app/core/interfaces/payloads/evento.payload';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { EventoService } from 'src/app/core/services/evento.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-event-invitado-edit',
  templateUrl: './invitado-edit.component.html',
  styleUrls: ['./invitado-edit.component.scss'],
})
export class InvitadoEditComponent implements OnInit {
  @Input() grupoFilial: GrupoFilial[];
  @Input() eventoId: string;
  @Input() invitadoId: string | null = null;
  @Input() readOnlyMode: boolean;

  filtroGrupos: GrupoFilial[];
  filtroUN: UnidadNegocio[];
  filtroFiliales: Filial[] | null = null;
  selectedFiltroGrupo: GrupoFilial | null = null;
  selectedFiltroUN: any;
  selectedFiltroFilial: any;

  evento: EventoPayload;
  eventos: EventoPayload[] = [];
  selectedEvento: EventoPayload;

  form: FormGroup;

  requiereTransporte: boolean = false;
  requiereHospedaje: boolean = true;
  relacionarEvento: boolean = false;

  // se utiliza para saber si relacionarEvento cambió en la edición del invitado
  relacionarEventoOri: boolean = false;
  shouldEventoRelacionadoBeEnabled: boolean = true;

  grupoId: string;
  unidadNegocioId: string | null = null;
  lugaresDisponibles: number = 0;

  currentUser: IUser | null;

  tipoFormulario = '1';

  tipoInvitadoOptions: any = [
    {
      id: 'Colaborador',
      nombre: 'Colaborador',
    },
    {
      id: 'Externo',
      nombre: 'Externo',
    },
  ];

  rangoEdadOptions: any = [
    {
      id: 'Adulto',
      nombre: 'Adulto',
    },
    {
      id: 'JR',
      nombre: 'JR (de 12 a 17 años)',
    },
    {
      id: 'Menor',
      nombre: 'Menor (de 6 a 11 años)',
    },
    {
      id: 'Infante',
      nombre: 'Infante (de 0 a 5 años)',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private sharedService: SharedService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.filtroGrupos = this.grupoFilial;
    this.initForm();
    this.loadData();

    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });
  }

  loadData() {
    if (this.invitadoId) {
      this.eventoService
        .getInvitadoById(this.eventoId.toString(), this.invitadoId.toString())
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.setFormValues(ret.data[0]);
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

    // cargar datos del evento actual
    this.eventoService.getEventos('activos', this.eventoId).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.evento = ret.data[0];
          this.tipoFormulario = this.evento.tipoFormulario;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });

    // cargar eventos para relacionar
    this.eventoService.getEventos('activos').subscribe({
      next: (ret) => {
        if (ret.success) {
          this.eventos = ret.data;
          // remover el evento actual
          this.eventos = this.eventos.filter(
            (item) => item.id.toString() != this.eventoId
          );
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

  initForm() {
    this.form = this.fb.group(
      {
        grupoId: [null, [Validators.required]],
        unidadNegocioId: [null, [Validators.required]],
        filialId: [null, [Validators.required]],
        nombre: ['', [Validators.required]],
        fechaIngreso: [
          { value: '', disabled: true },
          [Validators.pattern(/^\d{4}$/)],
        ],
        edad: ['', [Validators.required]],
        tipoInvitado: ['', [Validators.required]],
        requiereTransporte: [false, []],
        requiereHospedaje: [false, []],
        origen: [{ value: '', disabled: true }, []],
        destino: [{ value: '', disabled: true }, []],
        comentarios: ['', []],
        participaEnRifa: [false, []],
        creditoSolarum: [false, []],
        fechaHospedajeInicio: [{ value: null, disabled: true }, []],
        fechaHospedajeFin: [{ value: null, disabled: true }, []],
        relacionarConOtroEvento: [false, []],
        eventoRelacionadoId: [{ value: null, disabled: true }, []],
        fechaEstanciaInicio: [{ value: null, disabled: true }, []],
        fechaEstanciaFin: [{ value: null, disabled: true }, []],
      },
      {
        validators: [
          this.dateLessThan(
            'fechaEstanciaInicio',
            'fechaEstanciaFin',
            'requiereTransporte'
          ),
          this.dateLessThan(
            'fechaHospedajeInicio',
            'fechaHospedajeFin',
            'requiereHospedaje'
          ),
        ],
      }
    );

    this.form.get('tipoInvitado')?.valueChanges.subscribe((value) => {
      const control = this.form.get('fechaIngreso')!;
      if (value === 'Colaborador') {
        control.enable();
        control.setValidators([
          Validators.required,
          Validators.pattern(/^\d{4}$/),
        ]);
      } else {
        control.disable();
        control.setValue(null);
        control.setValidators([]);
      }

      control?.updateValueAndValidity();
    });

    this.form.get('requiereTransporte')?.valueChanges.subscribe((value) => {
      const fields = [
        'origen',
        'destino',
        'fechaEstanciaInicio',
        'fechaEstanciaFin',
      ];

      this.requiereTransporte = value;

      fields.forEach((field) => {
        const control = this.form.get(field);
        if (value) {
          control?.setValidators([Validators.required]);
          control?.enable();
        } else {
          control?.setValidators([]);
          control?.disable();
        }
        control?.updateValueAndValidity();
      });
    });

    this.form.get('requiereHospedaje')?.valueChanges.subscribe((value) => {
      const fields = ['fechaHospedajeInicio', 'fechaHospedajeFin'];

      this.requiereHospedaje = value;

      fields.forEach((field) => {
        const control = this.form.get(field);
        if (value) {
          control?.setValidators([Validators.required]);
          control?.enable();
        } else {
          control?.setValidators([]);
          control?.disable();
        }
        control?.updateValueAndValidity();
      });
    });

    this.form
      .get('relacionarConOtroEvento')
      ?.valueChanges.subscribe((value) => {
        this.habilitarEventoRelacionado();
      });
  }

  setFormValues(invitado: IInvitadoToEventoPayload) {
    let grupo = this.grupoFilial.find((item) => item.id === invitado.grupoId);
    this.onFiltroGrupoChange(grupo!);

    let un = this.filtroUN.find((item) => item.id === invitado.unidadNegocioId);
    this.onFiltroUNChanged(un!);

    this.form.get('grupoId')?.setValue(invitado.grupoId);
    this.form.get('unidadNegocioId')?.setValue(invitado.unidadNegocioId);
    this.form.get('filialId')?.setValue(invitado.filialId);
    this.form.get('nombre')?.setValue(invitado.nombre);
    this.form.get('requiereTransporte')?.setValue(invitado.requiereTransporte);
    this.form.get('origen')?.setValue(invitado.origen);
    this.form.get('destino')?.setValue(invitado.destino);
    this.form.get('comentarios')?.setValue(invitado.comentarios);
    this.form.get('participaEnRifa')?.setValue(invitado.participaEnRifa);
    this.form.get('creditoSolarum')?.setValue(invitado.creditoSolarum);
    this.form.get('requiereHospedaje')?.setValue(invitado.requiereHospedaje);

    this.form
      .get('fechaHospedajeInicio')
      ?.setValue(invitado.fechaHospedajeInicio);
    this.form.get('fechaHospedajeFin')?.setValue(invitado.fechaHospedajeFin);

    this.form
      .get('relacionarConOtroEvento')
      ?.setValue(invitado.relacionarConOtroEvento);
    this.form
      .get('eventoRelacionadoId')
      ?.setValue(invitado.eventoRelacionadoId);
    this.form
      .get('fechaEstanciaInicio')
      ?.setValue(invitado.fechaEstanciaInicio);
    this.form.get('fechaEstanciaFin')?.setValue(invitado.fechaEstanciaFin);
    this.form.get('edad')?.setValue(invitado.edad);
    this.form.get('tipoInvitado')?.setValue(invitado.tipoInvitado);
    this.form.get('fechaIngreso')?.setValue(invitado.fechaIngreso);

    //this.requiereTransporte = invitado.requiereTransporte;

    if (invitado.fechaEstanciaInicio) {
      let fechaEstanciaInicio = new Date(invitado.fechaEstanciaInicio);
      let ngbFecha = {
        year: fechaEstanciaInicio.getFullYear(),
        month: fechaEstanciaInicio.getMonth() + 1,
        day: fechaEstanciaInicio.getDate(),
      };
      this.form.get('fechaEstanciaInicio')?.setValue(ngbFecha);
    }

    if (invitado.fechaEstanciaFin) {
      let fechaEstanciaFin = new Date(invitado.fechaEstanciaFin);
      let ngbFecha = {
        year: fechaEstanciaFin.getFullYear(),
        month: fechaEstanciaFin.getMonth() + 1,
        day: fechaEstanciaFin.getDate(),
      };
      this.form.get('fechaEstanciaFin')?.setValue(ngbFecha);
    }

    if (invitado.fechaHospedajeInicio) {
      let fechaHospedajeInicio = new Date(invitado.fechaHospedajeInicio);
      let ngbFecha = {
        year: fechaHospedajeInicio.getFullYear(),
        month: fechaHospedajeInicio.getMonth() + 1,
        day: fechaHospedajeInicio.getDate(),
      };
      this.form.get('fechaHospedajeInicio')?.setValue(ngbFecha);
    }

    if (invitado.fechaHospedajeFin) {
      let fechaHospedajeFin = new Date(invitado.fechaHospedajeFin);
      let ngbFecha = {
        year: fechaHospedajeFin.getFullYear(),
        month: fechaHospedajeFin.getMonth() + 1,
        day: fechaHospedajeFin.getDate(),
      };
      this.form.get('fechaHospedajeFin')?.setValue(ngbFecha);
    }

    this.relacionarEventoOri = invitado.relacionarConOtroEvento;

    if (invitado.relacionarConOtroEvento) {
      this.form.get('eventoRelacionadoId')?.disable();
      this.shouldEventoRelacionadoBeEnabled = false;
    }

    if (this.readOnlyMode) {
      this.form.disable();
    }
  }

  dateLessThan(from: string, to: string, key: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let requTrans = group.controls[key]?.value;
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
            dates:
              'La fecha de inicio debe ser menor o igual a la fecha de fin',
          };
        }
      }
      return {};
    };
  }

  habilitarEventoRelacionado() {
    const c2 = this.form.get('relacionarConOtroEvento')?.value;

    const control = this.form.get('eventoRelacionadoId');

    if (c2 && this.shouldEventoRelacionadoBeEnabled) {
      control?.setValidators([Validators.required]);
      control?.enable();
    } else {
      control?.setValidators([]);
      control?.disable();
    }

    control?.updateValueAndValidity();
  }

  /*   onRequiereTransporte($event: any) {
    this.requiereTransporte = $event.target!.checked;
  } */

  onRelacionarEvento($event: any) {
    this.relacionarEvento = $event.target!.checked;
  }

  onFiltroGrupoChange($event: GrupoFilial) {
    this.selectedFiltroGrupo = $event;

    this.selectedFiltroUN = null;
    this.selectedFiltroFilial = null;

    this.form.get('unidadNegocioId')?.setValue(null);
    this.form.get('filialId')?.setValue(null);

    this.filtroUN = $event.unidadesNegocio;
    this.filtroFiliales = [];

    this.grupoId = $event.id.toString();
  }

  onFiltroUNChanged($event: UnidadNegocio) {
    this.selectedFiltroUN = $event;

    this.selectedFiltroFilial = null;
    this.filtroFiliales = null;
    this.unidadNegocioId = null;

    this.form.get('filialId')?.setValue(null);

    if (!$event) {
      return;
    }

    this.filtroFiliales = $event.filiales;

    this.unidadNegocioId = $event.id.toString();

    this.obtenerContadorInvitadosPorUnidad();
  }

  onFiltroFilialChange($event: Filial) {
    this.selectedFiltroFilial = $event;
  }

  onEventoRelacionadoChange($event: EventoPayload) {
    this.selectedEvento = $event;
  }

  obtenerContadorInvitadosPorUnidad() {
    this.eventoService
      .obtenerContadorInvitadosPorUnidad(
        this.eventoId,
        this.grupoId,
        this.unidadNegocioId!
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.lugaresDisponibles = ret.data.invitados - ret.data.actuales;
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

  async guardar(closeModal: boolean) {
    if (this.form.invalid) {
      return;
    }

    if (!this.invitadoId) {
      // verificar si se debe relacionar con otro evento
      if (this.form.get('relacionarConOtroEvento')?.value) {
        this.alertsService.confirm({
          titulo: 'Invitado',
          message:
            '¿Está seguro de relacionar este invitado con otro evento? se creará un nuevo invitado con los mismos datos en el evento seleccionado.',
          okCallback: () => {
            this._guardarInvitado(closeModal, false);
          },
          noCallback: () => {
            return;
          },
        });
      } else {
        this._guardarInvitado(closeModal, false);
      }
    } else {
      // verificar si el valor de relacionConOtroEvento cambió
      if (
        this.form.get('relacionarConOtroEvento')?.value !=
        this.relacionarEventoOri
      ) {
        // verificar si se debe relacionar con otro evento
        if (this.form.get('relacionarConOtroEvento')?.value) {
          this.alertsService.confirm({
            titulo: 'Invitado',
            message:
              '¿Está seguro de relacionar este invitado con otro evento? se creará un nuevo invitado con los mismos datos en el evento seleccionado.',
            okCallback: () => {
              this._guardarInvitado(closeModal, false);
            },
            noCallback: () => {
              return;
            },
          });
        } else {
          this.alertsService.confirm({
            titulo: 'Invitado',
            message:
              '¿Está seguro seguro de que quiere quitar la relación de este invitado con el otro evento?.',
            okCallback: () => {
              this._guardarInvitado(closeModal, false);
            },
            noCallback: () => {
              return;
            },
          });
        }
      } else {
        this._guardarInvitado(closeModal, false);
      }
    }
  }

  async confirmOverCapacity(): Promise<boolean> {
    const result = await new Promise<boolean>((resolve, reject) => {
      this.alertsService.confirm({
        titulo: 'Confirme sobrecupo',
        message:
          'Se excederá la cantidad de invitados configurados para el grupo. ¿Desea continuar?',
        okCallback: () => resolve(true),
        noCallback: () => resolve(false),
      });
    });

    return result;
  }

  _guardarInvitado(closeModal: boolean, confirmOverCapacity: boolean) {
    const model = {
      ...this.form.value,
      eventoId: this.eventoId,
    };

    if (model.fechaEstanciaInicio) {
      model.fechaEstanciaInicio = new Date(
        this.form.get('fechaEstanciaInicio')?.value.year,
        this.form.get('fechaEstanciaInicio')?.value.month - 1,
        this.form.get('fechaEstanciaInicio')?.value.day
      );
    } else {
      model.fechaEstanciaInicio = null;
    }

    if (model.fechaEstanciaFin) {
      model.fechaEstanciaFin = new Date(
        this.form.get('fechaEstanciaFin')?.value.year,
        this.form.get('fechaEstanciaFin')?.value.month - 1,
        this.form.get('fechaEstanciaFin')?.value.day
      );
    } else {
      model.fechaEstanciaFin = null;
    }

    if (model.fechaHospedajeInicio) {
      model.fechaHospedajeInicio = new Date(
        this.form.get('fechaHospedajeInicio')?.value.year,
        this.form.get('fechaHospedajeInicio')?.value.month - 1,
        this.form.get('fechaHospedajeInicio')?.value.day
      );
    } else {
      model.fechaHospedajeInicio = null;
    }

    if (model.fechaHospedajeFin) {
      model.fechaHospedajeFin = new Date(
        this.form.get('fechaHospedajeFin')?.value.year,
        this.form.get('fechaHospedajeFin')?.value.month - 1,
        this.form.get('fechaHospedajeFin')?.value.day
      );
    } else {
      model.fechaHospedajeFin = null;
    }

    if (!this.invitadoId) {
      this.eventoService
        .addInvitadoToEvent(
          this.eventoId!.toString(),
          model,
          confirmOverCapacity
        )
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.lugaresDisponibles =
                ret.data.maximoPorUnidad - ret.data.actualesPorUnidad;
              this.sharedService.changeInvitadoGuardado(ret.data);
              //this.onInvitadoSaved.emit(ret.data);
              this.alertsService.success(
                'Invitado agregado satisfactoriamente'
              );

              this._prepararParaNuevoInvitado();

              if (closeModal) {
                this.modalService.dismissAll('actualizado');
              }
            } else {
              if (
                ret.error.includes('máximo de invitados') &&
                this.currentUser?.user.role == 'admin'
              ) {
                this.confirmOverCapacity().then((res) => {
                  if (res) {
                    this._guardarInvitado(closeModal, true);
                  }
                });
              } else {
                this.alertsService.error(ret.error);
              }
            }
          },
          error: (e) => {
            this.alertsService.error(e);
          },
          complete: () => {},
        });
    } else {
      this.eventoService
        .updateInvitadoToEvent(
          this.eventoId!.toString(),
          this.invitadoId.toString(),
          model
        )
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.sharedService.changeInvitadoGuardado(null);

              //this.onInvitadoSaved.emit();

              this.alertsService.success(
                'Invitado actualizado satisfactoriamente'
              );

              this._prepararParaNuevoInvitado();

              if (closeModal) {
                this.modalService.dismissAll('actualizado');
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
  }

  _prepararParaNuevoInvitado() {
    this.invitadoId = null;
    this.form.get('nombre')?.setValue('');
    this.form.get('fechaIngreso')?.setValue(null);
    this.form.get('edad')?.setValue(null);
    this.form.get('tipoInvitado')?.setValue('');
    this.form.get('requiereTransporte')?.setValue(false);
    this.form.get('requiereHospedaje')?.setValue(false);
    this.form.get('requiere')?.setValue(false);
    this.form.get('origen')?.setValue(null);
    this.form.get('destino')?.setValue(null);
    this.form.get('comentarios')?.setValue('');
    this.form.get('participaEnRifa')?.setValue(false);
    this.form.get('relacionarEvento')?.setValue(false);
    this.form.get('relacionarEventoId')?.setValue(null);
    this.form.get('fechaEstanciaInicio')?.setValue(null);
    this.form.get('fechaEstanciaFin')?.setValue(null);
    this.form.get('fechaHospedajeInicio')?.setValue(null);
    this.form.get('fechaHospedajeFin')?.setValue(null);

    this.requiereTransporte = false;
    this.requiereHospedaje = false;
    this.relacionarEvento = false;

    this.form.get('relacionarEvento')?.updateValueAndValidity();
    this.form.get('relacionarEventoId')?.updateValueAndValidity();
  }

  eliminar() {
    this.alertsService.confirm({
      titulo: 'Invitado',
      message: '¿Está seguro de eliminar este invitado?',
      okCallback: () => {
        this.eventoService
          .deleteInvitadoFromEvent(
            this.eventoId!.toString(),
            this.invitadoId!.toString()
          )
          .subscribe({
            next: (ret: any) => {
              if (ret.success) {
                this.sharedService.changeInvitadoEliminado(ret.data);
                this.alertsService.success(
                  'Invitado eliminado satisfactoriamente'
                );
                this.modalService.dismissAll('eliminado');
              } else {
                this.alertsService.error(ret.error);
              }
            },
            error: (e: any) => {
              this.alertsService.error(e);
            },
            complete: () => {},
          });
      },
      noCallback: () => {
        return;
      },
    });
  }
}
