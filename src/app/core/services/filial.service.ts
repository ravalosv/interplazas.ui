import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { FilialAdminPayload, FilialDeletePayload } from '../interfaces/payloads/filial.payload';


@Injectable({
  providedIn: 'root',
})
export class FilialService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/filial`;

    return this.http.get<ApiReturn<FilialAdminPayload[]>>(url).pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/filial/${id}`;

    return this.http.get<ApiReturn<FilialAdminPayload>>(url).pipe(map((ret) => ret));
  }

  create(data: { nombre: string; extranjera: boolean }) {
    const url = `${this.baseUrl}/filial`;

    return this.http
      .post<ApiReturn<FilialAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string; extranjera: boolean }) {
    const url = `${this.baseUrl}/filial/${id}`;

    return this.http
      .put<ApiReturn<FilialAdminPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/filial/${id}`;

    return this.http
      .delete<ApiReturn<FilialDeletePayload>>(url)
      .pipe(map((ret) => ret));
  }
}

