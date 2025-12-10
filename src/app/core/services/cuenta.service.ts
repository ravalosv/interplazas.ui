import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';

import {
  IngresosEgresosAddPayload,
  IngresosEgresosCategoriasPayload,
  IngresosEgresosConceptosPayload,
  IngresosEgresosFormaPayload,
  IngresosEgresosGetPayload,
  IngresosEgresosStatusPayload,
  IngresosEgresosTipoPayload,
} from '../interfaces/payloads/cuenta.payload';
import { IngresosEgresosAddDTO } from '../interfaces/models/cuenta.dto';

export enum EventoAccionesEnum {
  RecargarDistribucionMesas = 'recargar-distribucion-mesas',
  RecargarDistribucionHabitaciones = 'recargar-distribucion-habitaciones',
}

@Injectable({
  providedIn: 'root',
})
export class CuentaService {
  private baseUrl = environment.apiUrl;

  private accionSubject = new Subject<EventoAccionesEnum>();
  public accionObservable = this.accionSubject.asObservable();

  constructor(private http: HttpClient) {}

  enviarAccion(accion: EventoAccionesEnum) {
    this.accionSubject.next(accion);
  }

  getTipos(filter: string) {
    let url = `${this.baseUrl}/ingresosegresos/tipos?filter=${filter}`;

    return this.http.get<ApiReturn<IngresosEgresosTipoPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getFormas() {
    let url = `${this.baseUrl}/ingresosegresos/formas`;

    return this.http.get<ApiReturn<IngresosEgresosFormaPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getConceptos() {
    let url = `${this.baseUrl}/ingresosegresos/conceptos`;

    return this.http
      .get<ApiReturn<IngresosEgresosConceptosPayload[]>>(url)
      .pipe(
        map((ret) => {
          return ret;
        })
      );
  }

  getCategorias() {
    let url = `${this.baseUrl}/ingresosegresos/categorias`;

    return this.http
      .get<ApiReturn<IngresosEgresosCategoriasPayload[]>>(url)
      .pipe(
        map((ret) => {
          return ret;
        })
      );
  }

  getStatus() {
    let url = `${this.baseUrl}/ingresosegresos/status`;

    return this.http.get<ApiReturn<IngresosEgresosStatusPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  addIngresoEgreso(data: IngresosEgresosAddDTO) {
    let url = `${this.baseUrl}/ingresosegresos`;

    return this.http.post<ApiReturn<IngresosEgresosAddPayload>>(url, data).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  updateIngresoEgreso(data: IngresosEgresosAddDTO, id: string) {
    let url = `${this.baseUrl}/ingresosegresos/${id}`;

    return this.http.put<ApiReturn<IngresosEgresosAddPayload>>(url, data).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getIngresosEgresosByEventoId(eventoId: string) {
    let url = `${this.baseUrl}/ingresosegresos/evento/${eventoId}`;

    return this.http.get<ApiReturn<IngresosEgresosGetPayload[]>>(url);
  }

  getIngresosEgresosById(id: string) {
    let url = `${this.baseUrl}/ingresosegresos/${id}`;

    return this.http.get<ApiReturn<IngresosEgresosGetPayload>>(url);
  }

  getFileUrl(eventoId: string) {
    let url = `${this.baseUrl}/ingresosegresos/evento/${eventoId}/urlCuentaFile`;

    return this.http.get<ApiReturn<string>>(url);
  }

  delete(id: number) {
    let url = `${this.baseUrl}/ingresosegresos/${id}`;

    return this.http.delete<ApiReturn<string>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  uploadComprobante(id: number, file: File) {
    const formData = new FormData();
    formData.append('comprobante', file);
    
    let url = `${this.baseUrl}/ingresosegresos/${id}/uploadComprobante`;
    return this.http.post<ApiReturn<any>>(url, formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  downloadCuentaFile(downloadToken: string) {
    let url = `${this.baseUrl}/ingresosegresos/downloadCuentaFile/${downloadToken}`;
    
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  deleteComprobante(id: number) {
    let url = `${this.baseUrl}/ingresosegresos/${id}/comprobante`;
    return this.http.delete<ApiReturn<IngresosEgresosGetPayload>>(url).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
