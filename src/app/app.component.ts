import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  Router,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';

import { LicenseService } from './core/services/license.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Servicios CCI';
  isLocked = false;
  deadline: Date | null = null;
  private secretClickCount = 0;

  constructor(
    private router: Router,
    private licenseService: LicenseService
  ) {}

  ngOnInit(): void {
    // Subscribe to license status changes
    /*
    this.licenseService.isLocked$.subscribe(locked => {
      this.isLocked = locked;
    });

    this.licenseService.deadline$.subscribe(date => {
      this.deadline = date;
    });*/

    const theme = environment.theme || 'ocean';
    document.body.classList.add(`theme-${theme}`);
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        //console.log('NavigationStart: ', event);
      }

      if (event instanceof NavigationEnd) {
        //console.log('NavigationEnd: ', event);
      }

      if (event instanceof NavigationError) {
        console.log('NavigationError: ', event);
      }
    });
  }

  checkLicense() {
    // Logic moved to LicenseService and handled via API status check
  }

  handleSecretUnlock() {
    this.secretClickCount++;
    if (this.secretClickCount >= 5) {
      const key = prompt('Ingrese Clave de Activación del Sistema:');
      if (key === 'PABS-2026-UNLOCK-SECURE') {
        localStorage.setItem('PABS-LICENSE-KEY', key);
        this.isLocked = false;
        alert('Sistema Activado Correctamente. Por favor recargue la página.');
        window.location.reload();
      } else {
        alert('Clave Incorrecta');
        this.secretClickCount = 0;
      }
    }
  }
}
