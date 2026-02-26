import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ServicioService } from 'src/app/core/services/servicio.service';
import { SucursalService } from 'src/app/core/services/sucursal.service';
import { TipoDocumentoService } from 'src/app/core/services/tipo-documento.service';
import { TipoServicioService } from 'src/app/core/services/tipo-servicio.service';
import { ConceptoService } from 'src/app/core/services/concepto.service';
import { MotivoNoOtorgadoService } from 'src/app/core/services/motivo-no-otorgado.service';
import { StatusService } from 'src/app/core/services/status.service';
import { EstadoCtaStatusService } from 'src/app/core/services/estado-cta-status.service';
import { CanalComunicacionService } from 'src/app/core/services/canal-comunicacion.service';
import { ServicioCreatePayload, ServicioPayload } from 'src/app/core/interfaces/payloads/servicio.payload';
import { ServicioObservacionService, ServicioObservacionPayload } from 'src/app/core/services/servicio-observacion.service';
import { PeriodoService } from 'src/app/core/services/periodo.service';
import { PeriodoPayload } from 'src/app/core/interfaces/payloads/periodo.payload';
import { environment } from 'src/environments/environment';
import { ContratoProxyService } from 'src/app/core/services/contrato-proxy.service';

@Component({
  selector: 'app-servicio-crud',
  templateUrl: './servicio-crud.component.html',
  styleUrls: ['./servicio-crud.component.scss'],
})
export class ServicioCrudComponent implements OnInit {
  loading = false;
  isSaving = false;
  servicios: ServicioPayload[] = [];
  displayServicios: ServicioPayload[] = [];
  searchTerm = '';
  activeTab = 2;
  maxDate: string = '';
  isPenalizado: boolean = false;
  isAdmin: boolean = false;
  apiUrl = environment.apiUrl;
  selectedFiles: Map<string, File> = new Map();
  captureUserName: string = '';
  currentUserId: number | null = null;
  
  // Filters
  viewScopeOptions = [
    { id: 'all', name: 'Ver todos los servicios' },
    { id: 'mine', name: 'Ver solo mis Servicios' }
  ];
  selectedViewScope = 'all';

  statusFilterOptions = [
    { id: 'all', name: 'Ver todos' },
    { id: 'En Proceso', name: 'En Proceso' },
    { id: 'Expediente Completo', name: 'Expediente Completo' },
    { id: 'Expediente enviado', name: 'Expediente enviado' }
  ];
  selectedStatusFilter = 'all';

  // Periodo Filter
  periodos: PeriodoPayload[] = [];
  activePeriodosList: PeriodoPayload[] = [];
  selectedPeriodoId: number | null = null;

  // Catalogs
  sucursales: any[] = [];
  tiposDocumento: any[] = [];
  tiposServicio: any[] = [];
  conceptos: any[] = [];
  motivos: any[] = [];
  statuses: any[] = [];
  estadoCtaStatuses: any[] = [];
  canalesComunicacion: any[] = [];

  observaciones: ServicioObservacionPayload[] = [];
  nuevaObservacion = '';
  loadingObservaciones = false;
  loadingPenalizado = false;
  processingField: string | null = null;
  loadingDeleteId: number | null = null;

  form!: FormGroup;
  editingId: number | null = null;
  modalTitle = '';
  modalRef: NgbModalRef | null = null;
  changePeriodoId: number | null = null;
  createPeriodMode = false;
  newPeriodMonth: number | null = null;
  newPeriodYear: number | null = new Date().getFullYear();
  
  selectedSucursalOrigen: any = null;
  consultandoContrato = false;
  
  // Modal Contrato API
  modalContratoRef: NgbModalRef | null = null;
  contractSearchFilialId: number | null = null;
  tempContratoSearch = '';
  contratoSearchResult: any = null;
  validatingContrato = false;

  months = [
    { id: 1, name: 'ENERO' },
    { id: 2, name: 'FEBRERO' },
    { id: 3, name: 'MARZO' },
    { id: 4, name: 'ABRIL' },
    { id: 5, name: 'MAYO' },
    { id: 6, name: 'JUNIO' },
    { id: 7, name: 'JULIO' },
    { id: 8, name: 'AGOSTO' },
    { id: 9, name: 'SEPTIEMBRE' },
    { id: 10, name: 'OCTUBRE' },
    { id: 11, name: 'NOVIEMBRE' },
    { id: 12, name: 'DICIEMBRE' },
  ];

  statusOptions = ['En Proceso', 'Expediente Completo', 'Expediente enviado'];

  constructor(
    private servicioService: ServicioService,
    private sucursalService: SucursalService,
    private tipoDocumentoService: TipoDocumentoService,
    private tipoServicioService: TipoServicioService,
    private conceptoService: ConceptoService,
    private motivoNoOtorgadoService: MotivoNoOtorgadoService,
    private statusService: StatusService,
    private estadoCtaStatusService: EstadoCtaStatusService,
    private canalComunicacionService: CanalComunicacionService,
    private periodoService: PeriodoService,
    private alertsService: AlertsService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private servicioObservacionService: ServicioObservacionService,
    private http: HttpClient,
    private contratoProxyService: ContratoProxyService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.user) {
      this.currentUserId = currentUser.user.id;
    }

    this.initForm();
    this.loadCatalogs();
    this.loadPeriodos();
  }

  get isPeriodoClosed(): boolean {
    if (this.selectedPeriodoId == null) return false;
    const p = this.periodos.find(x => x.id === this.selectedPeriodoId);
    return p ? !p.activo : false;
  }
 

  initForm() {
    const now = new Date();
    const localDate = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    this.maxDate = localDate;
    this.selectedFiles.clear();
    const currentUser = this.authService.currentUserValue;
    this.captureUserName = currentUser && currentUser.user ? currentUser.user.name : '';

    this.form = this.fb.group({
      displayFechaCaptura: [localDate, []], // For display only
      canalComunicacionId: [null, []],
      fo_Sucursal_otorgante_Id: [null, [Validators.required]],
      fo_Sucursal_Origen_Id: [null, [Validators.required]],
      fo_Contrato: ['', [Validators.required]],
      fo_Nombre_Titular: ['', [Validators.required]],
      fo_Nombre_Finado: ['', [Validators.required]],
      fo_Documento_Cliente_Id: [null, []],
      fo_Documento_Cliente_url: ['', []],
      fo_Monto_devuelto_documento_url: ['', []],
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
      fo_Monto_Devuelto: [0, []],
      fo_Tipo_Servicio_Id: [null, []],
      fo_Concepto_Id: [null, []],
      exp_Solicitud_Servicio_Status_id: [null, []],
      exp_Solicitud_Servicio_url: ['', []],
      exp_Comprobante_Pago_Status_Id: [null, []],
      exp_Comprobante_Pago_url: ['', []],
      exp_Convenio_Status_Id: [null, []],
      exp_Convenio_url: ['', []],
      exp_Motivo_De_No_Otorgado_Id: [null, []],
      exp_Expediente_Completo: ['NO', []],
      exp_Observaciones_cierre: ['', []],
      exp_ine_responsable_url: ['', []],
      exp_comprobante_domicilio_resp_url: ['', []],
      exp_ine_aval_url: ['', []],
      fori_estado_cuenta_url: ['', []],
      status: ['En Proceso', [Validators.required]],
      // Usuario_CapturaId & Fecha_Captura handled by backend usually
    });

    this.form.get('fo_Sucursal_Origen_Id')?.valueChanges.subscribe(val => {
      this.selectedSucursalOrigen = this.sucursales.find(s => s.id === val);
      
      // Si la filial utiliza API, el campo Contrato se mantiene habilitado para permitir click (popup),
      // pero se mostrará como readonly en el HTML.
      const contratoControl = this.form.get('fo_Contrato');
      contratoControl?.enable();
    });
    
    this.setupConditionalValidation();
  }

  setupConditionalValidation() {
    const convenioCheck = this.form.get('fori_Acepta_Convenio');
    const montoControl = this.form.get('fo_Contrato_Monto_Convenio');

    if (convenioCheck && montoControl) {
      // Initial state
      if (!convenioCheck.value) {
        montoControl.disable();
        // Los campos de expediente también deberían estar "inactivos" si no hay convenio,
        // pero como son manejados por *ngIf en el HTML, aquí solo necesitamos asegurar
        // que no se queden con valores basura si se desmarca.
      }

      // Subscription
      convenioCheck.valueChanges.subscribe(val => {
        if (val) {
          montoControl.enable();
        } else {
          montoControl.setValue(0);
          montoControl.disable();
          
          // Opcional: Limpiar valores de archivos si se desmarca "Se le puede dar convenio"
          // Esto evita enviar datos ocultos al backend.
          // Nota: No eliminamos los archivos del servidor aquí, solo del formulario local.
          // Si el usuario vuelve a marcar, tendrá que volver a cargar o se asume que
          // los archivos previos ya no son relevantes para este estado.
          /*
          this.form.patchValue({
            exp_ine_responsable_url: '',
            exp_comprobante_domicilio_resp_url: '',
            exp_ine_aval_url: ''
          });
          this.selectedFiles.delete('exp_ine_responsable_url');
          this.selectedFiles.delete('exp_comprobante_domicilio_resp_url');
          this.selectedFiles.delete('exp_ine_aval_url');
          */
        }
      });
    }
  }

  loadCatalogs() {
    this.sucursalService.getAll().subscribe(ret => { if(ret.success) this.sucursales = ret.data; });
    this.tipoDocumentoService.getAll().subscribe(ret => { if(ret.success) this.tiposDocumento = ret.data; });
    this.tipoServicioService.getAll().subscribe(ret => { if(ret.success) this.tiposServicio = ret.data; });
    this.conceptoService.getAll().subscribe(ret => { if(ret.success) this.conceptos = ret.data; });
    this.motivoNoOtorgadoService.getAll().subscribe(ret => { if(ret.success) this.motivos = ret.data; });
    this.statusService.getAll().subscribe(ret => { if(ret.success) this.statuses = ret.data; });
    this.estadoCtaStatusService.getAll().subscribe(ret => { if(ret.success) this.estadoCtaStatuses = ret.data; });
    this.canalComunicacionService.getAll().subscribe(ret => { if(ret.success) this.canalesComunicacion = ret.data; });
  }

  loadPeriodos() {
    this.loading = true;
    this.periodoService.getAll().subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.periodos = ret.data;
          this.activePeriodosList = this.periodos.filter(p => p.activo);
          const activo = this.periodos.find(p => p.activo);
          this.selectedPeriodoId = activo ? activo.id : (this.periodos[0]?.id ?? null);
          if (this.selectedPeriodoId != null) {
            this.searchByPeriodo();
          }
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

  loadServicios() {
    this.searchByPeriodo();
  }

  searchByPeriodo() {
    if (this.selectedPeriodoId == null) {
      this.servicios = [];
      this.displayServicios = [];
      return;
    }
    this.loading = true;
    this.servicioService.getByPeriodo(this.selectedPeriodoId).subscribe({
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
        this.alertsService.error(e.error);
      },
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.displayServicios = this.servicios.filter((item) => {
      // 1. Text Search Filter
      const matchesSearch = (
        (item.fo_Contrato && item.fo_Contrato.toLowerCase().includes(term)) ||
        (item.fo_Nombre_Titular && item.fo_Nombre_Titular.toLowerCase().includes(term)) ||
        (item.fo_Nombre_Finado && item.fo_Nombre_Finado.toLowerCase().includes(term)) ||
        (item.sucursalOrigen?.nombre && item.sucursalOrigen.nombre.toLowerCase().includes(term)) ||
        (item.sucursalOtorgante?.nombre && item.sucursalOtorgante.nombre.toLowerCase().includes(term)) ||
        (item.fo_Fecha_Servicio && item.fo_Fecha_Servicio.toLowerCase().includes(term))
      );

      if (!matchesSearch) return false;

      // 2. View Scope Filter
      if (this.selectedViewScope === 'mine') {
         if (this.currentUserId && item.Usuario_CapturaId !== this.currentUserId) {
             return false;
         }
      }

      // 3. Status Filter
      if (this.selectedStatusFilter !== 'all') {
          const currentStatus = item.status || 'En Proceso';
          if (currentStatus !== this.selectedStatusFilter) {
              return false;
          }
      }

      return true;
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
    if (this.isPeriodoClosed) {
      this.alertsService.warning('No se pueden agregar servicios a un periodo cerrado.');
      return;
    }
    this.editingId = null;
    this.initForm(); // Reset to defaults
    this.activeTab = 2;
    this.isPenalizado = false;
    this.observaciones = [];
    this.nuevaObservacion = '';
    this.modalTitle = 'Nuevo Servicio';
    this.modalRef = this.modalService.open(modalTpl, { centered: true, size: 'xl' });
  }

  openEdit(modalTpl: TemplateRef<any>, item: ServicioPayload) {
    this.selectedFiles.clear();
    this.editingId = item.id;
    this.activeTab = 2;
    this.isPenalizado = item.penalizado;
    this.captureUserName = item.usuarioCaptura && item.usuarioCaptura.name ? item.usuarioCaptura.name : this.captureUserName;
    this.form.patchValue({
      // displayFechaCaptura: item.Fecha_Captura ? item.Fecha_Captura.split('T')[0] : '', // Display purpose
      displayFechaCaptura: item.Fecha_Captura, // Keep full date string for DatePipe
      canalComunicacionId: item.canalComunicacionId,
      fo_Sucursal_otorgante_Id: item.fo_Sucursal_otorgante_Id,
      fo_Sucursal_Origen_Id: item.fo_Sucursal_Origen_Id,
      fo_Contrato: item.fo_Contrato,
      fo_Nombre_Titular: item.fo_Nombre_Titular,
      fo_Nombre_Finado: item.fo_Nombre_Finado,
      fo_Documento_Cliente_Id: item.fo_Documento_Cliente_Id,
      fo_Documento_Cliente_url: item.fo_Documento_Cliente_url,
      fo_Monto_devuelto_documento_url: item.fo_Monto_devuelto_documento_url,
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
      fo_Monto_Devuelto: item.fo_Monto_Devuelto,
      fo_Tipo_Servicio_Id: item.fo_Tipo_Servicio_Id,
      fo_Concepto_Id: item.fo_Concepto_Id,
      exp_Solicitud_Servicio_Status_id: item.exp_Solicitud_Servicio_Status_id,
      exp_Solicitud_Servicio_url: item.exp_Solicitud_Servicio_url,
      exp_Comprobante_Pago_Status_Id: item.exp_Comprobante_Pago_Status_Id,
      exp_Comprobante_Pago_url: item.exp_Comprobante_Pago_url,
      exp_Convenio_Status_Id: item.exp_Convenio_Status_Id,
      exp_Convenio_url: item.exp_Convenio_url,
      exp_Motivo_De_No_Otorgado_Id: item.exp_Motivo_De_No_Otorgado_Id,
      exp_Expediente_Completo: item.exp_Expediente_Completo,
      exp_Observaciones_cierre: item.exp_Observaciones_cierre,
      exp_ine_responsable_url: item.exp_ine_responsable_url,
      exp_comprobante_domicilio_resp_url: item.exp_comprobante_domicilio_resp_url,
      exp_ine_aval_url: item.exp_ine_aval_url,
      fori_estado_cuenta_url: item.fori_estado_cuenta_url,
      status: item.status || 'En Proceso'
    });

    if (this.isPeriodoClosed) {
      this.form.disable();
    } else {
      this.form.enable();
      this.setupConditionalValidation();
      if (!this.form.get('fori_Acepta_Convenio')?.value) {
        this.form.get('fo_Contrato_Monto_Convenio')?.disable();
      }
    }

    this.observaciones = [];
    this.nuevaObservacion = '';
    this.loadObservaciones(item.id);
    this.modalTitle = 'Editar Servicio: ' + item.fo_Contrato;
    this.modalRef = this.modalService.open(modalTpl, { centered: true, size: 'xl' });
  }

  loadObservaciones(servicioId: number) {
    this.loadingObservaciones = true;
    this.servicioObservacionService.getByServicio(servicioId).subscribe({
      next: (ret) => {
        this.loadingObservaciones = false;
        if (ret.success) {
          this.observaciones = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.loadingObservaciones = false;
        this.alertsService.error(e.error);
      },
    });
  }

  enviarExpedienteCorreo() {
    if (!this.editingId) {
      this.alertsService.error('Guarde el servicio antes de enviar el correo');
      return;
    }

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      this.alertsService.error('Por favor complete los campos requeridos antes de enviar');
      return;
    }

    // Actualizar status a 'Expediente enviado'
    this.form.patchValue({ status: 'Expediente enviado' });

    // Preparar payload para guardar
    const payload = this.form.value as any;
    delete payload.displayFechaCaptura;
    const finalPayload = payload as ServicioCreatePayload;

    this.isSaving = true;
    
    // Primero guardamos el cambio de estatus
    this.servicioService.update(this.editingId, finalPayload).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.alertsService.success('Estatus actualizado a "Expediente enviado"');
          this.loadServicios(); // Refrescar lista

          // Luego intentamos enviar el correo
          this.servicioService.sendExpedienteEmail(this.editingId!).subscribe({
            next: (emailRet) => {
              this.isSaving = false;
              if (emailRet.success) {
                this.alertsService.success('Expediente enviado por correo exitosamente');
              } else {
                this.alertsService.warning('Estatus actualizado, pero hubo un error al enviar el correo: ' + emailRet.error);
              }
            },
            error: (e) => {
              this.isSaving = false;
              this.alertsService.warning('Estatus actualizado, pero hubo un error al enviar el correo: ' + (e.error || e.message));
            }
          });
        } else {
          this.isSaving = false;
          this.alertsService.error('Error al actualizar estatus: ' + ret.error);
        }
      },
      error: (e) => {
        this.isSaving = false;
        this.showApiError(e, 'Error al actualizar estatus');
      }
    });
  }

  marcarExpedienteCompleto() {
    if (!this.editingId) {
      this.alertsService.error('Guarde el servicio antes de cambiar el estatus');
      return;
    }

    const currentStatus = this.form.get('status')?.value || 'En Proceso';
    
    // Si ya está enviado, no hacemos nada (aunque el botón debería estar deshabilitado)
    if (currentStatus === 'Expediente enviado') {
      return;
    }

    let newStatus = '';
    let title = '';
    let message = '';
    let confirmBtn = 'Sí, cambiar estatus';

    if (currentStatus === 'Expediente Completo') {
      newStatus = 'En Proceso';
      title = '¿Marcar expediente INCOMPLETO?';
      message = 'El estatus del servicio regresará a "En Proceso".';
    } else {
      // Asumimos que es 'En Proceso' u otro estado inicial
      newStatus = 'Expediente Completo';
      title = '¿Marcar expediente completo?';
      message = 'El estatus del servicio cambiará a "Expediente Completo".';
    }
    
    this.alertsService.confirm({
      titulo: title,
      message: message,
      okCallback: () => {
        this.form.patchValue({ status: newStatus });
        this.save(true);
      }
    });
  }

  applyContratoData(data: any) {
    if (data.saldo !== undefined) {
      this.form.patchValue({ fori_Saldo_Contrato: data.saldo });
    }

    if (data.status) {
      const statusName = data.status.toString().toUpperCase();
      const foundStatus = this.statuses.find(s => s.nombre && s.nombre.toUpperCase() === statusName);
      if (foundStatus) {
        this.form.patchValue({ fori_Status_Contrato_Id: foundStatus.id });
      }
    }

    if (data.nombre_titular || data.NombreTitular) {
        this.form.patchValue({ fo_Nombre_Titular: data.nombre_titular || data.NombreTitular });
    }
  }

  openBusquedaContrato(modalTpl: TemplateRef<any>) {
    if (this.selectedSucursalOrigen?.filialId) {
      this.contractSearchFilialId = this.selectedSucursalOrigen.filialId;
      this.modalService.open(modalTpl, { 
        centered: true, 
        size: 'xl',
        backdropClass: 'blur-backdrop',
        windowClass: 'top-modal'
      });
    }
  }

  onContratoSelected(event: { contrato: string, data: any }, modal: any) {
    if (event && event.contrato) {
      this.form.patchValue({ fo_Contrato: event.contrato });
      if (event.data) {
        this.applyContratoData(event.data);
      }
      modal.close();
    }
  }

  consultarContrato(contratoManual?: string) {
    if (!this.selectedSucursalOrigen?.filial?.apiUrl) {
      this.alertsService.error('La filial origen no tiene configurada la API URL');
      return;
    }

    let contrato = contratoManual || this.form.get('fo_Contrato')?.value;
    if (!contrato) {
      this.alertsService.error('Ingrese un número de contrato');
      return;
    }
    contrato = contrato.trim();

    this.consultandoContrato = true;

    // Usar el servicio Proxy unificado
    this.contratoProxyService.consultarContrato(this.selectedSucursalOrigen.filial.id, contrato).subscribe({
      next: (res: any) => {
        this.consultandoContrato = false;

        if (!res.success) {
          this.alertsService.error(res.error || 'Error en la consulta vía Proxy');
          return;
        }

        this.alertsService.success('Consulta exitosa (vía Proxy)');
        
        if (contratoManual) {
          this.form.patchValue({ fo_Contrato: contratoManual });
          if (this.modalContratoRef) {
            this.modalContratoRef.close();
            this.modalContratoRef = null;
          }
        }
        
        if (res.data) {
          this.applyContratoData(res.data);
        }
      },
      error: (err) => {
        this.consultandoContrato = false;
        console.error('Error Proxy:', err);
        
        let errorMsg = 'Error al consultar el contrato.';
        if (err.error && err.error.error) {
            errorMsg = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
            errorMsg = err.error;
        } else {
             errorMsg = err.message || 'Error desconocido en Proxy.';
        }

        this.alertsService.error(errorMsg);
      }
    });
  }

  openContratoSearch(modalTpl: TemplateRef<any>) {
    if (!this.selectedSucursalOrigen?.filial?.utilizaApi) return;
    
    this.tempContratoSearch = '';
    this.contratoSearchResult = null;
    this.modalContratoRef = this.modalService.open(modalTpl, { centered: true, size: 'lg' });
  }

  validateContratoSearch() {
    if (!this.selectedSucursalOrigen?.filial?.apiUrl) {
      this.alertsService.error('La filial origen no tiene configurada la API URL');
      return;
    }

    if (!this.tempContratoSearch) {
      this.alertsService.error('Ingrese un número de contrato para validar');
      return;
    }

    const contrato = this.tempContratoSearch.trim();
    this.validatingContrato = true;
    this.contratoSearchResult = null;

    this.contratoProxyService.consultarContrato(this.selectedSucursalOrigen.filial.id, contrato).subscribe({
      next: (res: any) => {
        this.validatingContrato = false;
        if (!res.success) {
           this.alertsService.error(res.error || 'Error en la consulta vía Proxy');
           return;
        }
        this.contratoSearchResult = res.data;
      },
      error: (err) => {
        this.validatingContrato = false;
        console.error('Error Proxy:', err);
        let errorMsg = err.error?.error || 'Error al validar contrato.';
        this.alertsService.error(errorMsg);
      }
    });
  }

  onAcceptContratoSearch() {
    if (!this.tempContratoSearch) {
      this.alertsService.error('Ingrese el número de contrato');
      return;
    }

    if (this.contratoSearchResult) {
      this.form.patchValue({ fo_Contrato: this.tempContratoSearch });
      this.applyContratoData(this.contratoSearchResult);
      
      if (this.modalContratoRef) {
        this.modalContratoRef.close();
        this.modalContratoRef = null;
      }
      return;
    }

    this.consultarContrato(this.tempContratoSearch);
  }

  addObservacion() {
    if (!this.editingId) {
      this.alertsService.error('Guarde el servicio antes de agregar observaciones');
      return;
    }
    const texto = (this.nuevaObservacion || '').trim();
    if (!texto) {
      this.alertsService.error('La observación no puede estar vacía');
      return;
    }
    this.loadingObservaciones = true;
    this.servicioObservacionService.create(this.editingId, texto).subscribe({
      next: (ret) => {
        this.loadingObservaciones = false;
        if (ret.success) {
          this.alertsService.success('Observación agregada');
          this.nuevaObservacion = '';
          this.loadObservaciones(this.editingId!);
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.loadingObservaciones = false;
        this.alertsService.error(e.error);
      },
    });
  }

  onDeleteObservacion(item: ServicioObservacionPayload) {
    if (this.isPeriodoClosed) {
      this.alertsService.warning('No se pueden eliminar observaciones en un periodo cerrado.');
      return;
    }
    if (!this.editingId) {
      return;
    }
    this.alertsService.confirm({
      titulo: '¿Eliminar observación?',
      message: 'Esta acción no se puede deshacer',
      okCallback: () => {
        this.loadingObservaciones = true;
        this.servicioObservacionService.delete(this.editingId!, item.id).subscribe({
          next: (ret) => {
            this.loadingObservaciones = false;
            if (ret.success) {
              this.alertsService.success('Observación eliminada');
              this.loadObservaciones(this.editingId!);
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.loadingObservaciones = false;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  updatePenalizado() {
    if (this.editingId && this.isAdmin) {
      this.servicioService.updatePenalizado(this.editingId, this.isPenalizado).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Status Penalizado actualizado');
            this.loadServicios();
          }
        },
        error: (e) => this.alertsService.error(e.error),
      });
    }
  }

  hasDocument(fieldName: string): boolean {
    // @ts-ignore
    return !!this.form.get(fieldName)?.value || this.selectedFiles.has(fieldName);
  }

  onDocumentUpload(file: File, fieldName: string) {
    this.handleFileSelection(file, fieldName);
  }

  handleFileSelection(file: File, fieldName: string) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!allowedTypes.includes(file.type)) {
      this.alertsService.error('Solo se permiten archivos PDF, Excel o Imágenes (JPG, PNG)');
      return;
    }

    if (this.editingId) {
      this.servicioService.uploadDocument(this.editingId, fieldName, file).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Documento cargado correctamente');
            // @ts-ignore
            this.form.patchValue({ [fieldName]: ret.data[fieldName] });
            this.loadServicios();
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => this.alertsService.error(e.error)
      });
    } else {
      this.selectedFiles.set(fieldName, file);
      this.form.patchValue({ [fieldName]: file.name });
    }
  }

  deleteDocument(fieldName: string) {
    if (this.editingId) {
      this.alertsService.confirm({
        titulo: '¿Eliminar documento?',
        message: 'Esta acción eliminará el archivo permanentemente.',
        okCallback: () => {
          this.servicioService.deleteDocument(this.editingId!, fieldName).subscribe({
            next: (ret) => {
              if (ret.success) {
                this.alertsService.success('Documento eliminado');
                this.form.patchValue({ [fieldName]: null });
                this.loadServicios();
              }
            },
            error: () => this.processingField = null
          });
        }
      });
    } else {
      this.selectedFiles.delete(fieldName);
      this.form.patchValue({ [fieldName]: null });
    }
  }

  viewDocument(fieldName: string) {
    const val = this.form.get(fieldName)?.value;
    if (this.editingId && val && !this.selectedFiles.has(fieldName)) {
      window.open(`${this.apiUrl}/storage/${val}`, '_blank');
    } else if (this.selectedFiles.has(fieldName)) {
      const file = this.selectedFiles.get(fieldName);
      const url = URL.createObjectURL(file!);
      window.open(url, '_blank');
    }
  }

  openChangePeriod(modalTpl: TemplateRef<any>) {
    if (!this.editingId) return;
    this.changePeriodoId = null;
    this.createPeriodMode = false;
    this.newPeriodMonth = null;
    this.newPeriodYear = new Date().getFullYear();
    this.modalService.open(modalTpl, { centered: true, size: 'sm' });
  }

  toggleCreatePeriodMode() {
    this.createPeriodMode = !this.createPeriodMode;
    if (this.createPeriodMode) {
      this.changePeriodoId = null;
    }
  }

  saveChangePeriod(modal: any) {
    if (this.isPeriodoClosed) {
      this.alertsService.warning('No se puede cambiar el periodo de un servicio en un periodo cerrado.');
      return;
    }
    if (!this.editingId) return;

    if (this.createPeriodMode) {
      if (!this.newPeriodMonth || !this.newPeriodYear) {
        this.alertsService.error('Seleccione mes y año');
        return;
      }
      
      this.loading = true;
      this.periodoService.create(this.newPeriodMonth, this.newPeriodYear).subscribe({
        next: (ret) => {
          if (ret.success) {
            const newPeriodId = ret.data.id;
            
            if (this.selectedPeriodoId === newPeriodId) {
              this.loading = false;
              this.alertsService.error('El periodo destino no puede ser el mismo que el actual');
              return;
            }

            this.executeChangePeriod(newPeriodId, modal);
          } else {
            this.loading = false;
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.loading = false;
          this.alertsService.error(e.error);
        }
      });
    } else {
      if (!this.changePeriodoId) {
        this.alertsService.error('Seleccione un periodo');
        return;
      }

      if (this.selectedPeriodoId === this.changePeriodoId) {
        this.alertsService.error('El periodo destino no puede ser el mismo que el actual');
        return;
      }

      this.loading = true;
      this.executeChangePeriod(this.changePeriodoId, modal);
    }
  }

  executeChangePeriod(periodoId: number, modal: any) {
    this.servicioService.changePeriod(this.editingId!, periodoId).subscribe({
      next: (ret) => {
        this.loading = false;
        if (ret.success) {
          this.alertsService.success('Periodo actualizado exitosamente');
          this.loadServicios(); // This will refresh the list, possibly with the new period if selected
          this.loadPeriodos(); // Refresh period list in background
          modal.close();
          this.modalRef?.close(); // Close edit modal
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

  private showApiError(e: any, fallback: string) {
    let msg = fallback;

    if (!e) {
      this.alertsService.error(msg);
      return;
    }

    if (typeof e === 'string') {
      msg = e;
    } else if (typeof e.error === 'string') {
      msg = e.error;
    } else if (e.error && typeof e.error.error === 'string') {
      msg = e.error.error;
    } else if (e.message && typeof e.message === 'string') {
      msg = e.message;
    }

    this.alertsService.error(msg);
  }

  save(cerrar: boolean) {
    if (this.isPeriodoClosed) {
      this.alertsService.warning('No se pueden guardar cambios en un periodo cerrado.');
      return;
    }

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      this.alertsService.error('Por favor complete los campos requeridos');
      return;
    }

    const payload = this.form.value as any;
    
    if (payload.fo_Sucursal_otorgante_Id && payload.fo_Sucursal_Origen_Id && payload.fo_Sucursal_otorgante_Id === payload.fo_Sucursal_Origen_Id) {
      this.alertsService.error('La Sucursal Otorgante y la Sucursal Origen no pueden ser la misma.');
      return;
    }

    // Remove display-only fields or unexpected fields
    delete payload.displayFechaCaptura;
    
    // Cast to ServicioCreatePayload (though 'fecha' is gone now)
    const finalPayload = payload as ServicioCreatePayload;
    
    // Ensure numbers are numbers
    // payload.fori_Saldo_Contrato = Number(payload.fori_Saldo_Contrato);
    // ... handling this via form control type usually works, but safe to cast if needed.

    if (this.editingId == null) {
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        const val = payload[key];
        if (val !== null && val !== undefined) {
          formData.append(key, val);
        }
      });
      
      // Append files
      this.selectedFiles.forEach((file, key) => {
        if (key === 'fo_Documento_Cliente_url') {
           formData.append('file', file);
        }
      });

      this.isSaving = true;
      this.servicioService.create(formData).subscribe({
        next: (ret) => {
          this.isSaving = false;
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
        error: (e) => {
          this.isSaving = false;
          this.showApiError(e, 'Error al crear servicio');
        },
      });
    } else {
      this.isSaving = true;
      this.servicioService.update(this.editingId, finalPayload).subscribe({
        next: (ret) => {
          this.isSaving = false;
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
        error: (e) => {
          this.isSaving = false;
          this.showApiError(e, 'Error al actualizar servicio');
        },
      });
    }
  }

  onDelete(id: number) {
    this.alertsService.confirm({
      titulo: '¿Está seguro de eliminar este servicio?',
      message: 'Esta acción no se puede deshacer',
      okCallback: () => {
        this.loadingDeleteId = id;
        this.servicioService.delete(id).subscribe({
          next: (ret) => {
            this.loadingDeleteId = null;
            if (ret.success) {
              this.alertsService.success('Servicio eliminado');
              this.loadServicios();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.loadingDeleteId = null;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  togglePenalizado() {
    if (this.isPeriodoClosed) {
      this.alertsService.warning('No se puede modificar el estado penalizado en un periodo cerrado.');
      return;
    }

    if (!this.editingId) {
      return;
    }

    const nuevoEstado = !this.isPenalizado;
    const titulo = nuevoEstado ? '¿Penalizar servicio?' : '¿Despenalizar servicio?';
    const message = 'Esta acción actualizará el estado penalizado del servicio.';

    this.alertsService.confirm({
      titulo,
      message,
      okCallback: () => {
        this.loadingPenalizado = true;
        this.servicioService.updatePenalizado(this.editingId!, nuevoEstado).subscribe({
          next: (ret) => {
            this.loadingPenalizado = false;
            if (ret.success) {
              this.isPenalizado = nuevoEstado;
              this.alertsService.success(`Servicio ${this.isPenalizado ? 'penalizado' : 'despenalizado'} exitosamente`);
              this.loadServicios();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.loadingPenalizado = false;
            this.alertsService.error(e.error);
          },
        });
      },
    });
  }

  sortContrato = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Contrato || '').localeCompare(b.fo_Contrato || '');
  sortTitular = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Nombre_Titular || '').localeCompare(b.fo_Nombre_Titular || '');
  sortFinado = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Nombre_Finado || '').localeCompare(b.fo_Nombre_Finado || '');
  sortFecha = (a: ServicioPayload, b: ServicioPayload) => new Date(a.fo_Fecha_Servicio).getTime() - new Date(b.fo_Fecha_Servicio).getTime();
}
