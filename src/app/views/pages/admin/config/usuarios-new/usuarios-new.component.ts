import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { GrupoPayload } from 'src/app/core/interfaces/payloads/config.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { UsersService } from 'src/app/core/services/users.service';
import { IUsersUNPayload } from 'src/app/core/interfaces/models/users';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-usuarios-new',
  templateUrl: './usuarios-new.component.html',
  styleUrls: ['./usuarios-new.component.scss'],
})
export class UsuariosNewComponent implements OnInit {
  form!: FormGroup;
  formPassword!: FormGroup;

  currentBreadcrumb = 'Nuevo';
  usuarioId: string | null = null;
  isDisabled = false;

  mostrarGrupos = false;
  mostrarUnidades = false;

  grupos: GrupoPayload[] = [];

  unidadesNegocio: any[] = [];

  nodesHabitaciones: Array<{
    title: string;
    key: string;
    isLeaf: boolean;
    children: Array<any>;
  }> = [];
  onCambiarContrase: any;

  constructor(
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private configService: ConfigService,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private encryptionService: EncryptionService,
    private modalService: NgbModal,
    private usersService: UsersService
  ) {}

  roles: any = [
    {
      id: 'admin',
      nombre: 'Administrador',
    },
    {
      id: 'repre',
      nombre: 'Representante',
    },
    {
      id: 'reportes',
      nombre: 'Reportes',
    },
  ];

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.paramMap.get('id');
    this.usuarioId = this.encryptionService.decrypt(this.usuarioId!);

    this.usuarioId = this.usuarioId == '-1' ? null : this.usuarioId;

    if (!this.usuarioId) {
      this.currentBreadcrumb = 'Nuevo';
    } else {
      this.currentBreadcrumb = 'Editar';
    }

    this.initForm();
    this.initPasswordForm();

    this.loadGrupos();

    this.loadData();
  }

  initForm() {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
        role: ['', [Validators.required]],
        grupoId: ['', []],
        unidadesNegocio: [[], []],
      },
      { validators: this.passwordMatchValidator }
    );

    this.form.get('role')?.valueChanges.subscribe((value) => {
      this.setGrupoValidator(value);
    });

    this.form.get('grupoId')?.valueChanges.subscribe((value) => {
      console.log('valueChanges(grupoId)', value);
      this.loadUnidadesFromGroup(value);
    });
  }

  initPasswordForm() {
    this.formPassword = this.fb.group(
      {
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  loadData() {
    if (!this.usuarioId) return;

    this.usersService.getUsersById(this.usuarioId!).subscribe({
      next: (data) => {
        if (data.success) {
          this.form.get('name')?.setValue(data.data.name);
          this.form.get('email')?.setValue(data.data.email);
          this.form.get('password')?.setValue('data.data.email');
          this.form.get('confirmPassword')?.setValue('data.data.email');
          this.form.get('role')?.setValue(data.data.role);
          this.form.get('grupoId')?.setValue(data.data.grupoId);

          this.form.get('grupoId')?.updateValueAndValidity();

          this.form.get('email')?.disable();
          this.form.get('password')?.disable();
          this.form.get('confirmPassword')?.disable();

          this.isDisabled = data.data.isDisabled;
          this.unidadesNegocio = data.data.unidadesNegocio.map((n) =>
            n.id.toString()
          );
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  seleccionarUnidadesEnTree(data: IUsersUNPayload[]) {}

  setGrupoValidator(value: string) {
    if (value === 'repre') {
      this.form.get('grupoId')?.setValidators([Validators.required]);
      this.form.get('unidadesNegocio')?.setValidators([Validators.required]);
      this.mostrarGrupos = true;
    } else {
      this.mostrarGrupos = false;
      this.mostrarUnidades = false;
      this.form.get('grupoId')?.clearValidators();
      this.form.get('unidadesNegocio')?.clearValidators();
      this.form.get('grupoId')?.setValue(null);
      this.form.get('unidadesNegocio')?.setValue([]);
    }

    this.form.get('grupoId')?.updateValueAndValidity();
    this.form.get('unidadesNegocio')?.updateValueAndValidity();
  }

  loadUnidadesFromGroup(grupoId: string) {
    if (!grupoId) {
      this.mostrarUnidades = false;
      return;
    }

    this.configService.getUnidadesNegocioFromGroup(grupoId).subscribe({
      next: (data) => {
        if (data.success) {
          this.mostrarUnidades = true;

          this.convertToHabitacionesTreeNodes(data.data);

          if (this.unidadesNegocio.length == 0) {
            this.unidadesNegocio = ['-1'];
          }
          this.form.get('unidadesNegocio')?.setValue(this.unidadesNegocio);
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.mostrarUnidades = false;

        this.alertsService.error(error);
      },
    });
  }

  loadGrupos() {
    this.configService.getGrupos().subscribe({
      next: (data) => {
        if (data.success) {
          this.grupos = data.data;
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    // Primero, aseguramos que el control es un FormGroup.
    const formGroup = control as FormGroup;

    // Luego, procedemos como antes.
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    return password && confirmPassword && password === confirmPassword
      ? null
      : { passwordMismatch: true };
  };

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    try {
      var unidadesSeleccionadas = this.form.get('unidadesNegocio')?.value;

      const todas = unidadesSeleccionadas.find((n: any) => n === '-1');

      if (todas) {
        unidadesSeleccionadas = [];
      } else {
        unidadesSeleccionadas = unidadesSeleccionadas.map((n: any) => ({
          id: n,
        }));
      }

      if (!this.usuarioId) {
        const payload = {
          name: this.form.get('name')?.value,
          email: this.form.get('email')?.value,
          password: this.form.get('password')?.value,
          role: this.form.get('role')?.value,
          grupoId: this.form.get('grupoId')?.value,
          unidadesNegocio: unidadesSeleccionadas,
        };

        this.authService.createUser(payload).subscribe({
          next: (data) => {
            if (data.success) {
              this.alertsService.success('Usuario creado exitosamente');
              this.router.navigate(['admin/config/usuarios']);
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
          name: this.form.get('name')?.value,
          role: this.form.get('role')?.value,
          grupoId: this.form.get('grupoId')?.value,
          unidadesNegocio: unidadesSeleccionadas,
        };

        this.authService.updateUser(this.usuarioId, payload).subscribe({
          next: (data) => {
            if (data.success) {
              this.alertsService.success('Usuario actualizado exitosamente');
              this.router.navigate(['admin/config/usuarios']);
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

  convertToHabitacionesTreeNodes(data: any[]) {
    this.nodesHabitaciones = [];
    //this.habitacionTreeSelectedValue = ['-1'];

    var nodeTodos = {
      title: 'Todas las unidades',
      key: `-1`,
      isLeaf: false,
      children: Array<any>(),
    };

    this.nodesHabitaciones.push(nodeTodos);

    // obtener un listado con los diferentes tipos de habitaciones

    data.forEach((element: any) => {
      var found = nodeTodos.children.find(
        (n) => n.key == element.id.toString()
      );

      if (found == null) {
        var node = {
          title: element.nombre,
          key: element.id.toString(),
          isLeaf: true,
          children: Array<any>(),
        };

        nodeTodos.children.push(node);
      }
    });
  }

  openModal(content: TemplateRef<any>) {
    // Size: xl, lg, md, sm
    this.modalService
      .open(content, { size: 'md' })
      .result.then((result) => {
        //this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }

  onCambiarContrasena() {
    if (this.formPassword.invalid) {
      return;
    }

    this.confirmaCambiarContrasena();
  }
  async confirmaCambiarContrasena() {
    await this.alertsService.confirm({
      titulo: 'Cambiar contraseña',
      message: '¿Desea cambiar la contraseña?',
      okCallback: () => {
        this.cambiarContrasena();
      },
    });
  }

  cambiarContrasena() {
    if (this.formPassword.invalid) {
      return;
    }

    const model = {
      userId: this.usuarioId,
      newPassword: this.formPassword.get('password')?.value,
    };

    this.authService.updateUserPassword(model).subscribe({
      next: (data) => {
        if (data.success) {
          this.alertsService.success('Contraseña actualizada exitosamente');
          this.modalService.dismissAll();
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  onDesactivar() {
    this.alertsService.confirm({
      titulo: 'Desactivar usuario',
      message: '¿Está seguro de querer desactivar al usuario?',
      okCallback: () => {
        this.desactivarUsuario();
      },
    });
  }

  desactivarUsuario() {
    this.usersService.desactivarUsuario(this.usuarioId!).subscribe({
      next: (data) => {
        if (data.success) {
          this.alertsService.success('Usuario desactivado exitosamente');
          this.router.navigate(['admin/config/usuarios']);
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
      titulo: 'Activar usuario',
      message: '¿Está seguro de querer activar al usuario?',
      okCallback: () => {
        this.activarUsuario();
      },
    });
  }

  activarUsuario() {
    this.usersService.activarUsuario(this.usuarioId!).subscribe({
      next: (data) => {
        if (data.success) {
          this.alertsService.success('Usuario activado exitosamente');
          this.router.navigate(['admin/config/usuarios']);
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }
}
