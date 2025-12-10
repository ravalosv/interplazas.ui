import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { map } from 'rxjs';
import { SettingsPayload } from '../interfaces/payloads/settings.payload';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get() {
    const url = `${this.baseUrl}/v1/settings/get`;

    return this.http.get<ApiReturn<SettingsPayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
}
