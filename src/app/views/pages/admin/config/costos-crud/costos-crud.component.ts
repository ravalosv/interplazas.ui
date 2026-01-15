import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { CostosService } from 'src/app/core/services/costos.service';
import { CostosPayload } from 'src/app/core/interfaces/payloads/costos.payload';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-costos-crud',
  templateUrl: './costos-crud.component.html',
  styleUrls: ['./costos-crud.component.scss'],
})
export class CostosCrudComponent implements OnInit {
  loading = false;
  costos: CostosPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private costosService: CostosService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCostos();
  }

  initForm() {
    this.form = this.fb.group({
      costo_servicio: [0, [Validators.required, Validators.min(0)]],
    });
  }

  loadCostos() {
    this.loading = true;
    this.costosService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.costos = ret.data;
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
    this.form.reset({ costo_servicio: 0 });
    this.modalTitle = 'Nuevo Costo';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: CostosPayload) {
    this.editingId = item.id!;
    this.form.reset({ costo_servicio: item.costo_servicio });
    this.modalTitle = 'Editar Costo';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { costo_servicio: number };

    if (this.editingId == null) {
      this.costosService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Costo creado');
            this.loadCostos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ costo_servicio: 0 });
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    } else {
      this.costosService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Costo actualizado');
            this.loadCostos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ costo_servicio: 0 });
              this.editingId = null;
              this.modalTitle = 'Nuevo Costo';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  onDelete(item: CostosPayload) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.costosService.delete(item.id!).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Costo eliminado');
              this.loadCostos();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e.error),
        });
      }
    });
  }
}
