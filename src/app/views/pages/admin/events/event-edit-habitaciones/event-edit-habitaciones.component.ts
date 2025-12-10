import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import {
  EventoAccionesEnum,
  EventoService,
} from 'src/app/core/services/evento.service';
import { SharedService } from '../services/shared.service';
import {
  IDroppedItem,
  IInvitado,
  IOcupationDateEvent,
  ResumenHabitacionesPayload,
} from '../interfaces/events.interface';
import {
  IResumenPorEdad,
  ITipoHabitacionXGrupoPayload,
} from 'src/app/core/interfaces/models/evento.dto';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';
import {
  EventoPayload,
  grupoEvento,
  GrupoFilial,
} from 'src/app/core/interfaces/payloads/evento.payload';
import { ActivatedRoute } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { CSVService, Tipo } from '../services/csv.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IUser } from 'src/app/core/interfaces/user.type';
import { ApiReturn } from 'src/app/core/interfaces/payloads/api_return';

@Component({
  selector: 'app-event-edit-habitaciones',
  templateUrl: './event-edit-habitaciones.component.html',
  styleUrls: ['./event-edit-habitaciones.component.scss'],
})
export class EventEditHabitacionesComponent implements OnInit {
  @ViewChild('treeInvitados') treeSelect: NzTreeSelectComponent;
  @ViewChild('lstGrupos') lstGrupos: NgSelectComponent;

  isLoading: boolean = false;
  invitadosMaximos = 0;
  invitadosActuales = 0;
  readOnlyMode = false;
  invitadoEditar: string | null = null;
  eventoId: string | null = '';
  listaInvitados: IInvitado[] = [];
  listaHabitaciones: ITipoHabitacionXGrupoPayload[] = []; // IHabitacion[] = [];
  listaHabitacionesFiltrada: ITipoHabitacionXGrupoPayload[] = []; // IHabitacion[] = [];
  filtroGrupos: GrupoFilial[];
  selectedFiltroGrupo: any | null = null;
  grupos: grupoEvento[] = [];
  habitacionTreeSelectedValue: string[] = ['-1']; // selecciona el nodo "Todos" por default
  invitadoTreeSelectedValue: string[] = ['-1']; // selecciona el nodo "Todos" por default
  evento: EventoPayload | null = null;

  nodesHabitaciones: Array<{
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

  public archivos: File[] = [];
  loading: boolean = false;
  nuevoArchivoCargado: boolean = false;

  seExcedeCapacidadInvitadosBatch: boolean = false;

  tipoFormulario: string = '1';
  currentUser: IUser;

  private subscriptions: Subscription[] = [];

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

    this.subscriptions.push(
      this.sharedService.invitadoGuardado.subscribe((invitado) => {
        this.onInvitadoSaved(invitado);
      })
    );

    this.subscriptions.push(
      this.sharedService.invitadoEliminado.subscribe((invitado) => {
        this.onInvitadoDeleted(invitado);
      })
    );

    this.subscriptions.push(
      this.authService.currentUser.subscribe((user) => {
        this.currentUser = user!;
      })
    );

    this.subscriptions.push(
      this.eventoService.accionObservable.subscribe({
        next: (accion) => {
          // Realizar algo con la acción
          if (accion === EventoAccionesEnum.RecargarHabitaciones) {
            this.reloadInvitados(null);
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  loadData() {
    if (this.eventoId) {
      this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.evento = ret.data[0];
            this.grupos = this.evento.grupos;

            this.tipoFormulario = this.evento.tipoFormulario;

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
              //this.readOnlyMode = false;
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
    // verificar si la lista origen es invitados o habitaciones
    if ($event.originType === 'invitado') {
      return this.listaInvitados.find(
        (invitado) => invitado.id === $event.originItemId.id
      )!;
    } else {
      // buscar $event.originItemId.id dentro de todas las habitaciones
      const habitacion = this.listaHabitaciones.find((habitacion) => {
        return habitacion.invitados.find(
          (invitado) => invitado.id === $event.originItemId.id
        );
      });

      // buscar el invitado en la lista de invitados de la habitacion
      return habitacion!.invitados.find(
        (invitado) => invitado.id === $event.originItemId.id
      )!;
    }
  }

  quitarItemListaOrigen($event: IDroppedItem) {
    // verificar si la lista origen es invitados o habitaciones
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
      const habitacion = this.obtenerHabitacionDelInvitado($event);

      // quitar al invitado de la habitacion
      const index = habitacion!.invitados.findIndex(
        (invitado) => invitado.id === $event.originItemId.id
      );
      habitacion!.invitados.splice(index, 1);

      if (habitacion!.invitados.length == 0) {
        // cambiar el id de la habitación a un numero negativo
        habitacion!.id = habitacion!.id * -1;
      }

      this.mostrarResultado('(resultado) Se quitó de habitación:', habitacion);
    }
  }

  agregarInvitadoADestino($event: IDroppedItem, invitado: IInvitado) {
    this.isLoading = true;
    // verificar si la lista destino es invitados o habitaciones
    if ($event.destinationType === 'invitado') {
      this.eventoService
        .removeInvitadoFromHabitacion(this.eventoId!, invitado.id!.toString())
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.listaInvitados.push(invitado);
              this.sharedService.changeListaInvitadosHabitaciones(
                this.listaInvitados
              );

              //this.onFiltroGrupoChange(this.currentGrupo!);

              this.mostrarResultado(
                '(resultado) Se agregó a lista de invitados:',
                this.listaInvitados
              );
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
      const habitacionId = parts[0];
      const tipoHabitacionId = parts[1];
      const unidadNegocioId = parts[2];
      const confirmedOverCapacity = $event.confirmedOverCapacity;

      this.eventoService
        .addInvitadoToHabitacion(
          this.eventoId!,
          invitado.id!.toString(),
          habitacionId,
          tipoHabitacionId,
          unidadNegocioId,
          confirmedOverCapacity
        )
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              // obtener la habitación destino
              const habitacion = this.listaHabitaciones.find(
                (habitacion) => habitacion.id.toString() === habitacionId
              );

              habitacion!.id = ret.data.habDestId;
              habitacion!.invitados.push(invitado);

              this.mostrarResultado(
                '(resultado) Se agregó a habitación:',
                habitacion
              );
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

    this.sharedService.changeFiltroInvitadosHabitaciones(t);
  }

  obtenerHabitacionDelInvitado(event: IDroppedItem) {
    return this.listaHabitaciones.find((habitacion) =>
      habitacion.invitados.find((inv) => inv.id === event.originItemId.id)
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

    this.invitadosActuales = data?.actuales;
  }

  currentGrupo: any = null;
  onFiltroGrupoChange($event: GrupoFilial) {
    this.currentGrupo = $event;
    if ($event == null) return;

    this.loadHabitacionXGrupo($event.id.toString());
    this.loadInvitados($event.id.toString());

    this.cargarFiltroInvitados($event.id.toString());

    var g = this.grupos.find((g) => g.grupoId == $event.id);

    this.invitadosMaximos = g!.invitados;
  }

  loadHabitacionXGrupo(grupoId: string) {
    this.listaHabitaciones = [];
    this.isLoading = true;
    this.eventoService
      .getTipoHabitacionXGrupo(this.eventoId!, grupoId)
      .pipe(
        map((ret) => {
          if (ret.success) {
            // Ordena los datos si la operación fue exitosa
            ret.data.sort((a: any, b: any) => {
              if (a.actual < b.actual) return 1;

              if (a.actual > b.actual) return -1;

              // Compara primero por tipoHabitacion.nombre
              if (a.tipoHabitacion.descripcion < b.tipoHabitacion.descripcion)
                return -1;
              if (a.tipoHabitacion.descripcion > b.tipoHabitacion.descripcion)
                return 1;
              // Si tipoHabitacion.nombre es igual, entonces compara por numero
              return b.numero - a.numero;
            });
          }
          return ret; // Retorna el objeto modificado
        })
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.listaHabitaciones = ret.data;
            this.listaHabitacionesFiltrada = ret.data;

            this.cargarFiltroHabitaciones();
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
              invitado.tipoHabitacionGrupoId === null ||
              invitado.tipoHabitacionGrupoId === 0
            ) {
              this.listaInvitados.push({
                id: invitado.id,
                nombre: invitado.nombre,
                edad: invitado.edad,
                habitacion: '',
                grupoId: invitado.grupoId,
                unidadNegocioId: invitado.unidadNegocioId,
                filialId: invitado.filialId,
              });
            }
          });

          this.invitadosActuales = ret.data.length;
          this.sharedService.changeListaInvitadosHabitaciones(
            this.listaInvitados
          );
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

  cargarFiltroHabitaciones() {
    this.convertToHabitacionesTreeNodes();
  }

  convertToHabitacionesTreeNodes() {
    this.nodesHabitaciones = [];
    this.habitacionTreeSelectedValue = ['-1'];

    var nodeTodos = {
      title: 'Todas las habitaciones',
      key: `-1`,
      isLeaf: false,
      children: Array<any>(),
    };

    this.nodesHabitaciones.push(nodeTodos);

    nodeTodos.children.push({
      title: 'Habitaciones vacias',
      key: `-2`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Habitaciones ocupadas',
      key: `-3`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Habitaciones llenas',
      key: `-4`,
      isLeaf: true,
      children: Array<any>(),
    });

    // obtener un listado con los diferentes tipos de habitaciones

    this.listaHabitaciones.forEach((element: any) => {
      var found = nodeTodos.children.find(
        (n) => n.key == element.tipoHabitacionId.toString()
      );

      if (found == null) {
        var node = {
          title: element.tipoHabitacion.tipoHabitacion,
          key: element.tipoHabitacionId.toString(),
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

  onHabitacionesFilterChanged($event: any[]): void {
    this.listaHabitacionesFiltrada = [];

    if ($event.length == 0) return;

    const listaInterna: ITipoHabitacionXGrupoPayload[] = [];

    $event.forEach((f: any) => {
      if (f == '-1') {
        // Todas las habitaciones
        listaInterna.push(...this.listaHabitaciones);
        return;
      }
      if (f == '-2') {
        // Habitaciones vacias
        listaInterna.push(
          ...this.listaHabitaciones.filter((h) => h.invitados.length == 0)
        );
      }

      if (f == '-3') {
        // Habitaciones ocupadas
        listaInterna.push(
          ...this.listaHabitaciones.filter(
            (h) => h.invitados.length > 0 && h.invitados.length < h.maximo
          )
        );
      }

      if (f == '-4') {
        // Habitaciones llenas
        listaInterna.push(
          ...this.listaHabitaciones.filter(
            (h) => h.invitados.length == h.maximo
          )
        );
      }

      listaInterna.push(
        ...this.listaHabitaciones.filter(
          (h) => h.tipoHabitacionId.toString() == f
        )
      );
    });

    // remover de la lista estandar si hay habitaciones duplicadas
    const listaDuplicados: ITipoHabitacionXGrupoPayload[] = [];

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

    this.listaHabitacionesFiltrada = listaInterna;
  }

  capturarFile(event: any) {
    const archivoCapturado = event.target.files[0];

    if (archivoCapturado) {
      this.archivos.length = 0;
      this.archivos.push(archivoCapturado);

      this.nuevoArchivoCargado = true;
    }
    this.erroresValidacion = [];
    this.listoParaCargar = false;
  }

  erroresValidacion: string[] = [];
  listoParaCargar = false;
  invitados: IInvitadoBatch[] = [];

  subirArchivo() {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contenido = e.target?.result as string;
        const lineas = contenido
          .split('\n')
          .filter((linea) => linea.trim() !== '');

        if (this.tipoFormulario == '1') {
          var campos = [
            'Nombre',
            'RangoEdad',
            'TipoInvitado',
            'AñoIngreso',
            'Grupo',
            'Unidad',
            'Filial',
            'Comentario',
            'ParticipaEnRifa',
          ];
        } else {
          var campos = [
            'Nombre',
            'RangoEdad',
            'TipoInvitado',
            'AñoIngreso',
            'Grupo',
            'Unidad',
            'Filial',
            'Comentario',
            'ParticipaEnRifa',
            'CreditoSolarum',
            'RequiereHospedaje',
            'FechaHospedajeInicio',
            'FechaHospedajeFin',
          ];
        }

        this.erroresValidacion = [];
        var numLinea = 0;

        lineas.slice(1).forEach((linea) => {
          numLinea++;

          // Función para dividir la línea respetando las comillas
          const parsearLinea = (str: string) => {
            const resultado = [];
            let actual = '';
            let entreComillas = false;

            for (let i = 0; i < str.length; i++) {
              if (str[i] === '"' && str[i + 1] === '"') {
                actual += '"';
                i++;
              } else if (str[i] === '"') {
                entreComillas = !entreComillas;
              } else if (str[i] === ',' && !entreComillas) {
                resultado.push(actual.trim());
                actual = '';
              } else {
                actual += str[i];
              }
            }
            resultado.push(actual.trim());
            return resultado;
          };

          const columnas = parsearLinea(linea);

          if (columnas.length === campos.length) {
            const objeto: IInvitadoBatch = campos.reduce(
              (obj, campo, index) => {
                obj[campo] = columnas[index].replace(/(^"|"$)/g, '').trim();
                return obj;
              },
              {} as IInvitadoBatch
            );

            // Validaciones
            var success = this.validarLinea(numLinea, objeto);

            if (success) {
              this.invitados.push(objeto);
            }
          } else {
            console.error(`Error en línea ${numLinea}:`, linea);
            this.erroresValidacion.push(
              `\nLínea ${numLinea}: Formato inválido o cantidad incorrecta de columnas`
            );
          }
        });

        this.seExcedeCapacidadInvitadosBatch = false;

        if (this.erroresValidacion.length !== 0) {
          this.erroresValidacion = this.erroresValidacion.map((error, i) =>
            i === 0 ? error.replace(/^\n/, '') : error
          );
          this.listoParaCargar = false;
        } else {
          // validar que la cantidad de invitados a cargar no exceda la cantidad máxima de invitados
          if (this.invitadosActuales + numLinea > this.invitadosMaximos) {
            this.erroresValidacion.push(
              `\nLa cantidad de invitados a cargar excede la cantidad máxima de invitados permitidos\nNuevos: ${numLinea}\nActuales: ${
                this.invitadosActuales
              }\nMáximos: ${this.invitadosMaximos}\nSe excede por: ${
                numLinea + this.invitadosActuales - this.invitadosMaximos
              }`
            );

            if (this.currentUser?.user.role == 'admin') {
              this.listoParaCargar = true;
              this.sustituirValores();
              this.seExcedeCapacidadInvitadosBatch = true;
            } else {
              this.listoParaCargar = false;
            }
          } else {
            this.sustituirValores();
            this.listoParaCargar = true;
          }
        }
      };
      reader.readAsText(this.archivos[0]);
    } catch (e) {
      this.loading = false;
      this.alertsService.error('Error al subir archivo');
    }
  }

  sustituirValores() {
    this.invitados.forEach((invitado: IInvitadoBatch) => {
      const grupo = this.filtroGrupos.filter(
        (g) =>
          g.nombre.toString().toLowerCase() === invitado.Grupo.toLowerCase()
      )[0];

      invitado.Grupo = grupo.id.toString();

      const unidad = grupo.unidadesNegocio.filter(
        (u) =>
          u.nombre.toString().toLowerCase() === invitado.Unidad.toLowerCase()
      )[0];

      invitado.Unidad = unidad.id.toString();

      const filial = unidad.filiales.filter(
        (f) =>
          f.nombre.toString().toLowerCase() === invitado.Filial.toLowerCase()
      )[0];

      invitado.Filial = filial.id.toString();

      invitado.ParticipaEnRifa =
        invitado.ParticipaEnRifa.toLowerCase() === 'si' ? '1' : '0';
      invitado.CreditoSolarum =
        invitado.CreditoSolarum.toLowerCase() === 'si' ? '1' : '0';
      invitado.RequiereHospedaje =
        invitado.RequiereHospedaje.toLowerCase() === 'si' ? '1' : '0';

      invitado.FechaHospedajeInicio = this.convertirFechaStringADate(
        invitado.FechaHospedajeInicio
      );
      invitado.FechaHospedajeFin = this.convertirFechaStringADate(
        invitado.FechaHospedajeFin
      );
    });
  }

  convertirFechaStringADate(fechaString: string): Date | null {
    const partes = fechaString.split('/');
    if (partes.length !== 3) {
      return null; // Formato incorrecto
    }

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Los meses en JavaScript son 0-11
    const anio = parseInt(partes[2], 10) + 2000; // Ajustar el año

    return new Date(anio, mes, dia);
  }

  validarLinea(numLinea: number, objeto: IInvitadoBatch) {
    const contInicial = this.erroresValidacion.length;
    if (!objeto.Nombre)
      this.erroresValidacion.push(`\nLínea: ${numLinea} - Nombre es requerido`);

    if (
      !objeto.RangoEdad ||
      ![`adulto`, `jr`, 'menor', 'infante'].includes(
        objeto.RangoEdad.toLowerCase()
      )
    ) {
      this.erroresValidacion.push(
        `\nLínea: ${numLinea} - Rango de edad es requerido y debe ser "Adulto", "JR", "Menor" o "Infante"`
      );
    }

    if (
      !objeto.TipoInvitado ||
      ![`Colaborador`, `Externo`].includes(objeto.TipoInvitado)
    ) {
      this.erroresValidacion.push(
        `\nLínea: ${numLinea} - TipoInvitado es requerido y debe ser "Colaborador" o "Externo"`
      );
    }
    if (objeto.TipoInvitado === `Colaborador`) {
      if (!objeto.AñoIngreso || !/^\d{4}$/.test(objeto.AñoIngreso)) {
        this.erroresValidacion.push(
          `\nLínea: ${numLinea} - Año de Ingreso es requerido y debe ser un número de 4 dígitos`
        );
      }
    } else {
      objeto.AñoIngreso = ``;
    }
    var grupo = null;
    var unidad = null;
    var filial = null;
    if (!objeto.Grupo)
      this.erroresValidacion.push(`\nLínea: ${numLinea} - Grupo es requerido`);
    else {
      grupo = this.filtroGrupos.filter(
        (g) =>
          g.nombre.toString().toLowerCase() === objeto.Grupo.toLocaleLowerCase()
      );
      if (grupo.length === 0) {
        this.erroresValidacion.push(
          `\nLínea: ${numLinea} - Grupo ${objeto.Grupo} no existe o no tiene permisos para cargar invitados`
        );
      }
    }
    if (!objeto.Unidad)
      this.erroresValidacion.push(`\nLínea: ${numLinea} - Unidad es requerida`);
    else {
      if (grupo!.length > 0) {
        unidad = grupo![0].unidadesNegocio.filter(
          (u) =>
            u.nombre.toString().toLowerCase() ===
            objeto.Unidad.toLocaleLowerCase()
        );
        if (unidad.length === 0) {
          this.erroresValidacion.push(
            `\nLínea: ${numLinea} - Unidad: ${objeto.Unidad} no existe en el grupo: ${objeto.Grupo}`
          );
        }
      }
    }
    if (!objeto.Filial)
      this.erroresValidacion.push(`\nLínea: ${numLinea} - Filial es requerida`);
    else {
      if (unidad != null && unidad!.length > 0) {
        filial = unidad![0].filiales.filter(
          (f) =>
            f.nombre.toString().toLowerCase() === objeto.Filial.toLowerCase()
        );
        if (filial.length === 0) {
          this.erroresValidacion.push(
            `\nLínea: ${numLinea} - Filial: ${objeto.Filial}  no existe en la unidad: ${objeto.Unidad} `
          );
        }
      }
    }

    if (
      !objeto.ParticipaEnRifa ||
      ![`si`, `no`].includes(objeto.ParticipaEnRifa.toLowerCase())
    ) {
      this.erroresValidacion.push(
        `\nLínea: ${numLinea} - "Participa en Rifa" es requerido y debe ser "Si", o "No"`
      );
    }

    // validar si el tipo de formulario es 2 - Formulario Posada
    if (this.tipoFormulario === '2') {
      if (
        !objeto.CreditoSolarum ||
        ![`si`, `no`].includes(objeto.CreditoSolarum.toLowerCase())
      ) {
        this.erroresValidacion.push(
          `\nLínea: ${numLinea} - CreditoSolarum es requerido y debe ser "Si" o "No"`
        );
      }

      if (objeto.RequiereHospedaje.toLowerCase() === `si`) {
        if (!/^\d{2}\/\d{2}\/\d{2}$/.test(objeto.FechaHospedajeInicio)) {
          this.erroresValidacion.push(
            `\nLínea: ${numLinea} - Inicio Hospedaje debe estar en formato dd/mm/aa`
          );
        }
        if (!/^\d{2}\/\d{2}\/\d{2}$/.test(objeto.FechaHospedajeFin)) {
          this.erroresValidacion.push(
            `\nLínea: ${numLinea} - Fin Hospedaje debe estar en formato dd/mm/aa`
          );
        }
      } else {
        objeto.FechaHospedajeInicio = '';
        objeto.FechaHospedajeFin = '';
      }
    } else {
      objeto.CreditoSolarum = '';
      objeto.RequiereHospedaje = '';
      objeto.FechaHospedajeInicio = '';
      objeto.FechaHospedajeFin = '';
    }

    if (contInicial === this.erroresValidacion.length) {
      return true; // No hay errores
    } else {
      return false; // Hay errores
    }
  }

  basicModalCloseResult: string = '';
  openLoadInvitadosLayout(content: TemplateRef<any>) {
    this.nuevoArchivoCargado = false;
    this.resultadoCargaInvitados = [];
    this.erroresValidacion = [];
    this.listoParaCargar = false;
    this.invitados = [];

    this.openLayoutModal(content);
  }

  resumenHabitaciones: ResumenHabitacionesPayload[] = [];

  openResumenHabitaciones(content: TemplateRef<any>) {
    this.loading = true;
    this.eventoService.getResumenHabitaciones(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.resumenHabitaciones = ret.data;
          this.openLayoutModal(content);
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  reporteListaInvitados() {
    this.eventoService.getInvitadosFromEvent(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.csvService.descargarCSV(
            Tipo.ListaInvitados,
            ret.data,
            'ListaInvitados'
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

  reporteResumenPorEdad() {
    this.eventoService.getInvitadosResumenPorEdad(this.eventoId!).subscribe({
      next: (ret) => {
        if (ret.success) {
          const data = ret.data;

          const tabulated = this.transformDataReportePorGrupoEdad(data);
          this.csvService.descargarCSV(
            Tipo.InvitadoPorGrupoEdad,
            tabulated,
            'InvitadosPorGrupoEdad'
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

  transformDataReportePorGrupoEdad(
    rawData: IResumenPorEdad[]
  ): TabulatedData[] {
    // Primero, agrupamos por nombre
    const groupedByName = rawData.reduce((acc, curr) => {
      const nombre = curr.nombre!;
      if (!acc[nombre]) {
        // Inicializamos con todas las categorías en 0
        acc[nombre] = {
          nombre: nombre,
          Adulto: 0,
          JR: 0,
          Menor: 0,
          Infante: 0,
        };
      }
      // Actualizamos el valor correspondiente
      acc[nombre][curr.edad as keyof Omit<TabulatedData, 'nombre'>] =
        curr.count!;
      return acc;
    }, {} as { [key: string]: TabulatedData });

    // Convertimos el objeto a array y nos aseguramos que todas las categorías existan
    return Object.values(groupedByName).map((row) => ({
      nombre: row.nombre,
      Adulto: row.Adulto || 0,
      JR: row.JR || 0,
      Menor: row.Menor || 0,
      Infante: row.Infante || 0,
    }));
  }

  openLayoutModal(content: TemplateRef<any>) {
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'lg' })
      .result.then((result) => {
        this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }

  async guardarInvitados() {
    var overCapacityConfirmed = false;

    if (this.seExcedeCapacidadInvitadosBatch) {
      if (this.currentUser?.user.role !== 'admin') return;

      const result = await this.confirmOverCapacity();
      if (!result) {
        return;
      }
      overCapacityConfirmed = true;
    }

    this.loading = true;
    const modelInvitados: any[] = [];
    this.invitados.forEach((invitado: IInvitadoBatch) => {
      const model = {
        eventoId: this.eventoId,
        nombre: invitado.Nombre,
        edad: invitado.RangoEdad,
        tipoInvitado: invitado.TipoInvitado,
        fechaIngreso: invitado.AñoIngreso ? invitado.AñoIngreso : null,
        grupoId: invitado.Grupo,
        unidadNegocioId: invitado.Unidad,
        filialId: invitado.Filial,
        comentarios: invitado.Comentarios,
        participaEnRifa: invitado.ParticipaEnRifa,
        creditoSolarum: invitado.CreditoSolarum,
        requiereHospedaje: invitado.RequiereHospedaje,
        fechaHospedajeInicio: invitado.FechaHospedajeInicio,
        fechaHospedajeFin: invitado.FechaHospedajeFin,
      };
      modelInvitados.push(model);
    });

    const model = {
      invitados: modelInvitados,
    };
    this._guardarInvitado(model, overCapacityConfirmed);
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

  resultadoCargaInvitados: any[] = [];
  _guardarInvitado(model: any, overCapacityConfirmed: boolean) {
    this.eventoService
      .addInvitadoToEventBatch(
        this.eventoId!.toString(),
        model,
        overCapacityConfirmed
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.nuevoArchivoCargado = false;
            this.resultadoCargaInvitados = [];
            this.erroresValidacion = [];
            this.listoParaCargar = false;
            this.invitados = [];
            this.alertsService.success('Invitados cargados exitosamente');
            this.modalService.dismissAll();
            this.loadData();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  setOcupationDate($event: IOcupationDateEvent) {
    const model = {
      habitacionId: $event.habitacionId,
      tipoHabitacionId: $event.tipoHabitacionId,
      unidadNegocioId: $event.unidadNegocioId,
      fechaOcupacionInicio: $event.fechaOcupacionInicio,
      fechaOcupacionFin: $event.fechaOcupacionFin,
    };

    this.eventoService
      .updateFechasOcupacionHabitacion(this.eventoId!, model)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Fechas de ocupación actualizadas');
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

  downloadReporteHabitaciones() {
    this.csvService.descargarCSV(
      Tipo.ResumenHabitaciones,
      this.resumenHabitaciones,
      'ResumenHabitaciones'
    );
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

interface IInvitadoBatch {
  Nombre: string;
  RangoEdad: string;
  TipoInvitado: string;
  AñoIngreso: string;
  Grupo: string;
  Unidad: string;
  Filial: string;
  Comentario: string;
  ParticipaEnRifa: string;
  CreditoSolarum: string;
  RequiereHospedaje: string;
  FechaHospedajeInicio: any;
  FechaHospedajeFin: any;

  [key: string]: string;
}

interface TabulatedData {
  nombre: string;
  Adulto: number;
  JR: number;
  Menor: number;
  Infante: number;
}
