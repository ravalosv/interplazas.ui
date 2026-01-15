import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { SucursalAdminPayload, SucursalDeletePayload } from '../interfaces/payloads/sucursal.payload';

@Injectable({
  providedIn: 'root',
})
export class SucursalService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/sucursal`;

    return this.http.get<ApiReturn<SucursalAdminPayload[]>>(url).pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/sucursal/${id}`;

    return this.http.get<ApiReturn<SucursalAdminPayload>>(url).pipe(map((ret) => ret));
  }

  create(data: { nombre: string; filialId: number }) {
    const url = `${this.baseUrl}/sucursal`;

    return this.http
      .post<ApiReturn<SucursalAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string; filialId: number }) {
    const url = `${this.baseUrl}/sucursal/${id}`;

    return this.http
      .put<ApiReturn<SucursalAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/sucursal/${id}`;

    return this.http
      .delete<ApiReturn<SucursalDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

