import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlatTreeControl } from '@angular/cdk/tree';

import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import { SelectionModel } from '@angular/cdk/collections';

import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import {
  FlatNode,
  GrupoData,
  ItemDataGrid,
  TreeNode,
} from '../interfaces/events.interface';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventoDto } from 'src/app/core/interfaces/models/evento.dto';
import {
  GrupoPayload,
  IEventoGrupoPayload,
  IEventoUnidadNegocioPayload,
} from 'src/app/core/interfaces/payloads/config.payload';
import { EventoPayload } from 'src/app/core/interfaces/payloads/evento.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { EventoService } from 'src/app/core/services/evento.service';
import { ITipoHabitacion } from '../interfaces/events.interface'; // Import the missing interface
import { ApiReturn } from 'src/app/core/interfaces/payloads/api_return';

@Component({
  selector: 'app-event-config',
  templateUrl: './event-config.component.html',
  styleUrls: ['./event-config.component.scss'],
})
export class EventConfigComponent implements OnInit {
  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private eventoService: EventoService,
    private configService: ConfigService,
    private modalService: NgbModal
  ) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 3);
    this.dataSource.setData(this.treeSelectedGroupsData);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = this.encryptionService.decrypt(id!);
    }

    // subcribirse a los cambios en la selección del treeview
    this.checklistSelection.changed.subscribe((change) => {
      if (this.precargandoFilialSeleccionada) return;

      if (!this.allowEdit) return;

      //obtener solo los cambios de los nodos de level = 2 (Filiales)
      const addedNodes = change.added.filter((node) => node.level === 2);
      const removedNodes = change.removed.filter((node) => node.level === 2);

      if (addedNodes.length > 0) {
        addedNodes.forEach((node) => {
          //this.addFilialToEvent(node.id);
        });
      }
      if (removedNodes.length > 0) {
        const nodeIds = removedNodes.map((node) => node.id);
        //this.removeFilialFromEvent(nodeIds);
        /*         removedNodes.forEach((node) => {
          this.removeFilialFromEvent(node.id);
        }); */
      }
    });
  }

  currentBreadcrumb = 'Nuevo';
  precargandoFilialSeleccionada = false; // variable para controlar si se debe guardar la selección de filiales
  form!: FormGroup;
  formHabitacion!: FormGroup;
  formInvitadosUN!: FormGroup;
  formInvitadosGrupo!: FormGroup;
  eventoId: string | null = null;
  evento: EventoPayload | null = null;
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  listOfGroups: GrupoData[] = []; // los grupos disponibles para seleccionar
  treeAllGroupsData: TreeNode[] = [];
  treeSelectedGroupsData: TreeNode[] = [];
  selectedGroup: GrupoData | null;
  selectedListOfGroups: GrupoData[] = []; // los grupos seleccionados
  groupToEditId: number | null = null;
  selectedGroupId: number | null = null;
  selectedGroupInvitados: number | null = 0;
  treeDataSourceChanged = new Subject<any>();
  setFilialesSeleccionadas = new Subject<any>();
  capacidadDisponible = 0;

  nombreEvento = 'Nuevo evento';

  tiposFormulario: any = [
    {
      id: '1',
      nombre: 'Formulario Convención',
    },
    {
      id: '2',
      nombre: 'Formulario Posada',
    },
  ];

  gruposEvento: IEventoGrupoPayload[] = [];

  // Crear un nuevo Subject que emitirá un valor cuando el componente se destruya
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.nombreEvento = 'Nuevo evento';
    this.initForm();
    this.loadData();
    this.setBreadcrumb();
    this.cargarGruposEvento();

    /*  GRID HABITACIONES */
    //const data: ITipoHabitacion[] = []; // Declare the data variable as an array of ITipoHabitacion objects

    /*     this.listOfDataGrid = data;
    this.updateEditCache();
 */
    this.treeDataSourceChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.dataSource.setData(data);
      });

    this.setFilialesSeleccionadas
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // las acciones realizadas en este método solo deben afectar al UI
        // por lo que no se debe afectar la BD
        // la bandera this.precargandoFilialSeleccionada = true;  evita que se guarden los cambios en la BD

        // preselecciona las filiales en el treeview
        this.precargandoFilialSeleccionada = true; // evitar que se eliminen las filiales seleccionadas de la BD
        //console.log('this.checklistSelection.clear();');
        this.checklistSelection.clear();
        this.precargandoFilialSeleccionada = false;

        if (!data) return;

        data.forEach((filial: any) => {
          let nodoBuscado = null;
          for (let [flatNode, treeNode] of this.flatNodeMap.entries()) {
            if (flatNode.id == Number(filial.id) && flatNode.level == 2) {
              nodoBuscado = flatNode;
              break;
            }
          }

          if (nodoBuscado) {
            this.precargandoFilialSeleccionada = true;
            //console.log('this.checklistSelection.select(nodoBuscado);');
            this.checklistSelection.select(nodoBuscado);
            this.precargandoFilialSeleccionada = false;
          }
        });
      });
    /*  /GRID HABITACIONES */
  }

  ngOnDestroy() {
    // Emitir un valor para que todos los observables se desuscriban
    this.destroy$.next();
    this.destroy$.complete();
  }

  get allowEdit(): boolean {
    if (this.eventoId == null) return true;

    if (this.evento) {
      // Cancelado o cerrado
      if (this.evento?.eventoStatusId == 5 || this.evento?.eventoStatusId == 6)
        return false;

      //if (this.evento!.eventoStatusId > 1) return false;
    }

    return this.eventoId != null;
  }

  get allowSave(): boolean {
    if (this.eventoId == null) return true;

    if (this.evento) {
      // Cancelado o archivado
      if (this.evento?.eventoStatusId == 5 || this.evento?.eventoStatusId == 6)
        return false;
    }

    return this.eventoId != null;
  }

  isCalendarDisabled = (
    date: NgbDate,
    current?: { year: number; month: number }
  ) => !this.allowSave;

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      fechaLimite: ['', [Validators.required]],
      tipoFormulario: ['Completo', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', []],
      capacidadMaxima: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+$')],
      ],
    });

    this.formInvitadosUN = this.fb.group({
      grupoId: ['', [Validators.required]],
      unidadNegocioId: ['', [Validators.required]],
      unidadNegocioName: ['', [Validators.required]],
      invitados: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });

    this.formInvitadosGrupo = this.fb.group({
      grupoId: ['', [Validators.required]],
      grupoName: ['', [Validators.required]],
      invitados: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  setFormData() {
    this.form.get('nombre')?.setValue(this.evento?.nombre);
    this.form.get('tipoFormulario')?.setValue(this.evento?.tipoFormulario);
    this.form.get('capacidadMaxima')?.setValue(this.evento?.capacidadMaxima);

    if (this.evento?.fechaLimite) {
      let fechaLimite = new Date(this.evento.fechaLimite);
      let ngbFechaLimite = {
        year: fechaLimite.getFullYear(),
        month: fechaLimite.getMonth() + 1,
        day: fechaLimite.getDate(),
      };
      this.form.get('fechaLimite')?.setValue(ngbFechaLimite);
    }

    if (this.evento?.fechaInicio) {
      let fechaInicio = new Date(this.evento.fechaInicio);
      let ngbFechaInicio = {
        year: fechaInicio.getFullYear(),
        month: fechaInicio.getMonth() + 1,
        day: fechaInicio.getDate(),
      };
      this.form.get('fechaInicio')?.setValue(ngbFechaInicio);
      this.fromDate = NgbDate.from(ngbFechaInicio);
    }

    if (this.evento?.fechaFin) {
      let fechaFin = new Date(this.evento.fechaFin);
      let ngbFechaFin = {
        year: fechaFin.getFullYear(),
        month: fechaFin.getMonth() + 1,
        day: fechaFin.getDate(),
      };
      this.form.get('fechaFin')?.setValue(ngbFechaFin);
      this.toDate = NgbDate.from(ngbFechaFin);
    }
  }

  loadData() {
    if (this.eventoId) {
      this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.evento = ret.data[0];
            this.capacidadDisponible = this.evento.capacidadMaxima;
            this.setFormData();
            this.cargarArbolDeGrupos();

            this.nombreEvento = this.evento.nombre;
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
      this.cargarArbolDeGrupos();
    }
  }

  cargarArbolDeGrupos() {
    this.configService.getGruposTree().subscribe((data) => {
      this.listOfGroups = [];
      this.selectedListOfGroups = [];
      this.treeSelectedGroupsData = [];
      if (data.success) {
        // Se recorren los grupos obtenidos para añadirlos a la lista de grupos disponibles
        data.data.forEach((grupo) => {
          this.addGroup(grupo);
        });

        var gruposTree: TreeNodeAux[] = data.data
          .map((grupo) => {
            return {
              id: grupo.id,
              name: grupo.nombre,
              nivel: 0,
              children: grupo.UnidadNegocios.map((unidad) => {
                return {
                  id: unidad.id,
                  name: unidad.nombre,
                  nivel: 1,
                  children: unidad.Filiales.map((filial) => {
                    return {
                      id: filial.id,
                      name: filial.nombre,
                      nivel: 2,
                    };
                  }),
                };
              }).filter(
                (unidad) => unidad.children && unidad.children.length > 0
              ), // Filtrar unidades sin hijos
            };
          })
          .filter((grupo) => grupo.children && grupo.children.length > 0); // Filtrar grupos sin hijos

        this.treeAllGroupsData = gruposTree;

        // Se actualiza la lista de grupos disponibles en el dataSource del tree
        this.evento?.grupos.forEach((grupo) => {
          this.selectedGroup = {
            id: grupo.grupoId,
            nombre: grupo.grupo.nombre,
            invitados: grupo.invitados,
          };
          this.moverGrupoSeleccionadoAListaDeGrupos();
        });
        this.selectedGroup = this.listOfGroups[0];

        // enviar al tree las filiales seleccionadas
        this.setFilialesSeleccionadas.next(
          this.evento?.filiales.map((filial) => {
            return {
              id: filial.filialId,
            };
          })
        );
      }
    });
  }

  // Se actualiza el contador de capacidad disponible del evento
  mostrarCapacidadDisponible() {
    const invitadosActuales = this.selectedListOfGroups.reduce(
      (acc, grupo) => acc + grupo.invitados,
      0
    )!;
    this.capacidadDisponible =
      this.evento?.capacidadMaxima! - invitadosActuales;
  }

  addGroup(grupo: GrupoPayload): void {
    this.listOfGroups = [
      ...this.listOfGroups,
      {
        id: grupo.id,
        nombre: grupo.nombre,
        invitados: 0,
      },
    ];
  }

  onSubmit(): void {
    // validar que el form sea valido
    if (this.form.invalid) {
      return;
    }
    if (this.form.get('fechaFin')?.value === null) {
      this.form.get('fechaFin')?.setValue(this.form.get('fechaInicio')?.value);
    }

    try {
      let flimite = new Date(
        this.form.get('fechaLimite')?.value.year,
        this.form.get('fechaLimite')?.value.month - 1,
        this.form.get('fechaLimite')?.value.day
      );

      let finicio = new Date(
        this.form.get('fechaInicio')?.value.year,
        this.form.get('fechaInicio')?.value.month - 1,
        this.form.get('fechaInicio')?.value.day
      );

      let ffin = new Date(
        this.form.get('fechaFin')?.value.year,
        this.form.get('fechaFin')?.value.month - 1,
        this.form.get('fechaFin')?.value.day
      );

      var model: EventoDto = {
        nombre: this.form.get('nombre')?.value,
        fechaInicio: finicio,
        fechaFin: ffin,
        fechaLimite: flimite,
        tipoFormulario: this.form.get('tipoFormulario')?.value,
        capacidadMaxima: this.form.get('capacidadMaxima')?.value,
      };

      if (this.eventoId == null) {
        this.eventoService.addEvent(model).subscribe(
          (ret) => {
            this.eventoId = ret.data.id.toString();
            this.alertsService.success('Evento creado');
            this.ngOnInit();
          },
          (error) => {
            if (error == '') {
              this.alertsService.error('Error al crear evento.');
              return;
            }
            var msg = '';
            if (typeof error === 'string') {
              msg = error;
            } else if (Array.isArray(error)) {
              error.forEach((element: any) => {
                msg += element + '\n';
              });
            }

            this.alertsService.error('Error al crear evento: \n' + msg);
          }
        );
      } else {
        model.id = Number(this.eventoId);
        this.eventoService.updateEvent(model).subscribe(
          (ret) => {
            this.alertsService.success('Evento actualizado');
          },
          (error) => {
            if (error == '') {
              this.alertsService.error('Error al actualizar evento.');
              return;
            }
            var msg = '';
            if (typeof error === 'string') {
              msg = error;
            } else if (Array.isArray(error)) {
              error.forEach((element: any) => {
                msg += element + '\n';
              });
            }

            this.alertsService.error('Error al actualizar el evento: \n' + msg);
          }
        );
      }
    } catch (error) {
      this.alertsService.error('Error al crear evento: ' + error);
    }
  }

  onSelectGroupChange(item: GrupoData) {
    this.selectedGroup = item;
  }

  // Método que se ejecuta al seleccionar un grupo
  onSeleccionarGrupo() {
    if (!this.validarDatosNuevoGrupo()) {
      return;
    }

    this.selectedGroup!.invitados = this.selectedGroupInvitados!;

    this.agregarGrupo(
      this.selectedGroup!.id.toString(),
      this.selectedGroup!.invitados
    );
  }

  agregarGrupo(grupoId: string, invitados: number) {
    this.eventoService
      .addGroupToEvent(this.eventoId!, grupoId, invitados)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Grupo agregado satisfactoriamente');

            this.moverGrupoSeleccionadoAListaDeGrupos();
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

  moverGrupoSeleccionadoAListaDeGrupos() {
    // Se añade el grupo seleccionado a la lista de grupos seleccionados
    this.selectedListOfGroups = [
      ...this.selectedListOfGroups,
      this.selectedGroup!,
    ];

    // buscar el grupo seleccionado en treeGroupsData y agregarlo a treeSelectedGroupsData
    const grupoSeleccionado = this.treeAllGroupsData.find(
      (grupo) => grupo.id === this.selectedGroup!.id
    );
    this.treeSelectedGroupsData.push(grupoSeleccionado!);

    // eliminarlo de treeAllGroupsData
    this.treeAllGroupsData = this.treeAllGroupsData.filter(
      (grupo) => grupo.id !== this.selectedGroup!.id
    );

    // Se actualiza la lista de grupos seleccionados en el dataSource del tree
    this.treeDataSourceChanged.next(this.treeSelectedGroupsData);

    // Se filtra la lista de grupos disponibles para eliminar el grupo que acaba de ser seleccionado
    // Esto se hace para evitar que el mismo grupo pueda ser seleccionado de nuevo
    this.listOfGroups = this.listOfGroups.filter(
      (group) => group.id !== this.selectedGroup!.id
    );

    // Se limpia la variable 'selectedGroupId' para limpiar el grupo seleccionado en la lista
    this.selectedGroupId = null;
    this.selectedGroupInvitados = 0;

    this.mostrarCapacidadDisponible();
  }
  // Método que se ejecuta al hacer click en el botón de agregar grupo
  validarDatosNuevoGrupo() {
    // Si no se ha seleccionado ningún grupo, no se hace nada y se sale de la función
    if (!this.selectedGroup) {
      this.alertsService.error('Debe seleccionar un grupo');

      return false;
    }
    // validar que selectedGroupInvitados (que viene en formato string) sea un número
    if (isNaN(Number(this.selectedGroupInvitados))) {
      this.alertsService.error('Debe ingresar un número entero');
      return false;
    }

    // convertir selectedGroupInvitados a número
    this.selectedGroupInvitados = Number(this.selectedGroupInvitados);

    //validar que selectedGroupInvitados tenga un valor numerico mayor a 0 y que sea un numero entero
    if (
      this.selectedGroupInvitados == null ||
      this.selectedGroupInvitados <= 0 ||
      !Number.isInteger(Number(this.selectedGroupInvitados))
    ) {
      this.alertsService.error('Debe ingresar un número entero mayor a 0');
      return false;
    }
    return true;
  }

  async onRemoveGroup(grupoId: number) {
    await this.alertsService.confirm({
      titulo: 'Eliminar grupo',
      message: '¿Está seguro que desea eliminar el grupo?',
      okCallback: () => {
        this.removeGroup(grupoId);
      },
    });
  }

  async onEditGroup(grupoId: number) {
    await this.alertsService.confirm({
      titulo: 'Eliminar grupo',
      message: '¿Está seguro que desea eliminar el grupo?',
      okCallback: () => {
        this.removeGroup(grupoId);
      },
    });
  }

  removeGroup(grupoId: number) {
    this.eventoService
      .removeGroupFromEvent(this.eventoId!, grupoId.toString())
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Grupo removido satisfactoriamente');
            // buscar el grupo seleccionado de treeSelectedGroupsData y agregarlo a treeAllGroupsData
            const grupoSeleccionado = this.treeSelectedGroupsData.find(
              (grupo) => grupo.id === grupoId
            );
            this.treeAllGroupsData.push(grupoSeleccionado!);
            // removerlo de treeSelectedGroupsData
            this.treeSelectedGroupsData = this.treeSelectedGroupsData.filter(
              (grupo) => grupo.id !== grupoId
            );

            // Se actualiza la lista de grupos seleccionados en el dataSource del tree
            this.treeDataSourceChanged.next(this.treeSelectedGroupsData);

            // Se añade el grupo removido a la lista de grupos disponibles
            this.listOfGroups = [
              ...this.listOfGroups,
              this.selectedListOfGroups.find((group) => group.id === grupoId)!,
            ];

            // Se filtra la lista de grupos seleccionados para eliminar el grupo que se desea remover
            this.selectedListOfGroups = this.selectedListOfGroups.filter(
              (group) => group.id !== grupoId
            );

            this.mostrarCapacidadDisponible();
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

  startEdit(id: number, invitados: number): void {
    this.invitadosActualesGrupo = invitados;
    this.groupToEditId = id;
  }

  stopEdit(index: number): void {
    const i = index;
    const invitados = this.invitadosActualesGrupo;
    setTimeout(() => {
      this.eventoUnidadesNegocio[i].invitados = invitados;

      //this.onCancelInvitadosGrupoEdition(i);
    }, 1000);
  }

  async addFilialToEvent(filiales: any[]) {
    if (!this.allowEdit) return false;
    try {
      const result = await new Promise<boolean>((resolve, reject) => {
        this.eventoService
          .addFilialToEvent(this.eventoId!, filiales)
          .subscribe({
            next: (ret) => {
              if (ret.success) {
                this.cargarGruposEvento();
                this.alertsService.success(
                  'Filial agregada satisfactoriamente'
                );
                resolve(true);
              } else {
                this.alertsService.error(ret.error);
                resolve(false);
              }
            },
            error: (e) => {
              this.alertsService.error(e);
              reject(false);
            },
            complete: () => {},
          });
      });
      return result;
    } catch (error) {
      return false;
    }
  }

  /*  removeFilialFromEvent(filiales: any) {
    this.eventoService
      .removeFilialFromEvent(this.eventoId!, filiales)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.cargarGruposEvento();
            this.alertsService.success('Filial removida satisfactoriamente');
          } else {
            this.alertsService.error(ret.error);
            //this.cargarArbolDeGrupos();
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
  } */
  async removeFilialFromEvent(filiales: any[]): Promise<boolean> {
    if (!this.allowEdit) return false;

    try {
      const result = await new Promise<boolean>((resolve, reject) => {
        this.eventoService
          .removeFilialFromEvent(this.eventoId!, filiales)
          .subscribe({
            next: (ret) => {
              if (ret.success) {
                this.cargarGruposEvento();
                this.alertsService.success(
                  'Filial removida satisfactoriamente'
                );
                resolve(true);
              } else {
                this.alertsService.error(ret.error);
                resolve(false);
              }
            },
            error: (e) => {
              this.alertsService.error(e);
              reject(false);
            },
            complete: () => {},
          });
      });
      return result;
    } catch (error) {
      return false;
    }
  }

  hoveredDate: NgbDate | null = null;

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    this.form.get('fechaInicio')?.setValue(this.fromDate);

    if (this.toDate == null) {
      this.form.get('fechaFin')?.setValue(this.fromDate);
    } else {
      this.form.get('fechaFin')?.setValue(this.toDate);
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  /*  /DATEPICKER RANGE */

  /*  TREE CONTROL */
  private transformer = (node: TreeNode, level: number): FlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.name === node.name
        ? existingNode
        : {
            id: node.id,
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level,
            disabled: !!node.disabled,
          };
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );
  treeFlattener = new NzTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);

  checklistSelection = new SelectionModel<FlatNode>(true, [], true);
  nestedNodeMap = new Map<TreeNode, FlatNode>();
  flatNodeMap = new Map<FlatNode, TreeNode>();

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  descendantsAllSelected(node: FlatNode): boolean {
    if (!this.allowEdit) return false;
    const descendants = this.treeControl.getDescendants(node);
    return (
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child))
    );
  }

  descendantsPartiallySelected(node: FlatNode): boolean {
    //if (!this.allowEdit) return false;
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }
  async itemSelectionToggle(node: FlatNode) {
    //this.checklistSelection.toggle(node);

    const descendants = this.treeControl.getDescendants(node);

    // obtener todas las filiales del nodo seleccionado
    const nivel2Ids = descendants
      .filter((child) => child.level === 2)
      .map((child) => child.id);

    // Si el nodo no está actualmente seleccionado, se agregan todas las filiales
    if (!this.checklistSelection.isSelected(node)) {
      const ret = await this.addFilialToEvent(nivel2Ids);
      if (!ret) return;
    } else {
      // Si el nodo está actualmente seleccionado, se eliminan todas las filiales
      const ret = await this.removeFilialFromEvent(nivel2Ids);
      if (!ret) return;
    }

    this.checklistSelection.toggle(node);

    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  async leafItemSelectionToggle(node: FlatNode) {
    if (!this.allowEdit) return;

    if (node.level != 2) return;

    const nivel2Ids = [node.id];

    if (!this.checklistSelection.isSelected(node)) {
      const ret = await this.addFilialToEvent(nivel2Ids);
      if (!ret) return;
    } else {
      // Si el nodo está actualmente seleccionado, se eliminan todas las filiales
      const ret = await this.removeFilialFromEvent(nivel2Ids);
      if (!ret) return;
    }

    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: FlatNode): void {
    let parent: FlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = node.level;

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  checkRootNodeSelection(node: FlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /*  HABITACIONES GRID */
  /*   editCache: { [key: string]: { edit: boolean; data: ItemDataGrid } } = {};
  listOfDataGrid: ItemDataGrid[] = [];
  listOfDataGridMesas: ItemDataGrid[] = [];

  startEditGrid(id: string): void {
    //this.editCache[id].edit = true;

    // buscar el item en la lista de habitaciones
    const habi = this.listOfDataGrid.find((item) => item.id === id);

    this.setFormTipoHabitacionData(habi!);
  }

  cancelEdit(id: string): void {
    const index = this.listOfDataGrid.findIndex((item) => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfDataGrid[index] },
      edit: false,
    };
  }

  deleteTipoHabitacion(id: string) {
    this.eventoService
      .removeTipoHabitacionFromEvent(this.eventoId!, id)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
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

 */
  /*  /HABITACIONES GRID */

  setBreadcrumb() {
    if (this.router.url.includes('/events/new')) {
      this.currentBreadcrumb = 'Nuevo';
    } else if (this.router.url.includes('/events/configure')) {
      this.currentBreadcrumb = 'Configurar';
    }
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

  async onCancelEvent() {
    await this.alertsService.confirm({
      titulo: 'Cancelar',
      message:
        '¿Está seguro que desea cancelar el evento? Los representantes ya no podrán modificar su información.',
      okCallback: () => {
        this.eventoService.cancelEvent(this.eventoId!).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Evento cancelado');
              this.router.navigate(['/admin/events/list']);
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

  async onArchivarEvento() {
    await this.alertsService.confirm({
      titulo: 'Archivar Evento',
      message:
        '¿Está seguro que desea archivar el evento? Esta acción no se puede deshacer.',
      okCallback: () => {
        this.eventoService.archiveEvent(this.eventoId!).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Evento archivado');
              this.router.navigate(['/admin/events/list']);
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

  async onOpen() {
    await this.alertsService.confirm({
      titulo: 'Abrir evento',
      message: '¿Está seguro que desea abrir el evento?',
      okCallback: () => {
        // validar si se generaron
        this.eventoService.validarAperturaEvento(this.eventoId!).subscribe({
          next: (ret) => {
            if (ret.success) {
              if (ret.data) {
                if (ret.data.valido) {
                  this.abrirEvento();
                } else {
                  if (
                    ret.data.contieneHabitaciones &&
                    !ret.data.habitacionesDistribuidas
                  ) {
                    this.alertsService.error(
                      'Debe distribuir las habitaciones antes de abrir el evento'
                    );
                  } else if (
                    ret.data.contieneMesas &&
                    !ret.data.mesasDistribuidas
                  ) {
                    this.alertsService.error(
                      'Debe distribuir las mesas antes de abrir el evento'
                    );
                  }
                }
              } else {
                this.alertsService.error('Error al validar apertura de evento');
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
      },
    });
  }

  abrirEvento() {
    this.eventoService.openEvent(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.alertsService.success('Evento activado');
          this.router.navigate(['/admin/events/list']);
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

  async onCerrar() {
    await this.alertsService.confirm({
      titulo: 'Cerrar evento',
      message:
        '¿Está seguro que desea cerrar el evento? Los representantes ya no podrán modificar su información.',
      okCallback: () => {
        this.eventoService.closeEvent(this.eventoId!).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Evento cerrado');
              this.router.navigate(['/admin/events/list']);
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

  async onReabrir() {
    await this.alertsService.confirm({
      titulo: 'Reabrir evento',
      message: '¿Está seguro que desea reabrir el evento?',
      okCallback: () => {
        this.eventoService.reopenEvent(this.eventoId!).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Evento reabierto');
              this.router.navigate(['/admin/events/list']);
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

  cargarGruposEvento(showAlert: boolean = false) {
    if (this.eventoId == null) return;
    this.eventoService.getGruposFromEvent(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.gruposEvento = ret.data;
          this.eventoGrupos = null;
          this.eventoUnidadesNegocio = [];
          if (showAlert) {
            this.alertsService.success('Grupos cargados');
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

  eventoUnidadesNegocio: IEventoUnidadNegocioPayload[] = [];
  eventoGrupos: IEventoGrupoPayload | null = null;
  invitadosActualesGrupo: number = 0;

  onEventoGrupoChanged(item: IEventoGrupoPayload) {
    if (item == null) {
      this.eventoGrupos = null;
      this.eventoUnidadesNegocio = [];
      return;
    }

    this.eventoGrupos = item;
    this.eventoUnidadesNegocio = item.unidadesNegocio!;
  }

  onCancelInvitadosGrupoEdition(index: number) {
    this.groupToEditId = null;
    this.eventoUnidadesNegocio[index].invitados = this.invitadosActualesGrupo;
    this.invitadosActualesGrupo = 0;
  }

  onSaveInvitadosGrupoEdition(index: number) {
    const grupoId = this.eventoUnidadesNegocio[index].grupoId;
    const unidadNegocioId = this.eventoUnidadesNegocio[index].unidadNegocioId;
    const invitados = this.eventoUnidadesNegocio[index].invitados;

    // validar que invitados sea un número
    if (isNaN(Number(invitados))) {
      this.alertsService.error('Debe ingresar un número entero');
      return;
    }

    this.eventoService
      .updateInvitadosPorUnidad(
        this.eventoId!,
        grupoId.toString(),
        unidadNegocioId!.toString(),
        invitados
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success(
              'Invitados actualizados satisfactoriamente'
            );
            this.groupToEditId = null;
            this.invitadosActualesGrupo = 0;
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

  currentEditedUnidadNegocio: number | null = null;
  currentEditedGrupo: number | null = null;

  openInvitadosUnidadModal(
    content: TemplateRef<any>,
    data: IEventoUnidadNegocioPayload,
    index: number
  ) {
    this.currentEditedUnidadNegocio = index;
    this.setInvitadosUnidadModalData(index, data);
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {
        this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }

  openInvitadosGrupoModal(
    content: TemplateRef<any>,
    data: GrupoData,
    index: number
  ) {
    this.currentEditedGrupo = index;
    this.setInvitadosGrupoModalData(index, data);
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {
        this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }

  setInvitadosUnidadModalData(
    index: number,
    data: IEventoUnidadNegocioPayload
  ) {
    this.formInvitadosUN
      .get('unidadNegocioName')
      ?.setValue(data.unidadNegocio?.nombre);

    this.formInvitadosUN.get('unidadNegocioId')?.setValue(data.unidadNegocioId);
    this.formInvitadosUN.get('grupoId')?.setValue(data.grupoId);
    this.formInvitadosUN.get('invitados')?.setValue(data.invitados);

    this.formInvitadosUN.get('unidadNegocioName')?.disable();
  }

  setInvitadosGrupoModalData(index: number, data: GrupoData) {
    this.formInvitadosGrupo.get('grupoName')?.setValue(data.nombre);

    this.formInvitadosGrupo.get('grupoId')?.setValue(data.id);
    this.formInvitadosGrupo.get('invitados')?.setValue(data.invitados);

    this.formInvitadosGrupo.get('grupoName')?.disable();
  }

  updateInvitadosPorUN(closeModal: boolean) {
    if (this.formInvitadosUN.invalid) return;

    const grupoId = this.formInvitadosUN.get('grupoId')?.value;
    const unidadNegocioId = this.formInvitadosUN.get('unidadNegocioId')?.value;
    const invitados = this.formInvitadosUN.get('invitados')?.value;

    // validar que invitados sea un número
    if (isNaN(Number(invitados))) {
      this.alertsService.error('Debe ingresar un número entero');
      return;
    }

    this.eventoService
      .updateInvitadosPorUnidad(
        this.eventoId!,
        grupoId.toString(),
        unidadNegocioId!.toString(),
        invitados
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success(
              'Invitados actualizados satisfactoriamente'
            );
            this.groupToEditId = null;
            this.invitadosActualesGrupo = 0;

            this.eventoUnidadesNegocio[
              this.currentEditedUnidadNegocio!
            ].invitados = invitados;

            this.currentEditedUnidadNegocio = null;

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

  updateInvitadosPorGrupo(closeModal: boolean) {
    if (this.formInvitadosGrupo.invalid) return;

    const grupoId = this.formInvitadosGrupo.get('grupoId')?.value;
    const invitados = this.formInvitadosGrupo.get('invitados')?.value;

    // validar que invitados sea un número
    if (isNaN(Number(invitados))) {
      this.alertsService.error('Debe ingresar un número entero');
      return;
    }

    this.eventoService
      .updateInvitadosPorGrupo(this.eventoId!, grupoId.toString(), invitados)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success(
              'Invitados actualizados satisfactoriamente'
            );
            this.groupToEditId = null;
            this.invitadosActualesGrupo = 0;

            this.selectedListOfGroups[this.currentEditedGrupo!].invitados =
              invitados;

            this.currentEditedGrupo = null;

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

  reporteRooming() {
    this.eventoService.reporteRooming(this.eventoId!).subscribe({
      next: (ret: ApiReturn<string[]>) => {
        if (ret.success) {
          const csvContent = ret.data.join('\n');
          const blob = new Blob([`\uFEFF${csvContent}`], {
            type: 'text/csv;charset=utf-8;',
          });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'reporte_roomie.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.alertsService.success('Reporte generado');
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

interface TreeNodeAux {
  id: number;
  name: string;
  nivel: number;
  children?: TreeNodeAux[];
}
