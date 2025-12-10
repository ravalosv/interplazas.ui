import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  encrypt(value: string): string {
    return window.btoa(value);
  }

  decrypt(value: string): string {
    return window.atob(value);
  }
}
