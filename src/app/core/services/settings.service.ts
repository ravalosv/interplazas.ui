import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { SettingsPayload } from '../interfaces/payloads/settings.payload';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = environment.apiUrl + '/settings';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http
      .get<ApiReturn<SettingsPayload[]>>(this.baseUrl)
      .pipe(map((ret) => ret));
  }

  getById(id: number) {
    return this.http
      .get<ApiReturn<SettingsPayload>>(`${this.baseUrl}/${id}`)
      .pipe(map((ret) => ret));
  }

  create(payload: Partial<SettingsPayload>) {
    return this.http
      .post<ApiReturn<SettingsPayload>>(this.baseUrl, payload)
      .pipe(map((ret) => ret));
  }

  update(id: number, payload: Partial<SettingsPayload>) {
    return this.http
      .put<ApiReturn<SettingsPayload>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((ret) => ret));
  }

  delete(id: number) {
    return this.http
      .delete<ApiReturn<any>>(`${this.baseUrl}/${id}`)
      .pipe(map((ret) => ret));
  }
}
