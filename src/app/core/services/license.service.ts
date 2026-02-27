import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private isLockedSubject = new BehaviorSubject<boolean>(false);
  public isLocked$ = this.isLockedSubject.asObservable();
  
  private deadlineSubject = new BehaviorSubject<Date | null>(null);
  public deadline$ = this.deadlineSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkInitialStatus();
  }

  checkInitialStatus() {
    this.http.get<any>(`${environment.apiUrl}/opt/health`).subscribe(
      (response) => {
        this.isLockedSubject.next(false);
        if (response && response.d && response.d.r) {
          this.deadlineSubject.next(new Date(response.d.r));
        }
      },
      (error) => {
        if (error.status === 402) {
          this.isLockedSubject.next(true);
          if (error.error && error.error.r) {
             console.log('License locked, deadline:', error.error.r);
             this.deadlineSubject.next(new Date(error.error.r));
          } else {
             console.warn('License locked but no deadline info found in error:', error.error);
          }
        }
      }
    );
  }

  lock(deadline?: Date | string) {
    this.isLockedSubject.next(true);
    if (deadline) {
      this.deadlineSubject.next(new Date(deadline));
    }
  }

  unlock() {
    this.isLockedSubject.next(false);
  }
}
