import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { FilialAdminPayload } from 'src/app/core/interfaces/payloads/filial.payload';

@Component({
  selector: 'app-filiales-crud',
  templateUrl: './filiales-crud.component.html',
  styleUrls: ['./filiales-crud.component.scss'],
})
export class FilialesCrudComponent implements OnInit {
  loading = false;
  filiales: FilialAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private filialService: FilialService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFiliales();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      extranjera: [false, []],
    });
  }

  loadFiliales() {
    this.loading = true;
    this.filialService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.filiales = ret.data;
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
    this.form.reset({ nombre: '', extranjera: false });
    this.modalTitle = 'Nueva Filial';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: FilialAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre, extranjera: item.extranjera });
    this.modalTitle = 'Editar Filial';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string; extranjera: boolean };

    if (this.editingId == null) {
      this.filialService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Filial creada');
            this.loadFiliales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', extranjera: false });
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    } else {
      this.filialService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Filial actualizada');
            this.loadFiliales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', extranjera: false });
              this.editingId = null;
              this.modalTitle = 'Nueva Filial';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  onDelete(item: FilialAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Filial',
      message: '¿Está seguro de eliminar la filial?',
      okCallback: () => {
        this.filialService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Filial eliminada');
              this.loadFiliales();
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
