import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { PeriodoPayload } from '../interfaces/payloads/periodo.payload';

@Injectable({
  providedIn: 'root',
})
export class PeriodoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/periodo`;

    return this.http.get<ApiReturn<PeriodoPayload[]>>(url).pipe(map((ret) => ret));
  }

  cerrar(id: number) {
    const url = `${this.baseUrl}/periodo/${id}/cerrar`;

    return this.http
      .patch<ApiReturn<PeriodoPayload>>(url, {})
      .pipe(map((ret) => ret));
  }

  abrir(id: number) {
    const url = `${this.baseUrl}/periodo/${id}/abrir`;

    return this.http
      .patch<ApiReturn<PeriodoPayload>>(url, {})
      .pipe(map((ret) => ret));
  }

  generarCedulas(anio: number, mes: number) {
    const url = `${this.baseUrl}/periodo/crear_cedulas`;
    return this.http
      .post<ApiReturn<any>>(url, { anio, mes })
      .pipe(map((ret) => ret));
  }
}
