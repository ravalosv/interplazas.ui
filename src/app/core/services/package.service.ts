import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import {
  PackagePayload,
  PackageSearchPayload,
} from '../interfaces/payloads/package.payload';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(valueToSearch: string) {
    const url = `${this.baseUrl}/v1/packages/Search?q=${valueToSearch}`;

    return this.http.get<ApiReturn<PackageSearchPayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getAll() {
    const url = `${this.baseUrl}/v1/packages/getAll`;

    return this.http.get<ApiReturn<PackagePayload[]>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }

  getById(id: number, includeComponents: boolean) {
    const url = `${this.baseUrl}/v1/packages/getbyId?id=${id}&withComponents=${includeComponents}`;

    return this.http.get<ApiReturn<PackagePayload>>(url).pipe(
      map((ret) => {
        return ret;
      })
    );
  }
}
