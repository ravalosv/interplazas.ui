import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EncryptIdGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const id = route.paramMap.get('id');
    const encryptedId = this.encrypt(id);
    this.router.navigate(['/admin/events/edit', encryptedId]);
    return false; // Return false to cancel the original navigation
  }

  encrypt(value: string | null): string {
    return window.btoa(value!);
  }
}
