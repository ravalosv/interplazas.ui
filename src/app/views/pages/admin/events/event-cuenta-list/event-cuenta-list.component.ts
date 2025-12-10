import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import { IngresosEgresosAddDTO } from 'src/app/core/interfaces/models/cuenta.dto';
import {
  IngresosEgresosCategoriasPayload,
  IngresosEgresosConceptosPayload,
  IngresosEgresosFormaPayload,
  IngresosEgresosGetPayload,
  IngresosEgresosStatusPayload,
  IngresosEgresosTipoPayload,
} from 'src/app/core/interfaces/payloads/cuenta.payload';
import {
  EventoPayload,
  grupoEvento,
} from 'src/app/core/interfaces/payloads/evento.payload';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CsvService } from 'src/app/core/services/csv.service';
import { CuentaService } from 'src/app/core/services/cuenta.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { EventoService } from 'src/app/core/services/evento.service';
import { TableService } from 'src/app/core/services/table.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-event-cuenta-list',
  templateUrl: './event-cuenta-list.component.html',
  styleUrls: ['./event-cuenta-list.component.scss'],
})
export class EventCuentaListComponent implements OnInit {
  allData: IngresosEgresosList[];
  displayData: IngresosEgresosList[];
  searchInput: string;

  //currentUser: IUser;
  eventoId: string;

  evento: EventoPayload | null = null;

  listTipoMovimiento: string[] = ['Ingreso', 'Egreso'];
  listTipoIngreso: IngresosEgresosTipoPayload[] = [];
  formRegistro!: FormGroup;
  grupos: grupoEvento[] = [];
  tipoMovimientoSelected: string = '';
  listFormas: IngresosEgresosFormaPayload[] = [];
  listConceptos: IngresosEgresosConceptosPayload[] = [];
  listCategorias: IngresosEgresosCategoriasPayload[] = [];
  listStatus: IngresosEgresosStatusPayload[] = [];
  
  // Variables para manejo de comprobante
  selectedComprobanteFile: File | null = null;
  comprobanteFileName: string = '';

  orderColumn = [
    {
      title: 'Tipo Evento',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.tipoMovimiento!.localeCompare(b.tipoMovimiento!.toString()),
    },
    {
      title: 'Cuenta',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.cuenta.toString().localeCompare(b.cuenta.toString()),
    },
    {
      title: 'Tipo Egreso/Ingreso',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.tipo.toString().localeCompare(b.tipo.toString()),
    },
    {
      title: 'Concepto',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.concepto.toString().localeCompare(b.concepto.toString()),
    },
    {
      title: 'Referencia',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.referencia!.localeCompare(b.referencia!),
    },
    {
      title: 'Aportación',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.aportacion! > b.aportacion! ? 1 : -1,
    },

    {
      title: 'Gasto',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.gasto! > b.gasto! ? 1 : -1,
    },
    {
      title: 'Forma',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.forma.localeCompare(b.forma),
    },
    {
      title: 'Categoría',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.categoria.localeCompare(b.categoria),
    },
    {
      title: 'Estatus',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.status.localeCompare(b.status),
    },
    {
      title: 'Comentario',
      compare: (a: IngresosEgresosList, b: IngresosEgresosList) =>
        a.comentario!.localeCompare(b.comentario),
    },
  ];

  formMode: string = 'adding'; // adding, reading

  constructor(
    public encryptionService: EncryptionService,
    private eventoService: EventoService,
    private alertsService: AlertsService,
    private tableSvc: TableService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private cuentaService: CuentaService,
    private clipboard: Clipboard,
    private CSVService: CsvService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = this.encryptionService.decrypt(id!);
    }

    this.displayData = [];
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  loadData() {
    if (this.eventoId) {
      this.loadRegistros();

      this.eventoService.getEventos('todos', this.eventoId, true).subscribe({
        next: (ret) => {
          if (ret.success) {
            this.evento = ret.data[0];
            this.grupos = ret.data[0].grupos;
          } else {
            this.alertsService.error(ret.error);
          }
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
    }
  }

  loadRegistros() {
    this.cuentaService
      .getIngresosEgresosByEventoId(this.eventoId)
      .pipe(
        map((ret) => {
          if (ret.success) {
            return ret.data.map(mapToIngresosEgresosList);
          } else {
            throw new Error(ret.error);
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.displayData = data;
          this.allData = data;
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
  }

  search() {
    const data = this.allData;
    this.displayData = this.tableSvc.search(this.searchInput, data);
  }

  openModal(content: TemplateRef<any>, data?: IngresosEgresosList) {
    this.formMode = data ? 'reading' : 'adding';
    this.formRegistro.reset();
    
    // Limpiar archivo seleccionado al abrir modal
    this.clearComprobanteFile();
    
    if (data) {
      this.formRegistro.get('id')?.setValue(data?.id);
      this.loadRegistro(data.id.toString());
    }
    // Size: xl, lg, md, sm
    this.modalService
      .open(content, { size: 'md' })
      .result.then((result) => {
        //this.basicModalCloseResult = 'Modal closed' + result;
      })
      .catch((res) => {});
  }

  initForm() {
    this.formRegistro = this.fb.group({
      id: [null, []],
      tipoMovimiento: [null, [Validators.required]],
      aportacion: [null, []], // [ Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$') ],
      gasto: [null, []], // [ Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$') ],

      idTipo: [null, []], //Validators.required
      idCuenta: [null, []], //Validators.required
      idForma: [null, []], //Validators.required
      idConcepto: [null, []], //Validators.required
      idCategoria: [null, []],
      referencia: [null, []], //Validators.required
      comentario: [null, []],
      comprobante: [null, []],
      downloadToken: [null, []],
      idStatus: [null, []],
    });

    this.formRegistro.get('tipoMovimiento')?.valueChanges.subscribe((value) => {
      this.tipoMovimientoSelected = value;
      this.formRegistro.get('idTipo')?.setValue('');

      this.loadTipos(value);

      if (value === 'Ingreso') {
        // Campos obligatorios para Ingreso: Aportacion, Tipo Ingreso y Cuenta
        this.formRegistro
          .get('aportacion')
          ?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]+$'),
          ]);
        this.formRegistro.get('idTipo')?.setValidators([Validators.required]);
        this.formRegistro.get('idCuenta')?.setValidators([Validators.required]);

        // Limpiar validadores para campos de egreso
        this.formRegistro.get('gasto')?.clearValidators();
        this.formRegistro.get('idForma')?.clearValidators();
        this.formRegistro.get('idConcepto')?.clearValidators();
        this.formRegistro.get('idCategoria')?.clearValidators();
        this.formRegistro.get('referencia')?.clearValidators();
        this.formRegistro.get('idStatus')?.clearValidators();
      } else {
        // Campos obligatorios para Egreso: Gasto, Forma, Tipo Egreso, Concepto, Categoria, Referencia y Estatus
        this.formRegistro
          .get('gasto')
          ?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]+$'),
          ]);
        this.formRegistro.get('idForma')?.setValidators([Validators.required]);
        this.formRegistro.get('idTipo')?.setValidators([Validators.required]);
        this.formRegistro.get('idConcepto')?.setValidators([Validators.required]);
        this.formRegistro.get('idCategoria')?.setValidators([Validators.required]);
        this.formRegistro.get('referencia')?.setValidators([Validators.required]);
        this.formRegistro.get('idStatus')?.setValidators([Validators.required]);

        // Limpiar validadores para campos de ingreso
        this.formRegistro.get('aportacion')?.clearValidators();
        this.formRegistro.get('idCuenta')?.clearValidators();

        this.loadFormas();
        this.loadConceptos();
        this.loadCategorias();
        this.loadStatus();
      }

      this.formRegistro.get('gasto')?.updateValueAndValidity();
      this.formRegistro.get('idForma')?.updateValueAndValidity();
      this.formRegistro.get('idConcepto')?.updateValueAndValidity();
      this.formRegistro.get('idCategoria')?.updateValueAndValidity();
      this.formRegistro.get('referencia')?.updateValueAndValidity();
      this.formRegistro.get('idStatus')?.updateValueAndValidity();
      this.formRegistro.get('aportacion')?.updateValueAndValidity();
      this.formRegistro.get('idTipo')?.updateValueAndValidity();
      this.formRegistro.get('idCuenta')?.updateValueAndValidity();

      this.formRegistro.updateValueAndValidity();
    });
  }

  loadTipos(tipoMovimiento: string) {
    this.cuentaService.getTipos(tipoMovimiento).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listTipoIngreso = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }

  loadFormas() {
    this.cuentaService.getFormas().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listFormas = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }

  loadConceptos() {
    this.cuentaService.getConceptos().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listConceptos = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }

  loadCategorias() {
    this.cuentaService.getCategorias().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listCategorias = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }

  loadStatus() {
    this.cuentaService.getStatus().subscribe({
      next: (ret) => {
        if (ret.success) {
          this.listStatus = ret.data;
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }

  loadRegistro(id: string) {
    this.cuentaService.getIngresosEgresosById(id).subscribe({
      next: (ret) => {
        if (ret.success) {
          const data = mapToIngresosEgresosList(ret.data);
          this.formRegistro.patchValue(data);
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });
  }
  guardarRegistro(closeModal: boolean) {
    if (this.formRegistro.invalid) {
      return;
    }

    // Crear objeto con solo los campos necesarios según el tipo de movimiento
    let dataToSend: any = {
      eventoId: this.eventoId,
      tipoMovimiento: this.formRegistro.get('tipoMovimiento')?.value,
      idTipo: this.formRegistro.get('idTipo')?.value,
      comentario: this.formRegistro.get('comentario')?.value || ''
    };

    if (this.tipoMovimientoSelected === 'Ingreso') {
      // Solo campos necesarios para Ingreso
      dataToSend.aportacion = this.formRegistro.get('aportacion')?.value;
      dataToSend.idCuenta = this.formRegistro.get('idCuenta')?.value;
      dataToSend.comprobante = this.formRegistro.get('comprobante')?.value || '';
    } else {
      // Solo campos necesarios para Egreso
      dataToSend.gasto = this.formRegistro.get('gasto')?.value;
      dataToSend.idForma = this.formRegistro.get('idForma')?.value;
      dataToSend.idConcepto = this.formRegistro.get('idConcepto')?.value;
      dataToSend.idCategoria = this.formRegistro.get('idCategoria')?.value;
      dataToSend.referencia = this.formRegistro.get('referencia')?.value;
      dataToSend.idStatus = this.formRegistro.get('idStatus')?.value;
      dataToSend.comprobante = this.formRegistro.get('comprobante')?.value || '';
    }

    if (!this.formRegistro.get('id')?.value) {
      // Crear nuevo registro
      this.cuentaService
        .addIngresoEgreso(dataToSend)
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Registro guardado correctamente');
              
              // Asignar el ID del registro creado al formulario para evitar duplicados
              if (ret.data?.id) {
                this.formRegistro.get('id')?.setValue(ret.data.id);
              }
              
              // Si hay un archivo seleccionado, subirlo
              if (this.selectedComprobanteFile && ret.data?.id) {
                this.uploadComprobanteFile(ret.data.id, closeModal);
              } else {
                this.finalizarGuardado(closeModal);
              }
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.alertsService.error(e);
          },
          complete: () => {},
        });
    } else {
      // Actualizar registro existente
      // Construir objeto con solo los campos necesarios según el tipo de movimiento
      const baseData = {
        eventoId: this.eventoId,
        tipoMovimiento: this.formRegistro.get('tipoMovimiento')?.value,
        comentario: this.formRegistro.get('comentario')?.value || '',
        createdByUserId: this.formRegistro.get('createdByUserId')?.value
      };

      let dataToSend: any;
      if (this.tipoMovimientoSelected === 'Ingreso') {
        dataToSend = {
          ...baseData,
          aportacion: this.formRegistro.get('aportacion')?.value,
          idTipo: this.formRegistro.get('idTipo')?.value,
          idCuenta: this.formRegistro.get('idCuenta')?.value,
          comprobante: this.formRegistro.get('comprobante')?.value || ''
        };
      } else {
        dataToSend = {
          ...baseData,
          gasto: this.formRegistro.get('gasto')?.value,
          idForma: this.formRegistro.get('idForma')?.value,
          idTipo: this.formRegistro.get('idTipo')?.value,
          idConcepto: this.formRegistro.get('idConcepto')?.value,
          idCategoria: this.formRegistro.get('idCategoria')?.value,
          referencia: this.formRegistro.get('referencia')?.value,
          idStatus: this.formRegistro.get('idStatus')?.value,
          comprobante: this.formRegistro.get('comprobante')?.value || ''
        };
      }

      this.cuentaService
        .updateIngresoEgreso(
          dataToSend,
          this.formRegistro.get('id')?.value
        )
        .subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Registro actualizado correctamente');
              
              // Si hay un archivo seleccionado, subirlo
              if (this.selectedComprobanteFile) {
                this.uploadComprobanteFile(this.formRegistro.get('id')?.value, closeModal);
              } else {
                this.finalizarGuardado(closeModal);
              }
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.alertsService.error(e);
          },
          complete: () => {},
        });
    }
  }

  private uploadComprobanteFile(registroId: number, closeModal: boolean) {
    if (!this.selectedComprobanteFile) {
      this.finalizarGuardado(closeModal);
      return;
    }

    this.cuentaService.uploadComprobante(registroId, this.selectedComprobanteFile)
      .subscribe({
        next: (ret) => {
          if (ret.success) {
            this.alertsService.success('Comprobante cargado exitosamente');
            this.clearComprobanteFile();
            this.finalizarGuardado(closeModal);
          } else {
            this.alertsService.error('Error al cargar el comprobante: ' + ret.error);
            // No resetear el formulario para permitir reintento
          }
        },
        error: (e) => {
          this.alertsService.error('Error al cargar el comprobante');
          // No resetear el formulario para permitir reintento
        }
      });
  }

  private finalizarGuardado(closeModal: boolean) {
    this.formRegistro.reset();
    this.clearComprobanteFile();
    
    if (closeModal) {
      this.modalService.dismissAll();
    }
    this.loadRegistros();
  }

  eliminarRegistro() {
    if (!this.formRegistro.get('id')?.value) return;

    var id = this.formRegistro.get('id')?.value;

    this.alertsService.confirm({
      titulo: '¿Estás seguro de eliminar este registro?',
      message: 'Esta acción no se puede deshacer',
      okCallback: () => {
        this.cuentaService.delete(id).subscribe({
          next: (ret) => {
            if (ret.success) {
              this.alertsService.success('Registro eliminado correctamente');
              this.formRegistro.reset();
              this.modalService.dismissAll();
              this.loadRegistros();
            } else {
              this.alertsService.error(ret.error);
            }
          },
          error: (e) => {
            this.alertsService.error(e);
          },
          complete: () => {},
        });
      },
    });
  }

  descargarCsv() {
    this.cuentaService
      .getIngresosEgresosByEventoId(this.eventoId)
      .pipe(
        map((ret) => {
          if (ret.success) {
            return ret.data.map(this.mapToIngresosEgresosCsv);
          } else {
            throw new Error(ret.error);
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.CSVService.downloadCSV(
            data,
            'Cuenta-' + this.evento!.nombre! + '.csv'
          );
        },
        error: (e) => {
          this.alertsService.error(e);
        },
        complete: () => {},
      });
  }

  mapToIngresosEgresosCsv(data: any): IngresosEgresosCsv {
    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Intl.DateTimeFormat('es-ES', options).format(date);
    };

    return {
      //id: data.id,
      tipo_Movimiento: data.tipoMovimiento,
      cuenta: data.cuenta ? data.cuenta?.nombre! : '',
      tipo: data.tipo?.tipo!,
      concepto: data.concepto ? data.concepto?.concepto! : '',
      referencia: data.referencia ? data.referencia : '',
      aportacion: data.aportacion ? data.aportacion : 0,
      gasto: data.gasto ? data.gasto : 0,
      forma: data.forma ? data.forma?.forma! : '',
      categoria: data.categoria ? data.categoria?.categoria! : '',
      status: data.status ? data.status?.status! : '',
      comentario: data.comentario ? data.comentario : '',
      comprobante: data.comprobante ? data.comprobante : '',
      usuario: data.usuario ? data.usuario?.name! : '',
      fecha_Creacion: formatDate(new Date(data.createdAt)),
    };
  }

  public archivos: File[] = [];
  imagenPrevia: any;
  loading: boolean = false;
  nuevoArchivoCargado: boolean = false;
  capturarFile(event: any) {
    const archivoCapturado = event.target.files[0];

    if (archivoCapturado) {
      this.archivos.length = 0;
      this.archivos.push(archivoCapturado);

      this.nuevoArchivoCargado = true;

      this.mostrarDistribucionMesas(archivoCapturado);
    }
  }

  mostrarDistribucionMesas(archivoCapturado: any) {
    this.blobFile(archivoCapturado).then((res: any) => {
      this.imagenPrevia = res.base;
    });
  }

  blobFile = async ($event: any) =>
    new Promise((resolve, reject) => {
      try {
        const unsafeImg = window.URL.createObjectURL($event);
        const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
        const reader = new FileReader();
        reader.readAsDataURL($event);
        reader.onload = () => {
          resolve({
            blob: $event,
            image,
            base: reader.result,
          });
        };
        reader.onerror = (error) => {
          resolve({
            blob: $event,
            image,
            base: null,
          });
        };
      } catch (e) {
        resolve(null);
      }
    });

  urlDownload: string;
  subirArchivo() {
    try {
      const formData = new FormData();
      this.archivos.forEach((item: any) => {
        formData.append('file', item);
      });
      this.loading = true;
      this.eventoService
        .uploadCuentaFile(this.eventoId!, formData)
        .subscribe((res) => {
          this.loading = false;
          if (res.success) {
            this.urlDownload = res.data;
            this.clipboard.copy(this.urlDownload);

            this.alertsService.success(
              'Archivo subido correctamente. Se ha copiado la URL al portapapeles'
            );
          } else {
            this.alertsService.error(res.error);
          }
        });
    } catch (e) {
      this.loading = false;
      this.alertsService.error('Error al subir archivo');
    } finally {
    }
  }

  compartirNuevo() {
    this.urlDownload = '';
    this.nuevoArchivoCargado = false;
    this.formMode = 'adding';
  }

  copyToClipboard() {
    this.clipboard.copy(this.urlDownload);

    this.alertsService.success('Se ha copiado la URL al portapapeles');
  }

  openLoadImageModal(content: TemplateRef<any>) {
    this.nuevoArchivoCargado = false;
    this.cuentaService.getFileUrl(this.eventoId).subscribe({
      next: (ret) => {
        if (ret.success) {
          this.urlDownload = ret.data;

          if (ret.data != '') {
            this.formMode = 'reading';
          } else {
            this.formMode = 'adding';
          }

          this.openBasicModal(content);
        } else {
          this.alertsService.error(ret.error);
        }
      },
      error: (e) => {
        this.alertsService.error(e);
      },
      complete: () => {},
    });

    //this.openBasicModal(content);
  }

  openBasicModal(content: TemplateRef<any>) {
    // Size: xl, lg, sm
    this.modalService
      .open(content, { size: 'lg' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  // Métodos para manejo de comprobante
  onComprobanteFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo (PDF o imagen)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.type)) {
        this.selectedComprobanteFile = file;
        this.comprobanteFileName = file.name;
      } else {
        this.alertsService.error('Solo se permiten archivos PDF o imágenes (JPG, PNG, GIF)');
        event.target.value = '';
      }
    }
  }

  clearComprobanteFile() {
    this.selectedComprobanteFile = null;
    this.comprobanteFileName = '';
  }

  getComprobanteButtonText(): string {
    const currentComprobante = this.formRegistro.get('comprobante')?.value;
    return currentComprobante ? 'Modificar' : 'Cargar Comprobante';
  }

  hasComprobante(): boolean {
    const currentComprobante = this.formRegistro.get('comprobante')?.value;
    if (!currentComprobante) {
      return false;
    }
    
    // Si es un string, usar trim()
    if (typeof currentComprobante === 'string') {
      return currentComprobante.trim() !== '';
    }
    
    // Si es un objeto, verificar si tiene fileName o filePath
    if (typeof currentComprobante === 'object') {
      return !!(currentComprobante.fileName || currentComprobante.filePath || currentComprobante.message);
    }
    
    return false;
  }

  mostrarComprobante() {
    const downloadToken = this.formRegistro.get('downloadToken')?.value;
    if (downloadToken && this.hasComprobante()) {
      this.cuentaService.downloadCuentaFile(downloadToken).subscribe({
        next: (response) => {
          if (response.body) {
            // Crear un enlace temporal para descargar el archivo
            const blob = response.body;
            const url = window.URL.createObjectURL(blob);
            
            // Obtener el nombre del archivo desde los headers o usar uno por defecto
            const contentDisposition = response.headers.get('content-disposition');
            let fileName = 'comprobante';
            
            if (contentDisposition) {
              const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
              if (fileNameMatch) {
                fileName = fileNameMatch[1];
              }
            }
            
            // Crear enlace temporal y hacer clic para descargar
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('Error al descargar comprobante:', error);
          this.alertsService.error('Error al descargar el comprobante');
        }
      });
    }
  }

  eliminarComprobante() {
    const registroId = this.formRegistro.get('id')?.value;
    
    if (!registroId) {
      this.alertsService.error('No hay registro seleccionado');
      return;
    }

    // Mostrar confirmación antes de eliminar
    this.alertsService.confirm({
      titulo: '¿Está seguro de que desea eliminar el comprobante?',
      message: 'Esta acción no se puede deshacer',
      okCallback: () => {
        this.cuentaService.deleteComprobante(registroId).subscribe({
          next: (response) => {
            if (response.success) {
              this.alertsService.success('Comprobante eliminado exitosamente');
              
              // Actualizar el formulario con los datos actualizados
              const updatedData = mapToIngresosEgresosList(response.data);
              this.formRegistro.patchValue({
                comprobante: updatedData.comprobante,
                downloadToken: updatedData.downloadToken
              });
              
              // Limpiar el archivo seleccionado temporalmente
              this.selectedComprobanteFile = null;
              this.comprobanteFileName = '';
              
              // Recargar la lista de registros
              this.loadRegistros();
            } else {
              this.alertsService.error(response.error || 'Error al eliminar el comprobante');
            }
          },
          error: (error) => {
            console.error('Error al eliminar comprobante:', error);
            this.alertsService.error('Error al eliminar el comprobante');
          }
        });
      }
    });
  }


}

interface IngresosEgresosList {
  id: number;
  eventoId: number;
  tipoMovimiento: string;
  aportacion: number;
  gasto: number;
  idTipo: number;
  tipo: string;
  idForma: number;
  forma: string;
  idCuenta: number;
  cuenta: string;
  idConcepto: number;
  concepto: string;
  idCategoria: number;
  categoria: string;
  referencia: string;
  idStatus: number;
  status: string;
  comentario: string;
  comprobante: string;
  downloadToken?: string;
  createdByUserId: number;
  createdAt: Date;
  updatedAt: Date;
}

function mapToIngresosEgresosList(data: any): IngresosEgresosList {
  return {
    id: data.id,
    eventoId: data.eventoId,
    tipoMovimiento: data.tipoMovimiento,
    aportacion: data.aportacion ? data.aportacion : 0,
    gasto: data.gasto ? data.gasto : 0,
    idTipo: data.idTipo,
    tipo: data.tipo?.tipo!,
    idForma: data.idForma,
    forma: data.forma ? data.forma?.forma! : '',
    idCuenta: data.idCuenta,
    cuenta: data.cuenta ? data.cuenta?.nombre! : '',
    idConcepto: data.idConcepto,
    concepto: data.concepto ? data.concepto?.concepto! : '',
    idCategoria: data.idCategoria,
    categoria: data.categoria ? data.categoria?.categoria! : '',
    referencia: data.referencia ? data.referencia : '',
    idStatus: data.idStatus,
    status: data.status ? data.status?.status! : '',
    comentario: data.comentario ? data.comentario : '',
    comprobante: data.comprobante ? data.comprobante : '',
    downloadToken: data.downloadToken ? data.downloadToken : '',
    createdByUserId: data.createdByUserId,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

interface IngresosEgresosCsv {
  tipo_Movimiento: string;
  cuenta: string;
  tipo: string;
  concepto: string;
  referencia: string;
  aportacion: number;
  gasto: number;
  forma: string;
  categoria: string;
  status: string;
  comentario: string;
  comprobante: string;
  usuario: string;
  fecha_Creacion: string;
}
