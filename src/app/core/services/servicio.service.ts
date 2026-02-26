import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { ServicioCreatePayload, ServicioPayload } from '../interfaces/payloads/servicio.payload';

@Injectable({
  providedIn: 'root',
})
export class ServicioService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/servicio`;
    return this.http
      .get<ApiReturn<ServicioPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getByDate(year: number, month: number) {
    const url = `${this.baseUrl}/servicio/fecha/${year}/${month}`;
    return this.http
      .get<ApiReturn<ServicioPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getByPeriodo(periodoId: number) {
    const url = `${this.baseUrl}/servicio/periodo/${periodoId}`;
    return this.http
      .get<ApiReturn<ServicioPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/servicio/${id}`;
    return this.http
      .get<ApiReturn<ServicioPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: ServicioCreatePayload | FormData) {
    const url = `${this.baseUrl}/servicio`;
    return this.http
      .post<ApiReturn<ServicioPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: ServicioCreatePayload) {
    const url = `${this.baseUrl}/servicio/${id}`;
    return this.http
      .put<ApiReturn<ServicioPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  uploadDocument(id: number, fieldName: string, file: File) {
    const url = `${this.baseUrl}/servicio/${id}/upload?fieldName=${fieldName}`;
    const formData = new FormData();
    formData.append('fieldName', fieldName);
    formData.append('file', file);
    return this.http
      .post<ApiReturn<ServicioPayload>>(url, formData)
      .pipe(map((ret) => ret));
  }

  deleteDocument(id: number, fieldName: string) {
    const url = `${this.baseUrl}/servicio/${id}/document/${fieldName}`;
    return this.http
      .delete<ApiReturn<any>>(url)
      .pipe(map((ret) => ret));
  }

  updatePenalizado(id: number, penalizado: boolean) {
    const url = `${this.baseUrl}/servicio/${id}/penalizado`;
    return this.http
      .patch<ApiReturn<ServicioPayload>>(url, { penalizado })
      .pipe(map((ret) => ret));
  }

  changePeriod(id: number, periodoId: number) {
    const url = `${this.baseUrl}/servicio/${id}/change-period`;
    return this.http
      .patch<ApiReturn<ServicioPayload>>(url, { periodoId })
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/servicio/${id}`;
    return this.http
      .delete<ApiReturn<{ message: string }>>(url)
      .pipe(map((ret) => ret));
  }

  sendExpedienteEmail(id: number) {
    const url = `${this.baseUrl}/servicio/${id}/send-expediente-email`;
    return this.http
      .post<ApiReturn<{ sent: boolean }>>(url, {})
      .pipe(map((ret) => ret));
  }
}
