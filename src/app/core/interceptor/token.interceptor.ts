import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let currentUser = this.authenticationService.currentUserValue;
        let headers: any = {};

        if (currentUser && currentUser.token) {
            headers['Authorization'] = `Bearer ${currentUser.token}`;
        }

        // Add license key if present to bypass restrictions
        const licenseKey = localStorage.getItem('PABS-LICENSE-KEY');
        if (licenseKey) {
            headers['x-license-key'] = licenseKey;
        }

        if (Object.keys(headers).length > 0) {
            request = request.clone({
                setHeaders: headers
            });
        }

        return next.handle(request);
    }
}