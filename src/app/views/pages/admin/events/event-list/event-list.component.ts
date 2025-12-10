import { Component, OnInit } from '@angular/core';
import { EventoPayload } from 'src/app/core/interfaces/payloads/evento.payload';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { EventoService } from 'src/app/core/services/evento.service';
import { TableService } from 'src/app/core/services/table.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  allChecked: boolean = false;
  allData: EventoPayload[];
  displayData: EventoPayload[];
  searchInput: string;

  eventStatus = ['[Todos]', 'Activos', 'Archivados', 'Cancelados'];
  filterStatus = 'Activos';

  currentUser: IUser;

  orderColumn = [
    {
      title: 'Evento',
      compare: (a: EventoPayload, b: EventoPayload) =>
        a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Fecha Inicio',
      compare: (a: EventoPayload, b: EventoPayload) =>
        a.fechaInicio.toString().localeCompare(b.fechaInicio.toString()),
    },
    {
      title: 'Fecha Fin',
      compare: (a: EventoPayload, b: EventoPayload) =>
        a.fechaFin.toString().localeCompare(b.fechaFin.toString()),
    },
    {
      title: 'Fecha límite captura',
      compare: (a: EventoPayload, b: EventoPayload) =>
        a.fechaLimite.toString().localeCompare(b.fechaLimite.toString()),
    },
    {
      title: 'Status',
      compare: (a: EventoPayload, b: EventoPayload) =>
        a.eventoStatus.nombre.localeCompare(b.eventoStatus.nombre),
    },
  ];

  constructor(
    public encryptionService: EncryptionService,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private tableSvc: TableService,
    private authService: AuthenticationService
  ) {
    this.getEventos();

    this.displayData = [];
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user!;
    });
  }

  search() {
    const data = this.allData;
    this.displayData = this.tableSvc.search(this.searchInput, data);
  }

  searchByStatus() {
    this.getEventos(this.filterStatus.replace('[', '').replace(']', ''));
  }

  addBenefit() {
    /*     this.router.navigate(['admin/benefits/benefiteditor']);
     */
  }

  getEventos(status: string = 'Activos') {
    this.eventoService.getEventos(status).subscribe({
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

  encryptData(data: string): string {
    return btoa(data);
  }
}
