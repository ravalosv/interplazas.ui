import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { StatusService } from 'src/app/core/services/status.service';
import { StatusAdminPayload } from 'src/app/core/interfaces/payloads/status.payload';

@Component({
  selector: 'app-status-crud',
  templateUrl: './status-crud.component.html',
  styleUrls: ['./status-crud.component.scss'],
})
export class StatusCrudComponent implements OnInit {
  loading = false;
  statuses: StatusAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private statusService: StatusService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadStatuses();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
    });
  }

  loadStatuses() {
    this.loading = true;
    this.statusService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.statuses = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.loading = false;
        this.alertsService.error(e);
      },
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
    this.editingId = null;
    this.form.reset({ nombre: '' });
    this.modalTitle = 'Nuevo Estado';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: StatusAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre });
    this.modalTitle = 'Editar Estado';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string };

    if (this.editingId == null) {
      this.statusService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Estado creado');
            this.loadStatuses();
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
        error: (e) => this.alertsService.error(e),
      });
    } else {
      this.statusService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Estado actualizado');
            this.loadStatuses();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '' });
              this.editingId = null;
              this.modalTitle = 'Nuevo Estado';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  onDelete(item: StatusAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Estado',
      message: '¿Está seguro de eliminar el estado?',
      okCallback: () => {
        this.statusService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Estado eliminado');
              this.loadStatuses();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e),
        });
      },
    });
  }
}

