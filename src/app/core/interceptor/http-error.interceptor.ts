import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AlertsService } from '../services/alerts.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { ApiReturn } from '../interfaces/payloads/api_return';
import { IUser } from '../interfaces/user.type';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private alertsService: AlertsService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    var message = '';
    return next.handle(request).pipe(
      catchError((error) => {
        if (error) {
          switch (error.status) {
            case 400:
              if (error.error.errors) {
                const modalStateErrors = [];
                for (const key in error.error.errors) {
                  modalStateErrors.push(error.error.errors[key]);
                }
                throw modalStateErrors.flat();
              } else {
                message = error.error;
              }
              break;
            case 401:
              if (error.error.message == 'Token expired') {
                console.log('Token expired');
                return this.authService.renewToken().pipe(
                  switchMap((data: ApiReturn<IUser>) => {
                    console.log('New token', data);
                    // Guarda el nuevo token y reintentar la solicitud
                    return this.retryRequestWithNewToken(
                      request,
                      next,
                      data.data.token
                    );
                  }),
                  catchError((err) => {
                    this.router.navigateByUrl('auth/login');

                    // Maneja cualquier error que ocurra durante la renovación del token o la nueva solicitud
                    return throwError(
                      () =>
                        new Error(
                          'La sesión ha expirado, por favor inicie sesión nuevamente'
                        )
                    );
                  })
                );
              } else {
                message =
                  'Usuario o contraseña incorrectos, por favor verifique sus datos e intente nuevamente';
              }
              break;
            case 404:
              message = error.statusText;
              break;
            case 500:
              console.log('Error', error);
              message = error.error.Message;

              break;
            default:
              this.alertsService.error('Ocurrió un error inesperado');
              console.log('Error', error);
              break;
          }
        }

        return throwError(() => message);
      })
    );
  }

  private retryRequestWithNewToken(
    request: HttpRequest<any>,
    next: HttpHandler,
    newToken: string
  ): Observable<HttpEvent<any>> {
    // Clona la solicitud original y reemplaza el token expirado con el nuevo
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${newToken}`,
      },
    });
    // Reintenta la solicitud original con el nuevo token
    return next.handle(clonedRequest);
  }
}
