import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { EmailTemplateService } from 'src/app/core/services/email-template.service';
import { IEmailTemplate } from 'src/app/core/interfaces/email-template.interface';

@Component({
  selector: 'app-email-template-crud',
  templateUrl: './email-template-crud.component.html',
  styleUrls: ['./email-template-crud.component.scss'],
})
export class EmailTemplateCrudComponent implements OnInit {
  loading = false;
  templates: IEmailTemplate[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;
  activeTab = 1;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean'],                                         // remove formatting button
      ['link']                                           // link only, no image or video
    ]
  };

  constructor(
    private service: EmailTemplateService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      from: ['', [Validators.required]],
      titulo: ['', [Validators.required]],
      template: ['', [Validators.required]],
      htmlContent: [''],
    });
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.templates = ret.data;
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
    this.form.reset({
      nombre: '',
      tipo: '',
      from: '',
      titulo: '',
      template: '',
      htmlContent: '',
    });
    this.modalTitle = 'Nuevo Template de Email';
    this.modalRef = this.modalService.open(modalTpl, { size: 'lg', centered: true });
  }

  openEdit(modalTpl: TemplateRef<any>, item: IEmailTemplate) {
    this.editingId = item.id || null;
    
    // Fetch detailed item to get content
    if (this.editingId) {
      this.service.getById(this.editingId).subscribe({
        next: (ret) => {
          if (ret.success) {
            const fullItem = ret.data;
            this.form.reset({
              nombre: fullItem.nombre,
              tipo: fullItem.tipo,
              from: fullItem.from,
              titulo: fullItem.titulo,
              template: fullItem.template,
              htmlContent: fullItem.htmlContent || '',
            });
            this.modalTitle = 'Editar Template de Email';
            this.modalRef = this.modalService.open(modalTpl, { size: 'lg', centered: true });
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  save() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const payload = this.form.value as IEmailTemplate;

    if (this.editingId == null) {
      this.service.create(payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Template creado');
            this.loadData();
            this.modalRef?.close();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    } else {
      this.service.update(this.editingId, payload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Template actualizado');
            this.loadData();
            this.modalRef?.close();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  onDelete(item: IEmailTemplate) {
    if (!item.id) return;
    if (confirm(`¿Estás seguro de eliminar el template "${item.nombre}"?`)) {
      this.service.delete(item.id).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Template eliminado');
            this.loadData();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }
}
