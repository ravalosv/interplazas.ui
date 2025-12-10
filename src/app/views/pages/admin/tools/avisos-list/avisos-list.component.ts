import { Component, OnInit } from '@angular/core';
import { IUsersPayload } from 'src/app/core/interfaces/models/users';
import { IAvisoPayload } from 'src/app/core/interfaces/payloads/aviso.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AvisosService } from 'src/app/core/services/avisos.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-avisos-list',
  templateUrl: './avisos-list.component.html',
  styleUrls: ['./avisos-list.component.scss'],
})
export class AvisosListComponent implements OnInit {
  searchInput: string;
  displayData: IAvisoPayload[];
  allData: IAvisoPayload[];

  eventStatus = [
    '[Todos]',
    'Solo avisos activos',
    'Solo solo avisos no activos',
  ];
  filterStatus = 'Solo avisos activos';

  orderColumn = [
    {
      title: 'Titulo',
      compare: (a: IAvisoPayload, b: IAvisoPayload) =>
        a.titulo.localeCompare(b.titulo),
    },
    {
      title: 'Descripcion',
      compare: (a: IAvisoPayload, b: IAvisoPayload) =>
        a.descripcion.toString().localeCompare(b.descripcion.toString()),
    },
    {
      title: 'Status',
      compare: (a: IAvisoPayload, b: IAvisoPayload) =>
        a.activo.toString().localeCompare(b.activo.toString()),
    },
  ];

  constructor(
    public encryptionService: EncryptionService,
    private alertsService: AlertsService,
    private avisoService: AvisosService
  ) {}

  ngOnInit(): void {
    this.getAvisos('active');
  }

  getAvisos(filter: string) {
    this.avisoService.getAvisos(filter).subscribe({
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
    });
  }

  searchByStatus($event: any) {
    if ($event === 'Solo avisos activos') {
      this.getAvisos('active');
    } else if ($event === 'Solo solo avisos no activos') {
      this.getAvisos('inactive');
    } else {
      this.getAvisos('todos');
    }
  }
}
