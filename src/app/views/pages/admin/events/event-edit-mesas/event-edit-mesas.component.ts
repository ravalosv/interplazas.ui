import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';
import { ITipoMesaXGrupoPayload } from 'src/app/core/interfaces/models/evento.dto';
import {
  GrupoFilial,
  grupoEvento,
  EventoPayload,
} from 'src/app/core/interfaces/payloads/evento.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { EventoService } from 'src/app/core/services/evento.service';
import {
  IInvitado,
  IDroppedItem,
  ResumenMesasPayload,
} from '../interfaces/events.interface';
import { SharedService } from '../services/shared.service';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CSVService, Tipo } from '../services/csv.service';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
  selector: 'app-event-edit-mesas',
  templateUrl: './event-edit-mesas.component.html',
  styleUrls: ['./event-edit-mesas.component.scss'],
})
export class EventEditMesasComponent implements OnInit {
  @ViewChild('treeInvitados') treeSelect: NzTreeSelectComponent;
  @ViewChild('lstGrupos') lstGrupos: NgSelectComponent;

  isLoading: boolean = false;
  invitadosMaximos = 0;
  invitadosActuales = 0;
  readOnlyMode = false;
  invitadoEditar: string | null = null;
  eventoId: string | null = '';
  listaInvitados: IInvitado[] = [];
  listaMesas: ITipoMesaXGrupoPayload[] = []; // IHabitacion[] = [];
  listaMesasFiltrada: ITipoMesaXGrupoPayload[] = []; // IHabitacion[] = [];
  filtroGrupos: GrupoFilial[];
  selectedFiltroGrupo: any | null = null;
  grupos: grupoEvento[] = [];
  mesaTreeSelectedValue: string[] = ['-1']; // selecciona el nodo "Todos" por default
  invitadoTreeSelectedValue: string[] = ['-1']; // selecciona el nodo "Todos" por default
  evento: EventoPayload | null = null;

  currentUser: IUser;

  nodesMesas: Array<{
    title: string;
    key: string;
    isLeaf: boolean;
    children: Array<any>;
  }> = [];

  nodesInvitados: Array<{
    title: string;
    key: string;
    isLeaf: boolean;
    children: Array<any>;
  }> = [];

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private modalService: NgbModal,
    private encryptionService: EncryptionService,
    private authService: AuthenticationService,
    private sharedService: SharedService,
    private csvService: CSVService
  ) {}

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id');
    this.eventoId = this.encryptionService.decrypt(this.eventoId!);

    this.loadData();

    this.sharedService.invitadoGuardado.subscribe((invitado) => {
      this.onInvitadoSaved(invitado);
    });

    this.sharedService.invitadoEliminado.subscribe((invitado) => {
      this.onInvitadoDeleted(invitado);
    });

    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user!;
    });
  }

  distribucionMesaUrl: string = '';

  loadData() {
    if (this.eventoId) {
      this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.evento = ret.data[0];

            if (this.evento.distribucionMesasFile) {
              this.distribucionMesaUrl = `${environment.fotosUrl}/${this.evento.distribucionMesasFile}`;
            }

            this.grupos = this.evento.grupos;

            this.filtroGrupos = this.evento.gruposFiliales;

            // cargar el primer grupo de la lista y filtrar por ese grupo
            this.lstGrupos.select({
              label: this.filtroGrupos[0].nombre.toString(),
            });

            this.selectedFiltroGrupo = this.filtroGrupos[0].id;

            this.onFiltroGrupoChange(this.filtroGrupos[0]);

            // poner formulario en modo de solo lectura si está cerrado o cancelado
            if (this.currentUser.user.role !== 'admin') {
              const statusReadOnlyMode = [3, 5, 6];
              this.readOnlyMode = statusReadOnlyMode.includes(
                this.evento.eventoStatusId
              );
            } else {
              const statusReadOnlyMode = [5, 6];
              this.readOnlyMode = statusReadOnlyMode.includes(
                this.evento.eventoStatusId
              );
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
    } else {
    }
  }

  openBasicModal(content: TemplateRef<any>, $event: any) {
    if ($event == null) {
      this.invitadoEditar = null;
    } else {
      this.invitadoEditar = $event.id;
    }
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'xl' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  openImageWindow() {
    window.open(this.distribucionMesaUrl, '_blank');
  }

  droppedItem($event: IDroppedItem) {
    this.mostrarResultado('droppedItem', $event);

    var invitado = this.obtenerInvitadoListaOrigen($event);

    // quitar el item de la lista origen
    this.quitarItemListaOrigen($event);

    // agregar el item a la lista destino
    this.agregarInvitadoADestino($event, invitado);
  }

  mostrarResultado(mensaje: string, mensaje2: any) {
    // console.log(mensaje, mensaje2);
  }

  obtenerInvitadoListaOrigen($event: IDroppedItem) {
    // Obtener el item de la lista origen
    // verificar si la lista origen es invitados o mesas
    if ($event.originType === 'invitado') {
      return this.listaInvitados.find(
        (invitado) => invitado.id === $event.originItemId.id
      )!;
    } else {
      // buscar $event.originItemId.id dentro de todas las mesas
      const mesa = this.listaMesas.find((mesa) => {
        return mesa.invitados.find(
          (invitado) => invitado.id === $event.originItemId.id
        );
      });

      // buscar la mesa en la lista de mesas
      /*       const mesa = this.listaMesas.find(
        (mesa) => mesa.id.toString() === $event.originId
      ); */

      // buscar el invitado en la lista de invitados de la mesa
      return mesa!.invitados.find(
        (invitado) => invitado.id === $event.originItemId.id
      )!;
    }
  }

  quitarItemListaOrigen($event: IDroppedItem) {
    // verificar si la lista origen es invitados o mesas
    if ($event.originType === 'invitado') {
      const index = this.listaInvitados.findIndex(
        (invitado) => invitado.id === $event.originItemId.id
      );
      this.listaInvitados.splice(index, 1);

      this.onInvitadosFilterChanged([]);
      this.mostrarResultado(
        '(resultado) Se quitó de lista de invitados:',
        this.listaInvitados
      );
    } else {
      const mesa = this.obtenerMesaDelInvitado($event);

      // quitar al invitado de la mesa
      const index = mesa!.invitados.findIndex(
        (invitado) => invitado.id === $event.originItemId.id
      );
      mesa!.invitados.splice(index, 1);

      if (mesa!.invitados.length == 0) {
        // cambiar el id de la habitación a un numero negativo
        mesa!.id = mesa!.id * -1;
      }

      this.mostrarResultado('(resultado) Se quitó de mesa:', mesa);
    }
  }

  agregarInvitadoADestino($event: IDroppedItem, invitado: IInvitado) {
    this.isLoading = true;
    // verificar si la lista destino es invitados o mesas
    if ($event.destinationType === 'invitado') {
      this.eventoService
        .removeInvitadoFromMesa(this.eventoId!, invitado.id!.toString())
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.listaInvitados.push(invitado);
              this.sharedService.changeListaInvitadosMesas(this.listaInvitados);
              this.mostrarResultado(
                '(resultado) Se agregó a lista de invitados:',
                this.listaInvitados
              );
              //this.onFiltroGrupoChange(this.currentGrupo!);
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.alertsService.error(e);
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    } else {
      var parts = $event.destinationId.split('|');
      const originId = $event.originId;
      const mesaId = parts[0];
      const tipoMesaId = parts[1];
      const unidadNegocioId = parts[2];
      const confirmedOverCapacity = $event.confirmedOverCapacity;

      this.eventoService
        .addInvitadoToMesa(
          this.eventoId!,
          invitado.id!.toString(),
          mesaId,
          tipoMesaId,
          unidadNegocioId,
          confirmedOverCapacity
        )
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              // obtener la habitación destino
              const mesa = this.listaMesas.find(
                (mesa) => mesa.id.toString() === mesaId
              );

              mesa!.id = ret.data.habDestId;
              mesa!.invitados.push(invitado);

              //this.onFiltroGrupoChange(this.currentGrupo!);
              this.mostrarResultado('(resultado) Se agregó a mesa:', mesa);
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.alertsService.error(e);
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    }
  }
  onInvitadosFilterChanged($event: string[]): void {
    var t = this.treeSelect.selectedNodes;

    this.sharedService.changeFiltroInvitadosMesas(t);
  }

  obtenerMesaDelInvitado(event: IDroppedItem) {
    return this.listaMesas.find((mesa) =>
      mesa.invitados.find((inv) => inv.id === event.originItemId.id)
    );
  }

  getModalTitle() {
    return this.invitadoEditar == null ? 'Agregar invitado' : 'Editar invitado';
  }

  onInvitadoDeleted($event: any) {
    this.reloadInvitados($event);
  }

  reloadInvitados(data: any) {
    if (this.filtroGrupos == null) return;

    var grupo = this.filtroGrupos.find(
      (g) => g.id.toString() == this.selectedFiltroGrupo
    );

    this.onFiltroGrupoChange(grupo!);

    if (data == null) return;
    this.invitadosActuales = data.actuales;
  }

  currentGrupo: any = null;
  onFiltroGrupoChange($event: GrupoFilial) {
    this.currentGrupo = $event;
    if ($event == null) return;

    this.loadMesaXGrupo($event.id.toString());
    this.loadInvitados($event.id.toString());

    this.cargarFiltroInvitados($event.id.toString());

    var g = this.grupos.find((g) => g.grupoId == $event.id);

    this.invitadosMaximos = g!.invitados;
  }

  loadMesaXGrupo(grupoId: string) {
    this.listaMesas = [];
    this.isLoading = true;
    this.eventoService
      .getTipoMesaXGrupo(this.eventoId!, grupoId)
      .pipe(
        map((ret) => {
          if (ret.success) {
            // Ordena los datos si la operación fue exitosa
            ret.data.sort((a: any, b: any) => {
              if (a.actual < b.actual) return 1;

              if (a.actual > b.actual) return -1;
              // Compara primero por tipoMesa.descripcion
              if (a.tipoMesa.descripcion < b.tipoMesa.descripcion) return -1;
              if (a.tipoMesa.descripcion > b.tipoMesa.descripcion) return 1;
              // Si tipoMesa.descripcion es igual, entonces compara por numero
              return b.numero - a.numero;
            });
          }
          return ret; // Retorna el objeto modificado
        })
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.listaMesas = ret.data;
            this.listaMesasFiltrada = ret.data;

            this.cargarFiltroMesas();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  loadInvitados(grupoId: string) {
    this.listaInvitados = [];
    this.isLoading = true;
    this.eventoService.getInvitadoXGrupo(this.eventoId!, grupoId).subscribe({
      next: (ret) => {
        if (ret.success) {
          ret.data.map((invitado) => {
            if (
              invitado.tipoMesaGrupoId === null ||
              invitado.tipoMesaGrupoId === 0
            ) {
              this.listaInvitados.push({
                id: invitado.id,
                nombre: invitado.nombre,
                edad: invitado.edad,
                mesa: '',
                grupoId: invitado.grupoId,
                unidadNegocioId: invitado.unidadNegocioId,
                filialId: invitado.filialId,
              });
            }
          });

          this.invitadosActuales = ret.data.length;
          this.sharedService.changeListaInvitadosMesas(this.listaInvitados);
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  cargarFiltroMesas() {
    this.convertToMesasTreeNodes();
  }

  convertToMesasTreeNodes() {
    this.nodesMesas = [];
    this.mesaTreeSelectedValue = ['-1'];

    var nodeTodos = {
      title: 'Todas las mesas',
      key: `-1`,
      isLeaf: false,
      children: Array<any>(),
    };

    this.nodesMesas.push(nodeTodos);

    nodeTodos.children.push({
      title: 'Mesas vacias',
      key: `-2`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Mesas ocupadas',
      key: `-3`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Mesas llenas',
      key: `-4`,
      isLeaf: true,
      children: Array<any>(),
    });

    // obtener un listado con los diferentes tipos de mesas

    this.listaMesas.forEach((element: ITipoMesaXGrupoPayload) => {
      var found = nodeTodos.children.find(
        (n) => n.key == element.tipoMesaId.toString()
      );

      if (found == null) {
        var node = {
          title: element.tipoMesa.descripcion,
          key: element.tipoMesaId.toString(),
          isLeaf: true,
          children: Array<any>(),
        };

        nodeTodos.children.push(node);
      }
    });
  }

  cargarFiltroInvitados(grupoId: string) {
    var grupo = this.filtroGrupos.filter((g) => g.id.toString() === grupoId);

    this.convertToInvitadosTreeNodes(grupo);
  }

  convertToInvitadosTreeNodes(data: GrupoFilial[]) {
    this.nodesInvitados = [];
    this.invitadoTreeSelectedValue = ['-1'];

    var nodeTodos = {
      title: 'Todas las unidades',
      key: `-1`,
      isLeaf: false,
      children: Array<any>(),
    };

    this.nodesInvitados.push(nodeTodos);

    data.forEach((element: any) => {
      element.unidadesNegocio.forEach((un: any) => {
        var unNode = {
          title: un.nombre,
          key: `u-${un.id.toString()}`,
          isLeaf: false,
          children: Array<any>(),
        };

        nodeTodos.children!.push(unNode);

        un.filiales.forEach((fil: any) => {
          var filNode = {
            title: fil.nombre,
            key: `f-${fil.id.toString()}`,
            isLeaf: true,
            children: Array<any>(),
          };

          unNode.children!.push(filNode);
        });
      });
    });
  }

  onInvitadoSaved($event: any) {
    this.reloadInvitados($event);
  }

  onMesasFilterChanged($event: any[]): void {
    this.listaMesasFiltrada = [];

    if ($event.length == 0) return;

    const listaInterna: ITipoMesaXGrupoPayload[] = [];

    $event.forEach((f: any) => {
      if (f == '-1') {
        // Todas las mesas
        listaInterna.push(...this.listaMesas);
        return;
      }
      if (f == '-2') {
        // Mesas vacias
        listaInterna.push(
          ...this.listaMesas.filter((h) => h.invitados.length == 0)
        );
      }

      if (f == '-3') {
        // Mesas ocupadas
        listaInterna.push(
          ...this.listaMesas.filter(
            (h) => h.invitados.length > 0 && h.invitados.length < h.maximo
          )
        );
      }

      if (f == '-4') {
        // Mesas llenas
        listaInterna.push(
          ...this.listaMesas.filter((h) => h.invitados.length == h.maximo)
        );
      }

      listaInterna.push(
        ...this.listaMesas.filter((h) => h.tipoMesaId.toString() == f)
      );
    });

    // remover de la lista estandar si hay mesas duplicadas
    const listaDuplicados: ITipoMesaXGrupoPayload[] = [];

    listaDuplicados.push(...listaInterna);

    listaDuplicados.forEach((h) => {
      var items = listaInterna.filter(
        (l) => l.id.toString() === h.id.toString()
      );

      if (items.length > 1) {
        var index = listaInterna.findIndex(
          (l) => l.id.toString() === h.id.toString()
        );
        if (index != -1) {
          listaInterna.splice(index, 1);
        }
      }
    });

    this.listaMesasFiltrada = listaInterna;
  }

  resumenMesas: ResumenMesasPayload[] = [];

  openResumenMesas(content: TemplateRef<any>) {
    this.eventoService.getResumenMesas(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.resumenMesas = ret.data;
          this.openLayoutModal(content);
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

  openLayoutModal(content: TemplateRef<any>) {
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'lg' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  downloadReporteMesas() {
    this.csvService.descargarCSV(
      Tipo.ResumenMesas,
      this.resumenMesas,
      'reporte_mesas'
    );
  }
}
