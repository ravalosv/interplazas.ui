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
  activeTab = 2;
  maxDate: string = '';
  isPenalizado: boolean = false;
  isAdmin: boolean = false;
  apiUrl = environment.apiUrl;
  selectedFiles: Map<string, File> = new Map();
  captureUserName: string = '';
  
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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.initForm();
    this.loadCatalogs();
    this.loadPeriodos();
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
      exp_Enviado_Grupo_Whats: [false, []],
      exp_Motivo_De_No_Otorgado_Id: [null, []],
      exp_Expediente_Completo: ['NO', []],
      exp_Observaciones_cierre: ['', []],
      // Usuario_CapturaId & Fecha_Captura handled by backend usually
    });

    this.form.get('fo_Sucursal_Origen_Id')?.valueChanges.subscribe(val => {
      this.selectedSucursalOrigen = this.sucursales.find(s => s.id === val);
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
      }

      // Subscription
      convenioCheck.valueChanges.subscribe(val => {
        if (val) {
          montoControl.enable();
        } else {
          montoControl.setValue(0);
          montoControl.disable();
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
      return (
        (item.fo_Contrato && item.fo_Contrato.toLowerCase().includes(term)) ||
        (item.fo_Nombre_Titular && item.fo_Nombre_Titular.toLowerCase().includes(term)) ||
        (item.fo_Nombre_Finado && item.fo_Nombre_Finado.toLowerCase().includes(term)) ||
        (item.sucursalOrigen?.nombre && item.sucursalOrigen.nombre.toLowerCase().includes(term)) ||
        (item.sucursalOtorgante?.nombre && item.sucursalOtorgante.nombre.toLowerCase().includes(term)) ||
        (item.fo_Fecha_Servicio && item.fo_Fecha_Servicio.toLowerCase().includes(term))
      );
    });
  }

  openCreate(modalTpl: TemplateRef<any>) {
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
      exp_Enviado_Grupo_Whats: item.exp_Enviado_Grupo_Whats,
      exp_Motivo_De_No_Otorgado_Id: item.exp_Motivo_De_No_Otorgado_Id,
      exp_Expediente_Completo: item.exp_Expediente_Completo,
      exp_Observaciones_cierre: item.exp_Observaciones_cierre,
    });
    this.observaciones = [];
    this.nuevaObservacion = '';
    this.loadObservaciones(item.id);
    this.modalTitle = 'Editar Servicio';
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

  consultarContrato() {
    if (!this.selectedSucursalOrigen?.filial?.apiUrl) return;

    const contrato = this.form.get('fo_Contrato')?.value;
    if (!contrato) {
      this.alertsService.error('Ingrese un número de contrato');
      return;
    }

    this.consultandoContrato = true;
    const url = this.selectedSucursalOrigen.filial.apiUrl.replace('{contrato}', contrato);
    
    // Ensure API Key is retrieved correctly
    const apiKey = this.selectedSucursalOrigen.filial.apiKey;
    console.log('Enviando petición a:', url);
    console.log('Con api-key:', apiKey ? '***' + apiKey.slice(-4) : '(vacio)');

    let headers = new HttpHeaders();
    if (apiKey) {
      headers = headers.set('api-key', apiKey);
    }

    this.http.get(url, { headers }).subscribe(
      (res: any) => {
        this.consultandoContrato = false;

        if (!res.success) {
          this.alertsService.error(res.error || 'Error en la consulta');
          return;
        }

        this.alertsService.success('Consulta exitosa');
        
        if (res.data) {
          // Map Saldo
          if (res.data.saldo !== undefined) {
            this.form.patchValue({ fori_Saldo_Contrato: res.data.saldo });
          }

          // Map Status
          if (res.data.status) {
            // Find status ID by name (case insensitive)
            const statusName = res.data.status.toString().toUpperCase();
            const foundStatus = this.statuses.find(s => s.nombre && s.nombre.toUpperCase() === statusName);
            
            if (foundStatus) {
              this.form.patchValue({ fori_Status_Contrato_Id: foundStatus.id });
            } else {
              console.warn('Status not found in catalog:', res.data.status);
            }
          }

          // Map Titular if present (optional based on previous intent, though not in example)
          if (res.data.nombre_titular || res.data.NombreTitular) {
             this.form.patchValue({ fo_Nombre_Titular: res.data.nombre_titular || res.data.NombreTitular });
          }
        }
      },
      (err) => {
        this.consultandoContrato = false;
        console.error('Error completo (raw):', err);
        console.error('Error stringified:', JSON.stringify(err));
        
        let errorMsg = '';
        
        // 1. Try to extract from JSON body { "success": false, "error": "MSG" }
        if (err.error && err.error.error) {
          errorMsg = err.error.error;
        } 
        // 2. Try to extract if body is just a string
        else if (err.error && typeof err.error === 'string') {
          errorMsg = err.error;
        } 
        // 3. Fallback to Status Code if body is empty (common in CORS issues)
        else {
           switch (err.status) {
             case 400:
               errorMsg = 'API_KEY_REQUIRED'; // Fallback assumption based on user requirements
               break;
             case 401:
               errorMsg = 'UNAUTHORIZED';
               break;
             case 404:
               errorMsg = 'Contrato no encontrado';
               break;
             default:
               errorMsg = err.message || 'Error al consultar contrato';
           }
        }

        // Map specific error codes to user-friendly messages
        switch (errorMsg) {
          case 'API_KEY_REQUIRED':
            errorMsg = 'Error: Falta configurar la API Key en la filial o no se envió correctamente (API_KEY_REQUIRED)';
            break;
          case 'UNAUTHORIZED':
            errorMsg = 'Error: La API Key configurada es incorrecta o no tiene permisos (UNAUTHORIZED)';
            break;
          case 'Contrato no encontrado':
            errorMsg = 'El contrato especificado no existe en el sistema externo';
            break;
          case 'Compañía no encontrada':
            errorMsg = 'La compañía asociada no fue encontrada en el sistema externo';
            break;
        }

        this.alertsService.error(errorMsg);
      }
    );
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
    return !!this.form.get(fieldName)?.value || this.selectedFiles.has(fieldName);
  }

  triggerFileUpload(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.alertsService.error('Solo se permiten archivos PDF o Imágenes (JPG, PNG)');
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
            }
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

  save(cerrar: boolean) {
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

      this.servicioService.create(formData).subscribe({
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
        error: (e) => this.alertsService.error(e.error),
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
        error: (e) => this.alertsService.error(e.error),
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
          error: (e) => this.alertsService.error(e.error),
        });
      },
    });
  }

  togglePenalizado() {
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
        this.servicioService.updatePenalizado(this.editingId!, nuevoEstado).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.isPenalizado = nuevoEstado;
              this.alertsService.success(`Servicio ${this.isPenalizado ? 'penalizado' : 'despenalizado'} exitosamente`);
              this.loadServicios();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => this.alertsService.error(e.error),
        });
      },
    });
  }

  sortContrato = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Contrato || '').localeCompare(b.fo_Contrato || '');
  sortTitular = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Nombre_Titular || '').localeCompare(b.fo_Nombre_Titular || '');
  sortFinado = (a: ServicioPayload, b: ServicioPayload) => (a.fo_Nombre_Finado || '').localeCompare(b.fo_Nombre_Finado || '');
  sortFecha = (a: ServicioPayload, b: ServicioPayload) => new Date(a.fo_Fecha_Servicio).getTime() - new Date(b.fo_Fecha_Servicio).getTime();
}
