import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { TipoAtaudService } from 'src/app/core/services/tipo-ataud.service';
import { TipoAtaudAdminPayload } from 'src/app/core/interfaces/payloads/tipo_ataud.payload';

@Component({
  selector: 'app-tipo-ataud-crud',
  templateUrl: './tipo-ataud-crud.component.html',
  styleUrls: ['./tipo-ataud-crud.component.scss'],
})
export class TipoAtaudCrudComponent implements OnInit {
  loading = false;
  tipos: TipoAtaudAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private tipoAtaudService: TipoAtaudService,
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
    this.tipoAtaudService.getAll().subscribe({
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
        this.alertsService.error(e);
      },
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
    this.editingId = null;
    this.form.reset({ nombre: '' });
    this.modalTitle = 'Nuevo Tipo de Ataúd';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: TipoAtaudAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre });
    this.modalTitle = 'Editar Tipo de Ataúd';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string };

    if (this.editingId == null) {
      this.tipoAtaudService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Tipo de ataúd creado');
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
        error: (e) => this.alertsService.error(e),
      });
    } else {
      this.tipoAtaudService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Tipo de ataúd actualizado');
            this.loadTipos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '' });
              this.editingId = null;
              this.modalTitle = 'Nuevo Tipo de Ataúd';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  onDelete(item: TipoAtaudAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Tipo de Ataúd',
      message: '¿Está seguro de eliminar el tipo de ataúd?',
      okCallback: () => {
        this.tipoAtaudService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Tipo de ataúd eliminado');
              this.loadTipos();
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

