import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { GrupoAdminPayload, GrupoDeletePayload } from '../interfaces/payloads/grupo.payload';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/grupo`;

    return this.http.get<ApiReturn<GrupoAdminPayload[]>>(url).pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/grupo/${id}`;

    return this.http.get<ApiReturn<GrupoAdminPayload>>(url).pipe(map((ret) => ret));
  }

  create(data: { nombre: string; cobroEntreFiliales: boolean }) {
    const url = `${this.baseUrl}/grupo`;

    return this.http
      .post<ApiReturn<GrupoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string; cobroEntreFiliales: boolean }) {
    const url = `${this.baseUrl}/grupo/${id}`;

    return this.http
      .put<ApiReturn<GrupoAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/grupo/${id}`;

    return this.http
      .delete<ApiReturn<GrupoDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}
