import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  TipoUsuarioDeletePayload,
  TipoUsuarioPayload,
} from '../interfaces/payloads/tipo_usuario.payload';

@Injectable({
  providedIn: 'root',
})
export class TipoUsuarioService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/tipo_usuario`;
    return this.http
      .get<ApiReturn<TipoUsuarioPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/tipo_usuario/${id}`;
    return this.http
      .get<ApiReturn<TipoUsuarioPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(body: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_usuario`;
    return this.http
      .post<ApiReturn<TipoUsuarioPayload>>(url, body)
      .pipe(map((ret) => ret));
  }

  update(id: number, body: { nombre: string }) {
    const url = `${this.baseUrl}/tipo_usuario/${id}`;
    return this.http
      .put<ApiReturn<TipoUsuarioPayload>>(url, body)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/tipo_usuario/${id}`;
    return this.http
      .delete<ApiReturn<TipoUsuarioDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

