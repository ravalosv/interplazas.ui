import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { GrupoAdminPayload } from 'src/app/core/interfaces/payloads/grupo.payload';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grupos-crud',
  templateUrl: './grupos-crud.component.html',
  styleUrls: ['./grupos-crud.component.scss'],
})
export class GruposCrudComponent implements OnInit {
  loading = false;
  grupos: GrupoAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private grupoService: GrupoService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadGrupos();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      cobroEntreFiliales: [false, []],
    });
  }

  loadGrupos() {
    this.loading = true;
    this.grupoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.grupos = ret.data;
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
    this.form.reset({ nombre: '', cobroEntreFiliales: false });
    this.modalTitle = 'Nuevo Grupo';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: GrupoAdminPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre, cobroEntreFiliales: item.cobroEntreFiliales });
    this.modalTitle = 'Editar Grupo';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as { nombre: string; cobroEntreFiliales: boolean };

    if (this.editingId == null) {
      this.grupoService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Grupo creado');
            this.loadGrupos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', cobroEntreFiliales: false });
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    } else {
      this.grupoService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Grupo actualizado');
            this.loadGrupos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', cobroEntreFiliales: false });
              this.editingId = null;
              this.modalTitle = 'Nuevo Grupo';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  onDelete(item: GrupoAdminPayload) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el grupo ${item.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.grupoService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Grupo eliminado');
              this.loadGrupos();
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
