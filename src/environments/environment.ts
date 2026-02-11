// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  google_maps_api_key: 'AIzaSyCLBQTlvlkZAENCPFBsn9Oqersg1UUX4a0',

  lang: 'es',

  apiUrl: 'http://localhost:3165/api',
  fotosUrl: 'http://localhost:3165/api/storage',

  enable_routing_debug: false,

  //apiUrl: 'http://54.70.207.245:3165',
  //fotosUrl: 'http://54.70.207.245:3000/api',

  // staging
  //apiUrl: 'http://54.70.207.245:3165/api',
  //fotosUrl: 'http://54.70.207.245:3165/storage',

  // Productivo
  /*   apiUrl: 'https://mybenefitsadmin.genioconvenio.com/api/',
  fotosUrl: 'https://mybenefitsadmin.genioconvenio.com/',
  videoUrl: 'https://mybenefitsadmin.genioconvenio.com/',  */

  /*   user: 'admin_dev',
  pass: 'admindev.123', */
  user: 'super@admin.com',
  pass: 'admin',
  theme: 'ocean',
  appVersion: '2026.02.11.03',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
