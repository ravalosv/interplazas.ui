import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { FilialService } from 'src/app/core/services/filial.service';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { FilialAdminPayload } from 'src/app/core/interfaces/payloads/filial.payload';

@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {

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
    private alertsService: AlertsService
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

    // Logic adapted from ServicioCrudComponent
    const urlTemplate = filial.apiUrl.trim();
    let url = '';

    if (urlTemplate.includes('{contrato}')) {
      url = urlTemplate.replace('{contrato}', contrato);
    } else {
      const baseUrl = urlTemplate.replace(/\/$/, '');
      url = `${baseUrl}/contratos/info/1/${contrato}`;
    }

    const apiKey = filial.apiKey ? filial.apiKey.trim() : '';

    let headers = new HttpHeaders();
    if (apiKey) {
      headers = headers.set('api-key', apiKey);
      console.log('Header api-key valor:', headers.get('api-key')); 
    }

    this.http.get(url, { headers }).subscribe({
      next: (res: any) => {
        this.consultando = false;
        if (!res.success) {
          this.errorMessage = res.error || 'Error en la consulta';
          this.alertsService.error(this.errorMessage!);
          return;
        }

        this.alertsService.success('Consulta exitosa');
        this.resultado = res.data;
      },
      error: (err) => {
        this.consultando = false;
        console.error('Error completo:', err);
        
        let errorMsg = 'Error al consultar el contrato.';
        
        if (err.status === 0) {
            errorMsg = 'Error de conexión (Status 0). Posibles causas: \n1. Bloqueo CORS.\n2. URL mal formada.\n3. Servidor no disponible.';
        } else if (err.error && err.error.error) {
            errorMsg = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
            errorMsg = err.error;
        } else {
            switch (err.status) {
             case 400: errorMsg = 'Error de solicitud (400). Verifique los datos enviados.'; break;
             case 401: errorMsg = 'No autorizado (401). Verifique la API Key.'; break;
             case 403: errorMsg = 'Prohibido (403). No tiene permisos.'; break;
             case 404: errorMsg = 'Contrato no encontrado (404).'; break;
             default: errorMsg = err.message || 'Error desconocido.';
            }
        }
        this.errorMessage = errorMsg;
        this.alertsService.error(errorMsg);
      }
    });
  }

  limpiar() {
    this.contratoInput = '';
    this.resultado = null;
    this.errorMessage = null;
    // Opcional: limpiar filial seleccionada
    // this.selectedFilialId = null;
  }

}
