import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  Router,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Servicios CCI';

  constructor(private router: Router) {}

  ngOnInit(): void {
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
}
