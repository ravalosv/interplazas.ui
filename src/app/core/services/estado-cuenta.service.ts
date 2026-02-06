import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';

@Injectable({
  providedIn: 'root',
})
export class EstadoCuentaService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generar(periodoId: number) {
    const url = `${this.baseUrl}/estado-cuenta/generar`;
    return this.http
      .post<ApiReturn<any>>(url, { periodoId })
      .pipe(map((ret) => ret));
  }

  getAllMovimientos() {
    const url = `${this.baseUrl}/estado-cuenta/movimientos`;
    return this.http
      .get<ApiReturn<any>>(url)
      .pipe(map((ret) => ret.data));
  }

  getTiposMovimiento() {
    const url = `${this.baseUrl}/estado-cuenta/tipos-movimiento`;
    return this.http
      .get<ApiReturn<any>>(url)
      .pipe(map((ret) => ret.data));
  }

  createMovimiento(payload: any, file?: File) {
    const url = `${this.baseUrl}/estado-cuenta/movimiento`;
    const formData = new FormData();
    
    // Append all payload fields
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      if (value !== null && value !== undefined) {
          // Handle Date objects if necessary, though standard toString() might work for some backends, 
          // usually ISO string is safer. But here payload seems to be raw values.
          if (value instanceof Date) {
             formData.append(key, value.toISOString());
          } else {
             formData.append(key, value);
          }
      }
    });

    if (file) {
      formData.append('file', file);
    }

    return this.http
      .post<ApiReturn<any>>(url, formData)
      .pipe(map((ret) => ret));
  }

  updateMovimiento(id: number, payload: any) {
    const url = `${this.baseUrl}/estado-cuenta/movimiento/${id}`;
    return this.http
      .put<ApiReturn<any>>(url, payload)
      .pipe(map((ret) => ret));
  }

  uploadComprobante(id: number, file: File) {
    const url = `${this.baseUrl}/estado-cuenta/movimiento/${id}/comprobante`;
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiReturn<any>>(url, formData)
      .pipe(map((ret) => ret));
  }

  deleteComprobante(id: number) {
    const url = `${this.baseUrl}/estado-cuenta/movimiento/${id}/comprobante`;
    return this.http
      .delete<ApiReturn<any>>(url)
      .pipe(map((ret) => ret));
  }
}
