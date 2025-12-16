import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  TipoDocumentoAdminPayload,
  TipoDocumentoDeletePayload,
} from '../interfaces/payloads/tipo_documento.payload';

@Injectable({
  providedIn: 'root',
})
export class TipoDocumentoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/tipo_documento`;
    return this.http
      .get<ApiReturn<TipoDocumentoAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/tipo_documento/${id}`;
    return this.http
      .get<ApiReturn<TipoDocumentoAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_documento`;
    return this.http
      .post<ApiReturn<TipoDocumentoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_documento/${id}`;
    return this.http
      .put<ApiReturn<TipoDocumentoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/tipo_documento/${id}`;
    return this.http
      .delete<ApiReturn<TipoDocumentoDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

