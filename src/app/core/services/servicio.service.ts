import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { ServicioCreatePayload, ServicioPayload } from '../interfaces/payloads/servicio.payload';

@Injectable({
  providedIn: 'root',
})
export class ServicioService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/servicio`;
    return this.http
      .get<ApiReturn<ServicioPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getByDate(year: number, month: number) {
    const url = `${this.baseUrl}/servicio/fecha/${year}/${month}`;
    return this.http
      .get<ApiReturn<ServicioPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/servicio/${id}`;
    return this.http
      .get<ApiReturn<ServicioPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: ServicioCreatePayload) {
    const url = `${this.baseUrl}/servicio`;
    return this.http
      .post<ApiReturn<ServicioPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: ServicioCreatePayload) {
    const url = `${this.baseUrl}/servicio/${id}`;
    return this.http
      .put<ApiReturn<ServicioPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  updatePenalizado(id: number, penalizado: boolean) {
    const url = `${this.baseUrl}/servicio/${id}/penalizado`;
    return this.http
      .patch<ApiReturn<ServicioPayload>>(url, { penalizado })
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/servicio/${id}`;
    return this.http
      .delete<ApiReturn<{ message: string }>>(url)
      .pipe(map((ret) => ret));
  }
}
