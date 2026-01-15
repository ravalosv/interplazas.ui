import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';

export interface ServicioObservacionPayload {
  id: number;
  observacion: string;
  usuarioId: number;
  servicioId: number;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ServicioObservacionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByServicio(servicioId: number) {
    const url = `${this.baseUrl}/servicio/${servicioId}/observaciones`;
    return this.http
      .get<ApiReturn<ServicioObservacionPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  create(servicioId: number, observacion: string) {
    const url = `${this.baseUrl}/servicio/${servicioId}/observaciones`;
    return this.http
      .post<ApiReturn<ServicioObservacionPayload>>(url, { observacion })
      .pipe(map((ret) => ret));
  }

  delete(servicioId: number, observacionId: number) {
    const url = `${this.baseUrl}/servicio/${servicioId}/observaciones/${observacionId}`;
    return this.http
      .delete<ApiReturn<{ message: string }>>(url)
      .pipe(map((ret) => ret));
  }
}
