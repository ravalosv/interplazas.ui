import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { TipoServicioService } from 'src/app/core/services/tipo-servicio.service';
import { TipoServicioAdminPayload } from 'src/app/core/interfaces/payloads/tipo_servicio.payload';

@Component({
  selector: 'app-tipo-servicio-crud',
  templateUrl: './tipo-servicio-crud.component.html',
  styleUrls: ['./tipo-servicio-crud.component.scss'],
})
export class TipoServicioCrudComponent implements OnInit {
  loading = false;
  tipos: TipoServicioAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private tipoServicioService: TipoServicioService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTipos();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
    });
  }

  loadTipos() {
    this.loading = true;
    this.tipoServicioService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.tipos = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.loading = false;
        this.alertsService.error(e.error);
      },
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
    this.editingId = null;
    this.form.reset({ nombre: '' });
    this.modalTitle = 'Nuevo Tipo de Servicio';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: TipoServicioAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre });
    this.modalTitle = 'Editar Tipo de Servicio';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string };

    if (this.editingId == null) {
      this.tipoServicioService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Tipo de servicio creado');
            this.loadTipos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '' });
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    } else {
      this.tipoServicioService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Tipo de servicio actualizado');
            this.loadTipos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '' });
              this.editingId = null;
              this.modalTitle = 'Nuevo Tipo de Servicio';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  onDelete(item: TipoServicioAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Tipo de Servicio',
      message: '¿Está seguro de eliminar el tipo de servicio?',
      okCallback: () => {
        this.tipoServicioService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Tipo de servicio eliminado');
              this.loadTipos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e.error),
        });
      },
    });
  }
}

