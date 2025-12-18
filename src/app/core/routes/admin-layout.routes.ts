import { Routes } from '@angular/router';

export const AdminLayout_ROUTES: Routes = [
  //Insights
  {
    path: 'servicios',
    data: {
      title: 'Servicios',
    },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../../views/pages/admin/servicios/servicios.module').then(
            (m) => m.ServiciosModule
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
