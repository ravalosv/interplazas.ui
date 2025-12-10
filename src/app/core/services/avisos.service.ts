import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { IAvisoPayload } from '../interfaces/payloads/aviso.payload';

@Injectable({
  providedIn: 'root',
})
export class AvisosService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  createAviso(aviso: any) {
    const url = `${this.baseUrl}/aviso`;

    return this.http
      .post<ApiReturn<IAvisoPayload>>(url, aviso)
      .pipe(map((ret) => ret));
  }

  updateAviso(avisoId: any, aviso: any) {
    const url = `${this.baseUrl}/aviso/${avisoId}`;

    return this.http
      .put<ApiReturn<IAvisoPayload>>(url, aviso)
      .pipe(map((ret) => ret));
  }

  desactivarAviso(avisoId: any) {
    const url = `${this.baseUrl}/aviso/${avisoId}/deactivate`;

    return this.http
      .put<ApiReturn<IAvisoPayload>>(url, {})
      .pipe(map((ret) => ret));
  }

  activarAviso(avisoId: any) {
    const url = `${this.baseUrl}/aviso/${avisoId}/activate`;

    return this.http
      .put<ApiReturn<IAvisoPayload>>(url, {})
      .pipe(map((ret) => ret));
  }

  getAvisos(filter: any) {
    let filtro = '';
    if (filtro != 'todos') {
      filtro = `?status=${filter}`;
    }

    const url = `${this.baseUrl}/aviso${filtro}`;

    return this.http
      .get<ApiReturn<IAvisoPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  getAvisoById(avisoId: any) {
    const url = `${this.baseUrl}/aviso?id=${avisoId}`;

    return this.http.get<ApiReturn<IAvisoPayload>>(url).pipe(map((ret) => ret));
  }

  getAvisoByUser() {
    const url = `${this.baseUrl}/aviso/user`;

    return this.http
      .get<ApiReturn<IAvisoPayload[]>>(url)
      .pipe(map((ret) => ret));
  }

  marcarComoVisto(avisoId: any) {
    const url = `${this.baseUrl}/aviso/${avisoId}/visto`;

    return this.http
      .put<ApiReturn<IAvisoPayload>>(url, {})
      .pipe(map((ret) => ret));
  }

  marcarComoNoVisto(avisoId: any) {
    const url = `${this.baseUrl}/aviso/${avisoId}/novisto`;

    return this.http
      .put<ApiReturn<IAvisoPayload>>(url, {})
      .pipe(map((ret) => ret));
  }
}
