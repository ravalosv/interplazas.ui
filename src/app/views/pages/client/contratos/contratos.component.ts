import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { FilialAdminPayload } from 'src/app/core/interfaces/payloads/filial.payload';
import { environment } from 'src/environments/environment';
import { ContratoProxyService } from 'src/app/core/services/contrato-proxy.service';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  @Input() isModal: boolean = false;
  @Input() initialFilialId: number | null = null;
  @Output() contractSelected = new EventEmitter<{ contrato: string, data: any }>();

  contratoInput: string = '';
  consultando: boolean = false;
  resultado: any = null;
  filiales: FilialAdminPayload[] = [];
  selectedFilialId: number | null = null;
  errorMessage: string | null = null;
  
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private filialService: FilialService,
    private alertsService: AlertsService,
    private contratoProxyService: ContratoProxyService
  ) { }

  ngOnInit(): void {
    this.loadFiliales();
  }

  loadFiliales() {
    this.filialService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Filtrar filiales que tienen API configurada (requerimiento explícito)
          this.filiales = res.data.filter(f => f.utilizaApi === true);
          
          if (this.initialFilialId) {
            const exists = this.filiales.find(f => f.id === this.initialFilialId);
            if (exists) {
              this.selectedFilialId = this.initialFilialId;
            }
          }
        } else {
          this.alertsService.error('No se pudo cargar el listado de filiales.');
        }
      },
      error: (err) => {
        console.error(err);
        this.alertsService.error('Error al cargar las filiales.');
      }
    });
  }

  consultar() {
    this.errorMessage = null;
    this.resultado = null;

    if (!this.selectedFilialId) {
      this.alertsService.error('Seleccione una filial.');
      return;
    }

    const filial = this.filiales.find(f => f.id === this.selectedFilialId);

    if (!filial) {
      this.alertsService.error('Filial no encontrada.');
      return;
    }

    if (!filial.apiUrl) {
      this.alertsService.error('La filial seleccionada no tiene configurada la API URL.');
      return;
    }

    if (!this.contratoInput || this.contratoInput.trim() === '') {
      this.alertsService.error('Ingrese un número de contrato.');
      return;
    }

    const contrato = this.contratoInput.trim();
    this.consultando = true;

      this.contratoProxyService.consultarContrato(filial.id, contrato).subscribe({
        next: (res) => {
          this.consultando = false;
          if (!res.success) {
            this.errorMessage = res.error || 'Error en la consulta vía Proxy';
            this.alertsService.error(this.errorMessage!);
            return;
          }
          this.alertsService.success('Consulta exitosa (vía Proxy)');
          this.resultado = res.data;
        },
        error: (err) => {
          this.consultando = false;
          console.error('Error Proxy:', err);
          let errorMsg = err.error?.error || 'Error al consultar mediante Proxy.';
          this.errorMessage = errorMsg;
          this.alertsService.error(errorMsg);
        }
      });
      return;

    // Logic adapted from ServicioCrudComponent

    }

  limpiar() {
    this.contratoInput = '';
    this.resultado = null;
    this.errorMessage = null;
    // Opcional: limpiar filial seleccionada
    // this.selectedFilialId = null;
  }

  usarContrato() {
    if (this.resultado && this.contratoInput) {
      this.contractSelected.emit({
        contrato: this.contratoInput,
        data: this.resultado
      });
    }
  }

}
