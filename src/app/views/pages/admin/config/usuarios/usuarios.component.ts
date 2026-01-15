import { Component, OnInit } from '@angular/core';
import { IUsersPayload } from 'src/app/core/interfaces/models/users';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  searchInput: string;
  displayData: IUsersPayload[];
  allData: IUsersPayload[];

  eventStatus = ['[Todos]', 'Solo usuario activos', 'Solo usuarios inactivos'];
  filterStatus = 'Solo usuario activos';

  orderColumn = [
    {
      title: 'Nombre',
      compare: (a: IUsersPayload, b: IUsersPayload) =>
        a.name.localeCompare(b.name),
    },
    {
      title: 'email',
      compare: (a: IUsersPayload, b: IUsersPayload) =>
        a.email.toString().localeCompare(b.email.toString()),
    },
    {
      title: 'Role',
      compare: (a: IUsersPayload, b: IUsersPayload) =>
        a.role.toString().localeCompare(b.role.toString()),
    },

    {
      title: 'Fecha de creación',
      compare: (a: IUsersPayload, b: IUsersPayload) =>
        a.createdAt.toString().localeCompare(b.createdAt.toString()),
    },
    {
      title: 'Status',
      compare: (a: IUsersPayload, b: IUsersPayload) =>
        a.isDisabled.toString().localeCompare(b.isDisabled.toString()),
    },
  ];

  constructor(
    public encryptionService: EncryptionService,
    private usersService: UsersService,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(filter: string = 'active') {
    this.usersService.getUsers(filter).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.displayData = ret.data;
          this.allData = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e.error);
      },
    });
  }

  searchByStatus($event: any) {
    if ($event === 'Solo usuario activos') {
      this.getUsers('active');
    } else if ($event === 'Solo usuarios inactivos') {
      this.getUsers('inactive');
    } else {
      this.getUsers('all');
    }
  }
}
