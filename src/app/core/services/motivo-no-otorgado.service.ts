import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  MotivoNoOtorgadoAdminPayload,
  MotivoNoOtorgadoDeletePayload,
} from '../interfaces/payloads/motivo_no_otorgado.payload';

@Injectable({
  providedIn: 'root',
})
export class MotivoNoOtorgadoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/motivos_no_otorgado`;
    return this.http
      .get<ApiReturn<MotivoNoOtorgadoAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/motivos_no_otorgado/${id}`;
    return this.http
      .get<ApiReturn<MotivoNoOtorgadoAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string }) {
    const url = `${this.baseUrl}/motivos_no_otorgado`;
    return this.http
      .post<ApiReturn<MotivoNoOtorgadoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string }) {
    const url = `${this.baseUrl}/motivos_no_otorgado/${id}`;
    return this.http
      .put<ApiReturn<MotivoNoOtorgadoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/motivos_no_otorgado/${id}`;
    return this.http
      .delete<ApiReturn<MotivoNoOtorgadoDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

