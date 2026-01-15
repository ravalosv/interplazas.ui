import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { ConceptoService } from 'src/app/core/services/concepto.service';
import { ConceptoPayload } from 'src/app/core/interfaces/payloads/concepto.payload';

@Component({
  selector: 'app-concepto-crud',
  templateUrl: './concepto-crud.component.html',
  styleUrls: ['./concepto-crud.component.scss'],
})
export class ConceptoCrudComponent implements OnInit {
  loading = false;
  conceptos: ConceptoPayload[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private conceptoService: ConceptoService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadConceptos();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      montoMXN: [0, [Validators.required]],
      montoUSD: [0, [Validators.required]],
    });
  }

  loadConceptos() {
    this.loading = true;
    this.conceptoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.conceptos = ret.data;
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
    this.form.reset({ nombre: '', montoMXN: 0, montoUSD: 0 });
    this.modalTitle = 'Nuevo Concepto';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: ConceptoPayload) {
    this.editingId = item.id;
    this.form.reset({ nombre: item.nombre, montoMXN: item.montoMXN, montoUSD: item.montoUSD });
    this.modalTitle = 'Editar Concepto';
    this.modalRef = this.modalService.open(modalTpl, { centered: true });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value;

    if (this.editingId == null) {
      this.conceptoService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Concepto creado');
            this.loadConceptos();
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
      this.conceptoService.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Concepto actualizado');
            this.loadConceptos();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({ nombre: '', montoMXN: 0, montoUSD: 0 });
              this.editingId = null;
              this.modalTitle = 'Nuevo Concepto';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  delete(id: number) {
    this.alertsService.confirm({
      titulo: 'Eliminar Concepto',
      message: '¿Está seguro de eliminar el concepto?',
      okCallback: () => {
        this.conceptoService.delete(id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Concepto eliminado');
              this.loadConceptos();
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
