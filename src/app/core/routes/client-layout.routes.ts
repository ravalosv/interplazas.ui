import { Routes } from '@angular/router';

export const ClientLayout_ROUTES: Routes = [
  //Insights
  {
    path: 'events',
    data: {
      title: 'Dashboard',
    },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../../views/pages/admin/events/events.module').then(
            (m) => m.EventsModule
          ),
      },
    ],
  },
];
