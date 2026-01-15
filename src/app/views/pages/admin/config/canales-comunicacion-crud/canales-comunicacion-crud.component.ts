import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { CanalComunicacionService } from 'src/app/core/services/canal-comunicacion.service';
import { CanalComunicacionAdminPayload } from 'src/app/core/interfaces/payloads/canal_comunicacion.payload';

@Component({
  selector: 'app-canales-comunicacion-crud',
  templateUrl: './canales-comunicacion-crud.component.html',
  styleUrls: ['./canales-comunicacion-crud.component.scss'],
})
export class CanalesComunicacionCrudComponent implements OnInit {
  loading = false;
  canales: CanalComunicacionAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private canalService: CanalComunicacionService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCanales();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      whatsApp: ['', [Validators.required]],
    });
  }

  loadCanales() {
    this.loading = true;
    this.canalService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.canales = ret.data;
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
    this.form.reset({ nombre: '', whatsApp: '' });
    this.modalTitle = 'Nuevo Canal de Comunicación';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: CanalComunicacionAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre, whatsApp: item.whatsApp });
    this.modalTitle = 'Editar Canal de Comunicación';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string; whatsApp: string };

    if (this.editingId == null) {
      this.canalService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Canal de comunicación creado');
            this.loadCanales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', whatsApp: '' });
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    } else {
      this.canalService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Canal de comunicación actualizado');
            this.loadCanales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', whatsApp: '' });
              this.editingId = null;
              this.modalTitle = 'Nuevo Canal de Comunicación';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  onDelete(item: CanalComunicacionAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Canal de Comunicación',
      message: '¿Está seguro de eliminar el canal de comunicación?',
      okCallback: () => {
        this.canalService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Canal de comunicación eliminado');
              this.loadCanales();
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
