import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { EmailTemplateService } from 'src/app/core/services/email-template.service';
import { FilialAdminPayload } from 'src/app/core/interfaces/payloads/filial.payload';
import { GrupoAdminPayload } from 'src/app/core/interfaces/payloads/grupo.payload';
import { IEmailTemplate } from 'src/app/core/interfaces/email-template.interface';

@Component({
  selector: 'app-filiales-crud',
  templateUrl: './filiales-crud.component.html',
  styleUrls: ['./filiales-crud.component.scss'],
})
export class FilialesCrudComponent implements OnInit {
  loading = false;
  filiales: FilialAdminPayload[] = [];
  grupos: GrupoAdminPayload[] = [];
  emailTemplates: IEmailTemplate[] = [];
  filtro = '';

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;
  activeTab = 1;

  constructor(
    private filialService: FilialService,
    private grupoService: GrupoService,
    private emailTemplateService: EmailTemplateService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFiliales();
    this.loadGrupos();
    this.loadEmailTemplates();
  }

  loadEmailTemplates() {
    this.emailTemplateService.getAll().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.emailTemplates = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => this.alertsService.error(e.error),
    });
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      extranjera: [false, []],
      utilizaApi: [false, []],
      grupoId: [null, [Validators.required]],
      apiUrl: [{ value: '', disabled: true }, []],
      apiKey: [{ value: '', disabled: true }, []],
      templateSaldoPabsCero: [null, []],
      templateSaldoPabsConConvenio: [null, []],
      templateSaldoPabsSinConvenio: [null, []],
      templateSaldoPabsParcial: [null, []],
      destinatarios_email: ['', []],
    });

    this.form.get('utilizaApi')?.valueChanges.subscribe((val) => {
      this.toggleApiFields(val);
    });
  }

  toggleApiFields(enable: boolean) {
    const apiUrl = this.form.get('apiUrl');
    const apiKey = this.form.get('apiKey');
    if (enable) {
      apiUrl?.enable();
      apiKey?.enable();
      apiUrl?.addValidators(Validators.required);
      apiKey?.addValidators(Validators.required);
    } else {
      apiUrl?.disable();
      apiKey?.disable();
      apiUrl?.removeValidators(Validators.required);
      apiKey?.removeValidators(Validators.required);
    }
    apiUrl?.updateValueAndValidity();
    apiKey?.updateValueAndValidity();
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
        this.alertsService.error(e.error);
      },
    });
  }

  get filialesFiltradas(): FilialAdminPayload[] {
    const termino = this.filtro.toLowerCase().trim();
    if (!termino) {
      return this.filiales;
    }
    return this.filiales.filter((f) => {
      const nombre = f.nombre?.toLowerCase() || '';
      const grupo = f.grupo?.nombre?.toLowerCase() || '';
      return nombre.includes(termino) || grupo.includes(termino);
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      extranjera: false,
      utilizaApi: false,
      grupoId: null,
      apiUrl: '',
      apiKey: '',
      templateSaldoPabsCero: null,
      templateSaldoPabsConConvenio: null,
      templateSaldoPabsSinConvenio: null,
      templateSaldoPabsParcial: null,
      destinatarios_email: '',
    });
    this.toggleApiFields(false);
    this.modalTitle = 'Nueva Filial';
    this.modalRef = this.modalService.open(modalTpl, { centered: true, size: 'lg' });
  }

  openEdit(modalTpl: TemplateRef<any>, item: FilialAdminPayload) {
    this.editingId = item.id;
    this.form.reset({
      nombre: item.nombre,
      extranjera: item.extranjera,
      utilizaApi: item.utilizaApi,
      grupoId: item.grupoId,
      apiUrl: item.apiUrl,
      apiKey: item.apiKey,
      templateSaldoPabsCero: item.templateSaldoPabsCero,
      templateSaldoPabsConConvenio: item.templateSaldoPabsConConvenio,
      templateSaldoPabsSinConvenio: item.templateSaldoPabsSinConvenio,
      templateSaldoPabsParcial: item.templateSaldoPabsParcial,
      destinatarios_email: item.destinatarios_email,
    });
    this.toggleApiFields(item.utilizaApi);
    this.modalTitle = 'Editar Filial';
    this.modalRef = this.modalService.open(modalTpl, { centered: true, size: 'lg' });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    // Forzar la inclusión de valores deshabilitados
    const payload = this.form.getRawValue() as {
      nombre: string;
      extranjera: boolean;
      utilizaApi: boolean;
      grupoId: number;
      apiUrl?: string;
      apiKey?: string;
      templateSaldoPabsCero?: number;
      templateSaldoPabsConConvenio?: number;
      templateSaldoPabsSinConvenio?: number;
      templateSaldoPabsParcial?: number;
      destinatarios_email?: string;
    };

    if (this.editingId == null) {
      this.filialService.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Filial creada');
            this.loadFiliales();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.form.reset({
                nombre: '',
                extranjera: false,
                utilizaApi: false,
                grupoId: null,
                apiUrl: '',
                apiKey: '',
                templateSaldoPabsCero: null,
                templateSaldoPabsConConvenio: null,
                templateSaldoPabsSinConvenio: null,
                templateSaldoPabsParcial: null,
              });
              this.toggleApiFields(false);
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
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
              this.form.reset({
                nombre: '',
                extranjera: false,
                utilizaApi: false,
                grupoId: null,
                apiUrl: '',
                apiKey: '',
                templateSaldoPabsCero: null,
                templateSaldoPabsConConvenio: null,
                templateSaldoPabsSinConvenio: null,
                templateSaldoPabsParcial: null,
              });
              this.toggleApiFields(false);
              this.editingId = null;
              this.modalTitle = 'Nueva Filial';
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
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
          error: (e) => this.alertsService.error(e.error),
        });
      },
    });
  }
}
