import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { CostosPayload } from '../interfaces/payloads/costos.payload';

@Injectable({
  providedIn: 'root',
})
export class CostosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/costos`;
    return this.http
      .get<ApiReturn<CostosPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/costos/${id}`;
    return this.http
      .get<ApiReturn<CostosPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { costo_servicio: number }) {
    const url = `${this.baseUrl}/costos`;
    return this.http
      .post<ApiReturn<CostosPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { costo_servicio: number }) {
    const url = `${this.baseUrl}/costos/${id}`;
    return this.http
      .put<ApiReturn<CostosPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/costos/${id}`;
    return this.http
      .delete<ApiReturn<{ id: number }>>(url)
      .pipe(map((ret) => ret));
  }
}
