import { Component, OnInit } from '@angular/core';
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
  title = 'Interplazas';

  constructor(private router: Router) {}

  ngOnInit(): void {
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
