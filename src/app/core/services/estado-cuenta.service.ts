import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';

@Injectable({
  providedIn: 'root',
})
export class EstadoCuentaService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generar(periodoId: number) {
    const url = `${this.baseUrl}/estado-cuenta/generar`;
    return this.http
      .post<ApiReturn<any>>(url, { periodoId })
      .pipe(map((ret) => ret));
  }

  getAllMovimientos() {
    const url = `${this.baseUrl}/estado-cuenta/movimientos`;
    return this.http
      .get<ApiReturn<any>>(url)
      .pipe(map((ret) => ret.data));
  }
}
