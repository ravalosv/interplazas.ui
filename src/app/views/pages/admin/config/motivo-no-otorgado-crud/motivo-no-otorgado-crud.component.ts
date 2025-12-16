import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { MotivoNoOtorgadoService } from 'src/app/core/services/motivo-no-otorgado.service';
import { MotivoNoOtorgadoAdminPayload } from 'src/app/core/interfaces/payloads/motivo_no_otorgado.payload';

@Component({
  selector: 'app-motivo-no-otorgado-crud',
  templateUrl: './motivo-no-otorgado-crud.component.html',
  styleUrls: ['./motivo-no-otorgado-crud.component.scss'],
})
export class MotivoNoOtorgadoCrudComponent implements OnInit {
  loading = false;
  motivos: MotivoNoOtorgadoAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private motivoService: MotivoNoOtorgadoService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMotivos();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
    });
  }

  loadMotivos() {
    this.loading = true;
    this.motivoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.motivos = ret.data;
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
    this.modalTitle = 'Nuevo Motivo No Otorgado';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: MotivoNoOtorgadoAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre });
    this.modalTitle = 'Editar Motivo No Otorgado';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string };

    if (this.editingId == null) {
      this.motivoService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Motivo creado');
            this.loadMotivos();
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
      this.motivoService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Motivo actualizado');
            this.loadMotivos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '' });
              this.editingId = null;
              this.modalTitle = 'Nuevo Motivo No Otorgado';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  onDelete(item: MotivoNoOtorgadoAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Motivo',
      message: '¿Está seguro de eliminar el motivo?',
      okCallback: () => {
        this.motivoService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Motivo eliminado');
              this.loadMotivos();
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

