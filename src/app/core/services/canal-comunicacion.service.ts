import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  CanalComunicacionAdminPayload,
  CanalComunicacionDeletePayload,
} from '../interfaces/payloads/canal_comunicacion.payload';

@Injectable({
  providedIn: 'root',
})
export class CanalComunicacionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/canal_comunicacion`;
    return this.http
      .get<ApiReturn<CanalComunicacionAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/canal_comunicacion/${id}`;
    return this.http
      .get<ApiReturn<CanalComunicacionAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string; whatsApp: string }) {
    const url = `${this.baseUrl}/canal_comunicacion`;
    return this.http
      .post<ApiReturn<CanalComunicacionAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string; whatsApp: string }) {
    const url = `${this.baseUrl}/canal_comunicacion/${id}`;
    return this.http
      .put<ApiReturn<CanalComunicacionAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/canal_comunicacion/${id}`;
    return this.http
      .delete<ApiReturn<CanalComunicacionDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

