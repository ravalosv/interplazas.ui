import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  TipoAtaudAdminPayload,
  TipoAtaudDeletePayload,
} from '../interfaces/payloads/tipo_ataud.payload';

@Injectable({
  providedIn: 'root',
})
export class TipoAtaudService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/tipo_ataud`;
    return this.http
      .get<ApiReturn<TipoAtaudAdminPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/tipo_ataud/${id}`;
    return this.http
      .get<ApiReturn<TipoAtaudAdminPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_ataud`;
    return this.http
      .post<ApiReturn<TipoAtaudAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_ataud/${id}`;
    return this.http
      .put<ApiReturn<TipoAtaudAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/tipo_ataud/${id}`;
    return this.http
      .delete<ApiReturn<TipoAtaudDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

