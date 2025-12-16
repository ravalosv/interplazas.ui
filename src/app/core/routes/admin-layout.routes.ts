import { Routes } from '@angular/router';

export const AdminLayout_ROUTES: Routes = [
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
  {
    path: 'config',
    data: {
      title: 'Dashboard',
    },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../../views/pages/admin/config/config.module').then(
            (m) => m.ConfigModule
          ),
      },
    ],
  },

];
