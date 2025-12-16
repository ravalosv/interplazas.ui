import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  TipoServicioAdminPayload,
  TipoServicioDeletePayload,
} from '../interfaces/payloads/tipo_servicio.payload';

@Injectable({
  providedIn: 'root',
})
export class TipoServicioService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/tipo_servicio`;
    return this.http
      .get<ApiReturn<TipoServicioAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/tipo_servicio/${id}`;
    return this.http
      .get<ApiReturn<TipoServicioAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_servicio`;
    return this.http
      .post<ApiReturn<TipoServicioAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_servicio/${id}`;
    return this.http
      .put<ApiReturn<TipoServicioAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/tipo_servicio/${id}`;
    return this.http
      .delete<ApiReturn<TipoServicioDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

