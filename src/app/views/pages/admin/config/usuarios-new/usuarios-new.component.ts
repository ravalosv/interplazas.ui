import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { UsersService } from 'src/app/core/services/users.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TipoUsuarioService } from 'src/app/core/services/tipo-usuario.service';
import { TipoUsuarioPayload } from 'src/app/core/interfaces/payloads/tipo_usuario.payload';
import { FilialService } from 'src/app/core/services/filial.service';
import { FilialAdminPayload } from 'src/app/core/interfaces/payloads/filial.payload';

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
  onCambiarContrase: any;
  tiposUsuario: TipoUsuarioPayload[] = [];
  filiales: FilialAdminPayload[] = [];
  mostrarFilial = false;

  constructor(
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private encryptionService: EncryptionService,
    private modalService: NgbModal,
    private usersService: UsersService,
    private tipoUsuarioService: TipoUsuarioService,
    private filialService: FilialService
  ) {}

  // Roles removidos

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
    if (!this.usuarioId) {
      this.resetFormToDefaults();
    }

    this.mostrarGrupos = false;

    this.loadData();
    this.loadTiposUsuario();
    this.loadFiliales();
    this.setupTipoUsuarioWatcher();
  }

  initForm() {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
        tipoUsuarioId: [null, [Validators.required]],
        filialId: [null, []],
      },
      { validators: this.passwordMatchValidator }
    );

    // Grupos eliminados
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
          this.form.get('tipoUsuarioId')?.setValue(data.data.tipoUsuarioId);
          this.form.get('filialId')?.setValue(
            data.data.filialId !== undefined ? data.data.filialId : null
          );
          // Grupos eliminados

          this.form.get('email')?.disable();
          this.form.get('password')?.disable();
          this.form.get('confirmPassword')?.disable();

          this.isDisabled = data.data.isDisabled;
          // Unidades eliminadas
        } else {
          this.alertsService.error(data.error);
        }
      },
      error: (error) => {
        this.alertsService.error(error);
      },
    });
  }

  setupTipoUsuarioWatcher() {
    const control = this.form.get('tipoUsuarioId');
    control?.valueChanges.subscribe((val: any) => {
      const isEmpty =
        val === null || val === undefined || val === '' || isNaN(Number(val));
      const filialCtrl = this.form.get('filialId');
      if (isEmpty) {
        this.mostrarFilial = false;
        filialCtrl?.setValue(null);
        filialCtrl?.clearValidators();
        filialCtrl?.updateValueAndValidity();
        return;
      }
      const isAdmin = Number(val) === 1;
      this.mostrarFilial = !isAdmin;
      if (isAdmin) {
        filialCtrl?.setValue(null);
        filialCtrl?.clearValidators();
        filialCtrl?.updateValueAndValidity();
      } else {
        filialCtrl?.setValidators([Validators.required]);
        filialCtrl?.updateValueAndValidity();
      }
    });
    const initialVal = control?.value;
    const filialCtrl = this.form.get('filialId');
    const initialIsEmpty =
      initialVal === null ||
      initialVal === undefined ||
      initialVal === '' ||
      isNaN(Number(initialVal));
    if (initialIsEmpty) {
      this.mostrarFilial = false;
      filialCtrl?.setValue(null);
      filialCtrl?.clearValidators();
      filialCtrl?.updateValueAndValidity();
    } else {
      const isAdmin = Number(initialVal) === 1;
      this.mostrarFilial = !isAdmin;
      if (isAdmin) {
        filialCtrl?.setValue(null);
        filialCtrl?.clearValidators();
        filialCtrl?.updateValueAndValidity();
      } else {
        filialCtrl?.setValidators([Validators.required]);
        filialCtrl?.updateValueAndValidity();
      }
    }
  }

  loadTiposUsuario() {
    this.tipoUsuarioService.getAll().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.tiposUsuario = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e.error);
      },
    });
  }
  loadFiliales() {
    this.filialService.getAll().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.filiales = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e.error);
      },
    });
  }
  // Lógica de roles eliminada; grupos y unidades removidos

  // Métodos de grupos y unidades removidos

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

  save(redirectToList: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    try {
      if (!this.usuarioId) {
        const tipoId = Number(this.form.get('tipoUsuarioId')?.value);
        const payload = {
          email: this.form.get('email')?.value,
          password: this.form.get('password')?.value,
          name: this.form.get('name')?.value,
          tipoUsuarioId: tipoId,
          filialId:
            tipoId === 1
              ? null
              : this.form.get('filialId')?.value
              ? Number(this.form.get('filialId')?.value)
              : null,
        };

        this.authService.createUser(payload).subscribe({
          next: (data) => {
            if (data.success) {
              this.alertsService.success('Usuario creado exitosamente');
              if (redirectToList) {
                this.router.navigate(['admin/config/usuarios']);
              } else {
                this.resetFormToDefaults();
              }
            } else {
              this.alertsService.error(data.error);
            }
          },
          error: (error) => {
            this.alertsService.error(error);
          },
        });
      } else {
        const tipoId = Number(this.form.get('tipoUsuarioId')?.value);
        const payload = {
          name: this.form.get('name')?.value,
          tipoUsuarioId: tipoId,
          filialId:
            tipoId === 1
              ? null
              : this.form.get('filialId')?.value
              ? Number(this.form.get('filialId')?.value)
              : null,
        };

        this.authService.updateUser(this.usuarioId, payload).subscribe({
          next: (data) => {
            if (data.success) {
              this.alertsService.success('Usuario actualizado exitosamente');
              if (redirectToList) {
                this.router.navigate(['admin/config/usuarios']);
              } else {
                this.resetFormToDefaults();
                this.usuarioId = null;
                this.currentBreadcrumb = 'Nuevo';
                this.isDisabled = false;
                // Optional: Update URL to reflect new state without reload
                // this.location.go(...) - requires Location service
              }
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
  resetFormToDefaults() {
    this.form.reset({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      tipoUsuarioId: null,
      filialId: null,
    });
    this.form.get('email')?.enable();
    this.form.get('password')?.enable();
    this.form.get('confirmPassword')?.enable();
    Object.values(this.form.controls).forEach((c) => {
      c.markAsPristine();
      c.markAsUntouched();
    });
    const filialCtrl = this.form.get('filialId');
    filialCtrl?.clearValidators();
    filialCtrl?.updateValueAndValidity();
    this.mostrarFilial = false;
    this.formPassword.reset({
      password: '',
      confirmPassword: '',
    });
    Object.values(this.formPassword.controls).forEach((c) => {
      c.markAsPristine();
      c.markAsUntouched();
    });
  }
  openModal(content: TemplateRef<any>) {
    // Size: xl, lg, md, sm
    this.modalService
      .open(content, { size: 'md' })
      .result.then(() => {
        //this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch(() => {});
  }

  onCambiarContrasena() {
    if (this.formPassword.invalid) {
      return;
    }

    this.confirmaCambiarContrasena();
  }
  confirmaCambiarContrasena() {
    this.alertsService.confirm({
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
