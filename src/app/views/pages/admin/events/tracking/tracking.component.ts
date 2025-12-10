import { Component, Input, OnInit, inject } from '@angular/core';
import {
  IResumedTrackingPayload,
  ITrackingPayload,
} from 'src/app/core/interfaces/models/evento.dto';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { EventoService } from 'src/app/core/services/evento.service';
import { TableService } from 'src/app/core/services/table.service';

@Component({
  selector: 'app-evento-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  @Input() eventoId: string | null;
  @Input() invitadoId: string | null | undefined;

  allChecked: boolean = false;
  allData: ITrackingPayload[] = [];
  displayData: ITrackingPayload[] = [];

  allResumedData: IResumedTrackingPayload[] = [];
  displayResumedData: IResumedTrackingPayload[] = [];

  searchInput: string;
  searchInput2: string;

  orderColumn = [
    {
      title: 'Id',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.invitadoId < b.invitadoId ? 1 : 0,
    },
    {
      title: 'Nombre',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.invitadoNombre.toString().localeCompare(b.invitadoNombre.toString()),
    },
    {
      title: 'Evento',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.accion_desc.toString().localeCompare(b.accion_desc.toString()),
    },
    {
      title: 'Detalle',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.detalles.toString().localeCompare(b.detalles.toString()),
    },
    {
      title: 'Usuario',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.usuario.name.toString().localeCompare(b.usuario.name.toString()),
    },
    {
      title: 'Fecha',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.createdAt < b.createdAt ? 1 : 0,
    },
  ];

  orderColumn2 = [
    {
      title: 'Nombre',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.invitadoNombre.toString().localeCompare(b.invitadoNombre.toString()),
    },
    {
      title: 'Evento',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.accion_desc.toString().localeCompare(b.accion_desc.toString()),
    },
    {
      title: 'Detalle',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.detalles.toString().localeCompare(b.detalles.toString()),
    },

    {
      title: 'Fecha',
      compare: (a: ITrackingPayload, b: ITrackingPayload) =>
        a.createdAt < b.createdAt ? 1 : 0,
    },
  ];

  habitacionTreeSelectedValue: string[] = ['-1']; // selecciona el nodo "Todos" por default
  nodesHabitaciones: Array<{
    title: string;
    key: string;
    isLeaf: boolean;
    children: Array<any>;
  }> = [];

  rangeDateFilter: Date[] | null = null;
  rangeDateFilter2: Date[] | null = null;

  constructor(
    public encryptionService: EncryptionService,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private tableSvc: TableService
  ) {
    this.displayData = [];
  }

  ngOnInit(): void {
    this.getTrackingList();
    this.cargarFiltroHabitaciones();
  }

  fechaInicioResumen: Date = new Date();
  fechaFinResumen: Date = new Date();

  onDateRangeChange2(result: Date[]): void {
    this.fechaInicioResumen = result[0];
    this.fechaFinResumen = result[1];
  }

  onDateRangeChange(result: Date[]): void {
    this.filtrarHistorico();
  }

  search() {
    this.filtrarHistorico();
  }

  search2() {
    this.filtrarHistorico2();
  }

  getTrackingResumedList() {
    if (this.eventoId == null || this.eventoId == undefined) return;

    this.eventoService
      .getResumedTracking(
        this.eventoId,
        this.fechaInicioResumen,
        this.fechaFinResumen
      )
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.displayResumedData = ret.data;
            this.allResumedData = ret.data;
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

  getTrackingList() {
    if (this.eventoId == null || this.eventoId == undefined) return;

    if (!this.invitadoId) {
      this.eventoService.getTracking(this.eventoId).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.displayData = ret.data;
            this.allData = ret.data;
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
      this.eventoService
        .getTrackingByInvitado(this.eventoId, this.invitadoId)
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.displayData = ret.data;
              this.allData = ret.data;
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

  cargarFiltroHabitaciones() {
    this.nodesHabitaciones = [];
    this.habitacionTreeSelectedValue = ['-1'];

    var nodeTodos = {
      title: 'Todos los eventos',
      key: `-1`,
      isLeaf: false,
      children: Array<any>(),
    };

    this.nodesHabitaciones.push(nodeTodos);

    nodeTodos.children.push({
      title: 'Creado',
      key: `1`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Actualizado',
      key: `2`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Eliminado',
      key: `3`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Asignado a habitacion',
      key: `4`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Deasignado de habitacion',
      key: `5`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Asignado a mesa',
      key: `7`,
      isLeaf: true,
      children: Array<any>(),
    });

    nodeTodos.children.push({
      title: 'Deasignado de mesa',
      key: `6`,
      isLeaf: true,
      children: Array<any>(),
    });
  }

  onHabitacionesFilterChanged($event: any[]): void {
    this.filtrarHistorico();
  }

  filtrarHistorico(): void {
    this.displayData = [];

    if (this.habitacionTreeSelectedValue.length == 0) return;

    var listaInterna: ITrackingPayload[] = [];

    this.habitacionTreeSelectedValue.forEach((f: any) => {
      if (f == '-1') {
        // Todas las habitaciones
        listaInterna.push(...this.allData);
        return;
      } else {
        listaInterna.push(...this.allData.filter((h) => h.accionId == f));
      }
    });

    // remover de la lista estandar si hay habitaciones duplicadas
    const listaDuplicados: ITrackingPayload[] = [];

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

    if (this.rangeDateFilter && this.rangeDateFilter.length > 0) {
      const from: Date = this.rangeDateFilter[0];
      const to: Date = this.rangeDateFilter[1];

      listaInterna = listaInterna.filter((h) => {
        const createdAt = new Date(h.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    }

    // filtrar por texto
    this.displayData = this.tableSvc.search(
      this.searchInput == undefined ? '' : this.searchInput,
      listaInterna
    );
  }

  filtrarHistorico2(): void {
    this.displayResumedData = [];

    var listaInterna: IResumedTrackingPayload[] = [];

    listaInterna.push(...this.allResumedData);

    // filtrar por texto
    this.displayResumedData = this.tableSvc.search(
      this.searchInput2 == undefined ? '' : this.searchInput2,
      listaInterna
    );
  }

  exportHistorical() {
    const csvData = this.convertToCSV(this.displayData);
    const blob = new Blob([`\uFEFF${csvData}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.href = url;
    a.download = 'tracking_data.csv';
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  exportHistorical2() {
    const csvData = this.convertToCSV(this.displayResumedData);
    const blob = new Blob([`\uFEFF${csvData}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.href = url;
    a.download = 'tracking_data.csv';
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(
    data: ITrackingPayload[] | IResumedTrackingPayload[]
  ): string {
    const headers = ['Id', 'Nombre', 'Evento', 'Detalle', 'Usuario', 'Fecha'];
    const rows = data.map((item) => [
      item.id,
      item.invitadoNombre,
      item.accion_desc,
      `"${item.detalles}"`,
      //item.usuario.name,
      `"${new Date(item.createdAt).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
      })}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}
