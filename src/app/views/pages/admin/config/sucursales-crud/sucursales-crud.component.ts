import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { SucursalService } from 'src/app/core/services/sucursal.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { SucursalAdminPayload } from 'src/app/core/interfaces/payloads/sucursal.payload';
import { FilialAdminPayload } from 'src/app/core/interfaces/payloads/filial.payload';
import { GrupoAdminPayload } from 'src/app/core/interfaces/payloads/grupo.payload';

@Component({
  selector: 'app-sucursales-crud',
  templateUrl: './sucursales-crud.component.html',
  styleUrls: ['./sucursales-crud.component.scss'],
})
export class SucursalesCrudComponent implements OnInit {
  loading = false;
  sucursales: SucursalAdminPayload[] = [];
  filtro = '';
  filiales: FilialAdminPayload[] = [];
  filialesFiltradas: FilialAdminPayload[] = [];
  grupos: GrupoAdminPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private sucursalService: SucursalService,
    private filialService: FilialService,
    private grupoService: GrupoService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSucursales();
    this.loadFiliales();
    this.loadGrupos();
  }

  get sucursalesFiltradas(): SucursalAdminPayload[] {
    const termino = this.filtro.toLowerCase().trim();
    if (!termino) {
      return this.sucursales;
    }
    return this.sucursales.filter((s) => {
      const nombre = s.nombre?.toLowerCase() || '';
      const filial = s.filial?.nombre?.toLowerCase() || '';
      const grupo = s.filial?.grupo?.nombre?.toLowerCase() || '';
      return nombre.includes(termino) || filial.includes(termino) || grupo.includes(termino);
    });
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      grupoId: [null, [Validators.required]],
      filialId: [null, [Validators.required]],
    });
  }

  loadFiliales() {
    this.filialService.getAll().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.filiales = ret.data;
          this.filialesFiltradas = this.filiales;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => this.alertsService.error(e.error),
    });
  }

  loadGrupos() {
    this.grupoService.getAll().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.grupos = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => this.alertsService.error(e.error),
    });
  }

  onGrupoChange() {
    const grupoId = this.form.get('grupoId')?.value;
    if (!grupoId) {
      this.filialesFiltradas = [];
      this.form.get('filialId')?.setValue(null);
      return;
    }
    this.filialesFiltradas = this.filiales.filter((f) => f.grupoId === grupoId);
    this.form.get('filialId')?.setValue(null);
  }

  loadSucursales() {
    this.loading = true;
    this.sucursalService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.sucursales = ret.data;
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
    this.form.reset({ nombre: '', grupoId: null, filialId: null });
    this.filialesFiltradas = [];
    this.modalTitle = 'Nueva Sucursal';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: SucursalAdminPayload) {
    this.editingId = item.id;
    const filial = this.filiales.find((f) => f.id === item.filialId) || null;
    const grupoId = filial ? filial.grupoId : null;

    if (grupoId) {
      this.filialesFiltradas = this.filiales.filter((f) => f.grupoId === grupoId);
    } else {
      this.filialesFiltradas = [];
    }

    this.form.reset({
      nombre: item.nombre,
      grupoId,
      filialId: item.filialId,
    });
    this.modalTitle = 'Editar Sucursal';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = {
      nombre: this.form.get('nombre')?.value,
      filialId: this.form.get('filialId')?.value,
    } as { nombre: string; filialId: number };

    if (this.editingId == null) {
      this.sucursalService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Sucursal creada');
            this.loadSucursales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', grupoId: null, filialId: null });
              this.filialesFiltradas = [];
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    } else {
      this.sucursalService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Sucursal actualizada');
            this.loadSucursales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', grupoId: null, filialId: null });
              this.filialesFiltradas = [];
              this.editingId = null;
              this.modalTitle = 'Nueva Sucursal';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  onDelete(item: SucursalAdminPayload) {
    this.alertsService.confirm({
      titulo: 'Eliminar Sucursal',
      message: '¿Está seguro de eliminar la sucursal?',
      okCallback: () => {
        this.sucursalService.delete(item.id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Sucursal eliminada');
              this.loadSucursales();
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
