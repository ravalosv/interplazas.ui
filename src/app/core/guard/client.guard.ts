import { Injectable } from '@angular/core';
import {
  CanActivate,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /*     console.group('Client Guard Debug');
    console.log('Ruta solicitada:', state.url);
    console.log('Datos de ruta:', route.data);
    console.log('Parámetros:', route.params);
    console.log('Query Params:', route.queryParams);
    console.groupEnd(); */

    if (this.authService.loggedIn()) {
      if (this.authService.isFilial()) {
        return true;
      } else if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/operacion/servicios']);
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
