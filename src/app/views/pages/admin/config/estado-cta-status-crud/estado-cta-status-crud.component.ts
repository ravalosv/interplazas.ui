import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EstadoCtaStatusService } from 'src/app/core/services/estado-cta-status.service';
import { EstadoCtaStatusAdminPayload } from 'src/app/core/interfaces/payloads/estado_cta_status.payload';
import { AlertsService } from 'src/app/core/services/alerts.service';

@Component({
  selector: 'app-estado-cta-status-crud',
  templateUrl: './estado-cta-status-crud.component.html',
  styleUrls: ['./estado-cta-status-crud.component.scss'],
})
export class EstadoCtaStatusCrudComponent implements OnInit {
  loading = false;
  estados: EstadoCtaStatusAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private estadoService: EstadoCtaStatusService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEstados();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
    });
  }

  loadEstados() {
    this.loading = true;
    this.estadoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.estados = ret.data;
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
    this.modalTitle = 'Nuevo Estado de Cuenta';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: EstadoCtaStatusAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre });
    this.modalTitle = 'Editar Estado de Cuenta';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string };

    if (this.editingId == null) {
      this.estadoService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Estado creado');
            this.loadEstados();
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
      this.estadoService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Estado actualizado');
            this.loadEstados();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '' });
              this.editingId = null;
              this.modalTitle = 'Nuevo Estado de Cuenta';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  onDelete(item: EstadoCtaStatusAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Estado',
      message: '¿Está seguro de eliminar el estado?',
      okCallback: () => {
        this.estadoService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Estado eliminado');
              this.loadEstados();
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

