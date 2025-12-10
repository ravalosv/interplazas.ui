import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { IUsersPayload } from '../interfaces/models/users';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(filter: string = '') {
    let url = `${this.baseUrl}/user`;
    if (['active', 'inactive'].includes(filter)) {
      url += `?filter=${filter}`;
    }

    return this.http.get<ApiReturn<IUsersPayload[]>>(url);
  }

  getUsersById(userId: string) {
    const url = `${this.baseUrl}/user/${userId}`;

    return this.http.get<ApiReturn<IUsersPayload>>(url);
  }

  desactivarUsuario(userId: string) {
    const url = `${this.baseUrl}/user/${userId}`;

    return this.http.delete<ApiReturn<IUsersPayload>>(url);
  }

  activarUsuario(userId: string) {
    const url = `${this.baseUrl}/user/${userId}/activate`;

    return this.http.put<ApiReturn<IUsersPayload>>(url, {});
  }
}
