import { Injectable } from '@angular/core';
import {
  CanActivate,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /*     console.group('Admin Guard Debug');
    console.log('Ruta solicitada:', state.url);
    console.log('Datos de ruta:', route.data);
    console.log('Parámetros:', route.params);
    console.log('Query Params:', route.queryParams);
    console.groupEnd(); */

    if (this.authService.loggedIn()) {
      if (this.authService.isAdmin()) {
        return true;
      } else if (this.authService.isFilial()) {
        this.router.navigate(['/client/contratos']);
        return true;
      }
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
