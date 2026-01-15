import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  StatusContratoAdminPayload,
  StatusContratoDeletePayload,
} from '../interfaces/payloads/status.payload';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/status`;
    return this.http
      .get<ApiReturn<StatusContratoAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/status/${id}`;
    return this.http
      .get<ApiReturn<StatusContratoAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string }) {
    const url = `${this.baseUrl}/status`;
    return this.http
      .post<ApiReturn<StatusContratoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string }) {
    const url = `${this.baseUrl}/status/${id}`;
    return this.http
      .put<ApiReturn<StatusContratoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/status/${id}`;
    return this.http
      .delete<ApiReturn<StatusContratoDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}
