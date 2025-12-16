import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  EstadoCtaStatusAdminPayload,
  EstadoCtaStatusDeletePayload,
} from '../interfaces/payloads/estado_cta_status.payload';

@Injectable({
  providedIn: 'root',
})
export class EstadoCtaStatusService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/estado_cta_status`;
    return this.http
      .get<ApiReturn<EstadoCtaStatusAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/estado_cta_status/${id}`;
    return this.http
      .get<ApiReturn<EstadoCtaStatusAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string }) {
    const url = `${this.baseUrl}/estado_cta_status`;
    return this.http
      .post<ApiReturn<EstadoCtaStatusAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string }) {
    const url = `${this.baseUrl}/estado_cta_status/${id}`;
    return this.http
      .put<ApiReturn<EstadoCtaStatusAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/estado_cta_status/${id}`;
    return this.http
      .delete<ApiReturn<EstadoCtaStatusDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

