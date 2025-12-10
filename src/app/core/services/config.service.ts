import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { map } from 'rxjs';
import { GrupoPayload } from '../interfaces/payloads/config.payload';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGruposTree() {
    const url = `${this.baseUrl}/config/grupo/tree`;

    return this.http.get<ApiReturn<GrupoPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getGrupos() {
    const url = `${this.baseUrl}/config/grupo`;

    return this.http.get<ApiReturn<GrupoPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getUnidadesNegocioFromGroup(id: string) {
    const url = `${this.baseUrl}/config/grupo/${id}/unidades-negocio`;

    return this.http.get<ApiReturn<any[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  createGrupo(nombre: string) {
    const model = {
      nombre,
    };

    const url = `${this.baseUrl}/config/grupo`;

    return this.http.post<ApiReturn<GrupoPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  updateGrupo(id: string, nombre: string) {
    const model = {
      nombre,
    };

    const url = `${this.baseUrl}/config/grupo/${id}`;

    return this.http.put<ApiReturn<GrupoPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  deleteGrupo(id: string) {
    const url = `${this.baseUrl}/config/grupo/${id}`;

    return this.http.delete<ApiReturn<GrupoPayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  createUnidadNegocio(idGrupo: string, nombre: string) {
    const model = {
      nombre,
    };

    const url = `${this.baseUrl}/config/grupo/${idGrupo}/unidad-negocio`;

    return this.http.post<ApiReturn<GrupoPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  updateUnidadNegocio(idUnidad: string, nombre: string) {
    const model = {
      nombre,
    };

    const url = `${this.baseUrl}/config/grupo/unidad-negocio/${idUnidad}`;

    return this.http.put<ApiReturn<GrupoPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  deleteUnidadNegocio(idUnidad: string) {
    const url = `${this.baseUrl}/config/grupo/unidad-negocio/${idUnidad}`;

    return this.http.delete<ApiReturn<GrupoPayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  createFilial(idUnidad: string, nombre: string) {
    const model = {
      nombre,
    };

    const url = `${this.baseUrl}/config/grupo/unidad-negocio/${idUnidad}/filial`;

    return this.http.post<ApiReturn<GrupoPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  updateFilial(idFilial: string, nombre: string) {
    const model = {
      nombre,
    };

    const url = `${this.baseUrl}/config/grupo/unidad-negocio/filial/${idFilial}`;

    return this.http.put<ApiReturn<GrupoPayload>>(url, model).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  deleteFilial(idFilial: string) {
    const url = `${this.baseUrl}/config/grupo/unidad-negocio/filial/${idFilial}`;

    return this.http.delete<ApiReturn<GrupoPayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
}
