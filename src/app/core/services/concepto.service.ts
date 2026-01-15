import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { ConceptoPayload } from '../interfaces/payloads/concepto.payload';

@Injectable({
  providedIn: 'root',
})
export class ConceptoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    const url = `${this.baseUrl}/concepto`;
    return this.http
      .get<ApiReturn<ConceptoPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    const url = `${this.baseUrl}/concepto/${id}`;
    return this.http
      .get<ApiReturn<ConceptoPayload>>(url)
      .pipe(map((ret) => ret));
  }

  create(data: { nombre: string; montoMXN: number; montoUSD: number }) {
    const url = `${this.baseUrl}/concepto`;
    return this.http
      .post<ApiReturn<ConceptoPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  update(id: number, data: { nombre: string; montoMXN: number; montoUSD: number }) {
    const url = `${this.baseUrl}/concepto/${id}`;
    return this.http
      .put<ApiReturn<ConceptoPayload>>(url, data)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    const url = `${this.baseUrl}/concepto/${id}`;
    return this.http
      .delete<ApiReturn<{ id: number }>>(url)
      .pipe(map((ret) => ret));
  }
}
