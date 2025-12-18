import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ServicioService } from 'src/app/core/services/servicio.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { TipoDocumentoService } from 'src/app/core/services/tipo-documento.service';
import { TipoServicioService } from 'src/app/core/services/tipo-servicio.service';
import { TipoAtaudService } from 'src/app/core/services/tipo-ataud.service';
import { MotivoNoOtorgadoService } from 'src/app/core/services/motivo-no-otorgado.service';
import { StatusService } from 'src/app/core/services/status.service';
import { EstadoCtaStatusService } from 'src/app/core/services/estado-cta-status.service';
import { ServicioCreatePayload, ServicioPayload } from 'src/app/core/interfaces/payloads/servicio.payload';

@Component({
  selector: 'app-servicio-crud',
  templateUrl: './servicio-crud.component.html',
  styleUrls: ['./servicio-crud.component.scss'],
})
export class ServicioCrudComponent implements OnInit {
  loading = false;
  servicios: ServicioPayload[] = [];
  displayServicios: ServicioPayload[] = [];
  searchTerm = '';
  activeTab = 1;
  maxDate: string = '';
  isPenalizado: boolean = false;
  isAdmin: boolean = false;
  
  // Date Filter
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months = [
    { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
    { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
    { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
    { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
  ];
  years: number[] = [];

  // Catalogs
  filiales: any[] = [];
  tiposDocumento: any[] = [];
  tiposServicio: any[] = [];
  tiposAtaud: any[] = [];
  motivos: any[] = [];
  statuses: any[] = [];
  estadoCtaStatuses: any[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;

  constructor(
    private servicioService: ServicioService,
    private filialService: FilialService,
    private tipoDocumentoService: TipoDocumentoService,
    private tipoServicioService: TipoServicioService,
    private tipoAtaudService: TipoAtaudService,
    private motivoNoOtorgadoService: MotivoNoOtorgadoService,
    private statusService: StatusService,
    private estadoCtaStatusService: EstadoCtaStatusService,
    private alertsService: AlertsService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.generateYears();
    this.initForm();
    this.loadCatalogs();
    this.searchByDate(); // Load current month by default
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  initForm() {
    const now = new Date();
    const localDate = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    this.maxDate = localDate;

    this.form = this.fb.group({
      // fecha: [localDate, [Validators.required]], // Removed from payload
      displayFechaCaptura: [localDate, []], // For display only
      whatsapp: ['', []],
      fo_Filial_otorgante_Id: [null, [Validators.required]],
      fo_Filial_Origen_Id: [null, [Validators.required]],
      fo_Contrato: ['', [Validators.required]],
      fo_Nombre_Titular: ['', [Validators.required]],
      fo_Nombre_Finado: ['', [Validators.required]],
      fo_Documento_Cliente_Id: [null, []],
      fo_Jefe_Turno_Nombre: ['', []],
      fo_Jefe_Turno_Puesto: ['', []],
      fo_Jefe_Turno_WhatsApp: ['', []],
      fo_Fecha_Servicio: [localDate, [Validators.required]],
      fori_Status_Contrato_Id: [null, []],
      fori_Saldo_Contrato: [0, []],
      fori_Acepta_Convenio: [false, []],
      fori_Otorga_Info_Nombre: ['', []],
      fori_Otorga_Info_Puesto: ['', []],
      fori_Otorga_Info_Telefono: ['', []],
      fo_Contrato_Monto_Recuperado: [0, []],
      fo_Contrato_Monto_Convenio: [0, []],
      fo_Tipo_Servicio_Id: [null, []],
      fo_Tipo_Ataud_Id: [null, []],
      exp_Solicitud_Servicio_Status_id: [null, []],
      exp_Solicitud_Servicio_File_Name: ['', []],
      exp_Comprobante_Pago_Status_Id: [null, []],
      exp_Comprobante_Pago_File_Name: ['', []],
      exp_Convenio_Status_Id: [null, []],
      exp_Convenio_File_Name: ['', []],
      exp_Enviado_Grupo_Whats: [false, []],
      exp_Motivo_De_No_Otorgado_Id: [null, []],
      exp_Expediente_Completo: ['NO', []],
      exp_Observaciones: ['', []],
      // Usuario_CapturaId & Fecha_Captura handled by backend usually
    });
  }

  loadCatalogs() {
    this.filialService.getAll().subscribe(ret => { if(ret.success) this.filiales = ret.data; });
    this.tipoDocumentoService.getAll().subscribe(ret => { if(ret.success) this.tiposDocumento = ret.data; });
    this.tipoServicioService.getAll().subscribe(ret => { if(ret.success) this.tiposServicio = ret.data; });
    this.tipoAtaudService.getAll().subscribe(ret => { if(ret.success) this.tiposAtaud = ret.data; });
    this.motivoNoOtorgadoService.getAll().subscribe(ret => { if(ret.success) this.motivos = ret.data; });
    this.statusService.getAll().subscribe(ret => { if(ret.success) this.statuses = ret.data; });
    this.estadoCtaStatusService.getAll().subscribe(ret => { if(ret.success) this.estadoCtaStatuses = ret.data; });
  }

  loadServicios() {
    this.searchByDate();
  }

  searchByDate() {
    this.loading = true;
    this.servicioService.getByDate(this.selectedYear, this.selectedMonth).subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.servicios = ret.data;
          this.search(); // Apply text filter if any
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

  search() {
    const term = this.searchTerm.toLowerCase();
    this.displayServicios = this.servicios.filter((item) => {
      return (
        (item.fo_Contrato && item.fo_Contrato.toLowerCase().includes(term)) ||
        (item.fo_Nombre_Titular && item.fo_Nombre_Titular.toLowerCase().includes(term)) ||
        (item.fo_Nombre_Finado && item.fo_Nombre_Finado.toLowerCase().includes(term))
      );
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
    this.editingId = null;
    this.initForm(); // Reset to defaults
    this.activeTab = 1;
    this.isPenalizado = false;
    this.modalTitle = 'Nuevo Servicio';
    this.modalRef = this.modalService.open(modalTpl, { centered: true, size: 'xl' });
  }

  openEdit(modalTpl: TemplateRef<any>, item: ServicioPayload) {
    this.editingId = item.id;
    this.activeTab = 1;
    this.isPenalizado = item.penalizado;
    this.form.patchValue({
      // fecha: item.fecha ? item.fecha.split('T')[0] : '', // Removed
      displayFechaCaptura: item.Fecha_Captura ? item.Fecha_Captura.split('T')[0] : '', // Display purpose
      whatsapp: item.whatsapp,
      fo_Filial_otorgante_Id: item.fo_Filial_otorgante_Id,
      fo_Filial_Origen_Id: item.fo_Filial_Origen_Id,
      fo_Contrato: item.fo_Contrato,
      fo_Nombre_Titular: item.fo_Nombre_Titular,
      fo_Nombre_Finado: item.fo_Nombre_Finado,
      fo_Documento_Cliente_Id: item.fo_Documento_Cliente_Id,
      fo_Jefe_Turno_Nombre: item.fo_Jefe_Turno_Nombre,
      fo_Jefe_Turno_Puesto: item.fo_Jefe_Turno_Puesto,
      fo_Jefe_Turno_WhatsApp: item.fo_Jefe_Turno_WhatsApp,
      fo_Fecha_Servicio: item.fo_Fecha_Servicio ? item.fo_Fecha_Servicio.split('T')[0] : '',
      fori_Status_Contrato_Id: item.fori_Status_Contrato_Id,
      fori_Saldo_Contrato: item.fori_Saldo_Contrato,
      fori_Acepta_Convenio: item.fori_Acepta_Convenio,
      fori_Otorga_Info_Nombre: item.fori_Otorga_Info_Nombre,
      fori_Otorga_Info_Puesto: item.fori_Otorga_Info_Puesto,
      fori_Otorga_Info_Telefono: item.fori_Otorga_Info_Telefono,
      fo_Contrato_Monto_Recuperado: item.fo_Contrato_Monto_Recuperado,
      fo_Contrato_Monto_Convenio: item.fo_Contrato_Monto_Convenio,
      fo_Tipo_Servicio_Id: item.fo_Tipo_Servicio_Id,
      fo_Tipo_Ataud_Id: item.fo_Tipo_Ataud_Id,
      exp_Solicitud_Servicio_Status_id: item.exp_Solicitud_Servicio_Status_id,
      exp_Solicitud_Servicio_File_Name: item.exp_Solicitud_Servicio_File_Name,
      exp_Comprobante_Pago_Status_Id: item.exp_Comprobante_Pago_Status_Id,
      exp_Comprobante_Pago_File_Name: item.exp_Comprobante_Pago_File_Name,
      exp_Convenio_Status_Id: item.exp_Convenio_Status_Id,
      exp_Convenio_File_Name: item.exp_Convenio_File_Name,
      exp_Enviado_Grupo_Whats: item.exp_Enviado_Grupo_Whats,
      exp_Motivo_De_No_Otorgado_Id: item.exp_Motivo_De_No_Otorgado_Id,
      exp_Expediente_Completo: item.exp_Expediente_Completo,
      exp_Observaciones: item.exp_Observaciones,
    });
    this.modalTitle = 'Editar Servicio';
    this.modalRef = this.modalService.open(modalTpl, { centered: true, size: 'xl' });
  }

  save(cerrar: boolean) {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      this.alertsService.error('Por favor complete los campos requeridos');
      return;
    }

    const payload = this.form.value as any;
    // Remove display-only fields or unexpected fields
    delete payload.displayFechaCaptura;
    
    // Cast to ServicioCreatePayload (though 'fecha' is gone now)
    const finalPayload = payload as ServicioCreatePayload;
    
    // Ensure numbers are numbers
    // payload.fori_Saldo_Contrato = Number(payload.fori_Saldo_Contrato);
    // ... handling this via form control type usually works, but safe to cast if needed.

    if (this.editingId == null) {
      this.servicioService.create(finalPayload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Servicio creado');
            this.loadServicios();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              this.initForm();
              this.editingId = null;
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    } else {
      this.servicioService.update(this.editingId, finalPayload).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Servicio actualizado');
            this.loadServicios();
            if (cerrar) {
              this.modalRef?.close();
            } else {
              // Stay in edit mode or reset? Usually close on edit save.
              this.modalRef?.close();
            }
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  onDelete(id: number) {
    this.alertsService.confirm({
      titulo: '¿Está seguro de eliminar este servicio?',
      message: 'Esta acción no se puede deshacer',
      okCallback: () => {
        this.servicioService.delete(id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Servicio eliminado');
              this.loadServicios();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e),
        });
      },
    });
  }

  togglePenalizado() {
    if (this.editingId) {
      this.servicioService.updatePenalizado(this.editingId, !this.isPenalizado).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.isPenalizado = !this.isPenalizado;
            this.alertsService.success(`Servicio ${this.isPenalizado ? 'penalizado' : 'despenalizado'} exitosamente`);
            this.loadServicios();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e),
      });
    }
  }

  sortContrato = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Contrato || '').localeCompare(b.fo_Contrato || '');
  sortTitular = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Nombre_Titular || '').localeCompare(b.fo_Nombre_Titular || '');
  sortFinado = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Nombre_Finado || '').localeCompare(b.fo_Nombre_Finado || '');
  sortFecha = (a: ServicioPayload, b: ServicioPayload) => new Date(a.fo_Fecha_Servicio).getTime() - new Date(b.fo_Fecha_Servicio).getTime();
}
