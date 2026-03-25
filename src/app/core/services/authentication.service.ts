import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IUser } from '../interfaces/user.type';
import { environment } from 'src/environments/environment';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<IUser | null>;
  public currentUser: Observable<IUser | null>;

  jwtHelper = new JwtHelperService();
  decodedToken: any;

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<IUser | null>(
      localStorage.getItem('currentUser') != null
        ? JSON.parse(localStorage.getItem('currentUser') ?? '')
        : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): IUser | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth/login`;

    return this.http.post<ApiReturn<IUser>>(url, { email, password }).pipe(
      map((ret) => {
        if (ret.success) {
          if (ret.data && ret.data.token) {
            localStorage.setItem('currentUser', JSON.stringify(ret.data));
            this.decodedToken =
              this.jwtHelper.decodeToken(ret.data.token) ?? '';

            this.currentUserSubject.next(ret.data);
          }
        } else {
          localStorage.removeItem('currentUser');
        }
        return ret;
      })
    );
  }

  createUser(user: any) {
    const url = `${this.baseUrl}/auth/register`;

    return this.http.post<ApiReturn<IUser>>(url, user).pipe(map((ret) => ret));
  }

  updateUser(userId: string, user: any) {
    const url = `${this.baseUrl}/user/${userId}`;

    return this.http.put<ApiReturn<IUser>>(url, user).pipe(map((ret) => ret));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  loggedIn() {
    if (localStorage.getItem('currentUser')) {
      const user: IUser = JSON.parse(localStorage.getItem('currentUser')!);
      const token = user.token ?? '';

      if (this.jwtHelper.isTokenExpired(token ?? '')) {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        return false;
      }

      this.decodedToken = this.jwtHelper.decodeToken(token) ?? '';

      this.currentUserSubject.next(user);

      return true;
    } else {
      return false;
    }
  }

  isAdmin() {
    const userRoles =
      this.currentUserValue?.user?.tipoUsuarioId ?? this.decodedToken?.tipoUsuarioId;
    return userRoles == 1 || userRoles == 3;
  }

  isCaptura() {
    const userRoles =
      this.currentUserValue?.user?.tipoUsuarioId ?? this.decodedToken?.tipoUsuarioId;
    return userRoles == 4;
  }


  isReportsUser() {
    const userRoles =
      this.currentUserValue?.user?.tipoUsuarioId ?? this.decodedToken?.tipoUsuarioId; //as Array<string>;
    return userRoles == 'reports';
  }

  isFilial() {
    const userRoles =
      this.currentUserValue?.user?.tipoUsuarioId ?? this.decodedToken?.tipoUsuarioId;
    // Check for both ID 3 and string 'filial' to be safe
    return userRoles == 2 || userRoles == 'filial';
  }

  updateUserPassword(model: any) {
    const url = `${this.baseUrl}/auth/change-password`;
    return this.http.put<ApiReturn<IUser>>(url, model).pipe(map((ret) => ret));
  }

  renewToken() {
    const user: IUser = JSON.parse(localStorage.getItem('currentUser')!);

    const refreshToken = user.refreshToken;

    const url = `${this.baseUrl}/auth/renew-token/`;
    return this.http.post<ApiReturn<IUser>>(url, { refreshToken }).pipe(
      map((ret) => {
        if (ret.success) {
          if (ret.data && ret.data.token) {
            localStorage.setItem('currentUser', JSON.stringify(ret.data));
            this.decodedToken =
              this.jwtHelper.decodeToken(ret.data.token) ?? '';

            this.currentUserSubject.next(ret.data);
          }
        } else {
          localStorage.removeItem('currentUser');
        }
        return ret;
      })
    );
  }
}
