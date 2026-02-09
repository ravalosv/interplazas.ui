import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';

@Injectable({
  providedIn: 'root'
})
export class ContratoProxyService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Consulta la información de un contrato a través del proxy del backend.
   * Esto evita problemas de CORS y centraliza la lógica de conexión.
   * @param filialId ID de la filial a la que pertenece el contrato
   * @param contrato Número de contrato
   */
  consultarContrato(filialId: number, contrato: string): Observable<ApiReturn<any>> {
    const url = `${this.apiUrl}/proxy/contrato`;
    const body = {
      filialId: filialId,
      contrato: contrato
    };

    return this.http.post<ApiReturn<any>>(url, body).pipe(
      map(res => res)
    );
  }
}
