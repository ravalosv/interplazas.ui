import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { LayoutModule } from './views/layout/layout.module';
//import { AuthGuard } from './core/guard/auth.guard';

import { AppComponent } from './app.component';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { ClientGuard } from './core/guard/client.guard';
import { AdminGuard } from './core/guard/admin.guard';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroModule } from './ng-zorro.module';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

import es from '@angular/common/locales/es';

import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NZ_I18N, en_US, es_ES } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import { HttpErrorInterceptor } from './core/interceptor/http-error.interceptor';
import { JwtInterceptor } from './core/interceptor/token.interceptor';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import {
  PlusCircleFill,
  PlusCircleTwoTone,
  UserAddOutline,
} from '@ant-design/icons-angular/icons';
import { settings } from 'cluster';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { TimeagoModule, TimeagoIntl } from 'ngx-timeago';

//import { InvitadosState } from './views/pages/admin/events/state/invitados.state';

registerLocaleData(es);

// Strings en español para ngx-timeago
const strings: Record<string, string> = {
  prefixAgo: 'hace',
  prefixFromNow: 'dentro de',
  suffixAgo: '',
  suffixFromNow: '',
  seconds: 'menos de un minuto',
  minute: 'un minuto',
  minutes: '%d minutos',
  hour: 'una hora',
  hours: '%d horas',
  day: 'un día',
  days: '%d días',
  month: 'un mes',
  months: '%d meses',
  year: 'un año',
  years: '%d años',
};

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);

@NgModule({
  declarations: [AppComponent, ErrorPageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    NgZorroModule,
    ReactiveFormsModule,
    NgxsModule.forRoot([], {
      developmentMode: !environment.production,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production,
    }),
    TimeagoModule.forRoot({
      intl: {
        provide: TimeagoIntl,
        useFactory: () => {
          const intl = new TimeagoIntl();
          intl.strings = strings;
          intl.changes.next();
          return intl;
        },
      },
      // otras configuraciones si son necesarias
    }),
  ],
  providers: [
    ClientGuard,
    AdminGuard,
    //AuthGuard,
    {
      provide: HIGHLIGHT_OPTIONS, // https://www.npmjs.com/package/ngx-highlightjs
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          xml: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          scss: () => import('highlight.js/lib/languages/scss'),
        },
      },
    },
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: NZ_ICONS,
      useValue: [
        PlusCircleFill,
        PlusCircleTwoTone,
        AllIcons.SettingOutline,
        UserAddOutline,
        AllIcons.SaveOutline,
        AllIcons.ApartmentOutline,
        AllIcons.DownloadOutline,
      ],
    },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
