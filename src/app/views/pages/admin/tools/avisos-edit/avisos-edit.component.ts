import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IUsersPayload } from 'src/app/core/interfaces/models/users';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AvisosService } from 'src/app/core/services/avisos.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-avisos-edit',
  templateUrl: './avisos-edit.component.html',
  styleUrls: ['./avisos-edit.component.scss'],
})
export class AvisosEditComponent implements OnInit {
  form!: FormGroup;
  formPassword!: FormGroup;

  currentBreadcrumb = 'Nuevo';
  avisoId: string | null = null;
  isDisabled = false;

  mostrarListaUsuarios = false;

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly IUsersPayload[] = [];
  listOfUsers: readonly IUsersPayload[] = [];
  setOfCheckedUsersId = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private router: Router,
    private route: ActivatedRoute,
    private encryptionService: EncryptionService,
    private usersService: UsersService,
    private avisoService: AvisosService
  ) {}

  roles: any = [
    {
      id: 'todos',
      nombre: 'Todos los usuarios',
    },
    {
      id: 'administradores',
      nombre: 'Solo a administradores',
    },
    {
      id: 'representantes',
      nombre: 'Solo a representantes',
    },
    {
      id: 'especificos',
      nombre: 'Usuarios específicos',
    },
  ];

  ngOnInit(): void {
    this.avisoId = this.route.snapshot.paramMap.get('id');
    this.avisoId = this.encryptionService.decrypt(this.avisoId!);

    this.avisoId = this.avisoId == '-1' ? null : this.avisoId;

    if (!this.avisoId) {
      this.currentBreadcrumb = 'Nuevo';
    } else {
      this.currentBreadcrumb = 'Editar';
    }

    this.initForm();

    this.loadData();
  }

  initForm() {
    this.form = this.fb.group({
      titulo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      mostrarA: ['', [Validators.required]],
      usuarios: [[], []],
    });

    this.form.get('mostrarA')?.valueChanges.subscribe((value) => {
      this.setUsuariosValidator(value);
    });
  }

  loadData() {
    if (!this.avisoId) return;

    this.avisoService.getAvisoById(this.avisoId!).subscribe({
      next: (data) => {
        if (data.success) {
          this.form.get('titulo')?.setValue(data.data.titulo);
          this.form.get('descripcion')?.setValue(data.data.descripcion);
          this.form.get('mostrarA')?.setValue(data.data.mostrarA);
          this.form.get('usuarios')?.setValue(data.data.usuarios);

          this.form.get('mostrarA')?.updateValueAndValidity();

          data.data.usuarios.forEach((u) => {
            this.onUserChecked(u.userId, true);
          });

          this.isDisabled = !data.data.activo;
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  obtenerListaUsuarios() {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        if (data.success) {
          this.listOfUsers = data.data;
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  setUsuariosValidator(value: string) {
    if (value === 'especificos') {
      this.form.get('usuarios')?.setValidators([Validators.required]);
      this.mostrarListaUsuarios = true;

      this.obtenerListaUsuarios();
    } else {
      this.mostrarListaUsuarios = false;
      this.form.get('usuarios')?.clearValidators();
    }

    this.form.get('usuarios')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    try {
      var usuariosSeleccionados = this.form.get('usuarios')?.value;

      if (!this.avisoId) {
        const payload = {
          titulo: this.form.get('titulo')?.value,
          descripcion: this.form.get('descripcion')?.value,
          mostrarA: this.form.get('mostrarA')?.value,
          usuarios: usuariosSeleccionados,
        };

        this.avisoService.createAviso(payload).subscribe({
          next: (data) => {
            if (data.success) {
              this.alertsService.success('Aviso creado exitosamente');
              //this.router.navigate(['admin/herramientas/avisos']);
              this.avisoId = data.data.id.toString();
              this.isDisabled = true;
            } else {
              this.alertsService.error(data.error);
            }
          },
          error: (error) => {
            this.alertsService.error(error);
          },
        });
      } else {
        const payload = {
          titulo: this.form.get('titulo')?.value,
          descripcion: this.form.get('descripcion')?.value,
          mostrarA: this.form.get('mostrarA')?.value,
          usuarios: usuariosSeleccionados,
        };

        this.avisoService.updateAviso(this.avisoId, payload).subscribe({
          next: (data) => {
            if (data.success) {
              this.alertsService.success('Aviso actualizado exitosamente');
              //this.router.navigate(['admin/herramientas/avisos']);
            } else {
              this.alertsService.error(data.error);
            }
          },
          error: (error) => {
            this.alertsService.error(error);
          },
        });
      }
    } catch (error) {}
  }

  onDesactivar() {
    this.alertsService.confirm({
      titulo: 'Desactivar aviso',
      message: '¿Está seguro de querer desactivar el aviso?',
      okCallback: () => {
        this.desactivar();
      },
    });
  }

  desactivar() {
    this.avisoService.desactivarAviso(this.avisoId!).subscribe({
      next: (data) => {
        if (data.success) {
          this.alertsService.success('Aviso desactivado exitosamente');
          this.router.navigate(['admin/herramientas/avisos']);
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  onActivar() {
    this.alertsService.confirm({
      titulo: 'Activar aviso',
      message:
        '¿Está seguro de querer activar el aviso? Los usuarios podrán verlo.',
      okCallback: () => {
        this.activar();
      },
    });
  }

  activar() {
    this.avisoService.activarAviso(this.avisoId!).subscribe({
      next: (data) => {
        if (data.success) {
          this.alertsService.success('Aviso activado exitosamente');
          this.router.navigate(['admin/herramientas/avisos']);
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  updateCheckedUsersSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedUsersId.add(id);
    } else {
      this.setOfCheckedUsersId.delete(id);
    }
    this.form.get('usuarios')?.setValue([...this.setOfCheckedUsersId]);
  }

  onUserChecked(id: number, checked: boolean): void {
    this.updateCheckedUsersSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedUsersSet(item.id, value)
    );
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly IUsersPayload[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedUsersId.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedUsersId.has(item.id)
      ) && !this.checked;
  }
}
