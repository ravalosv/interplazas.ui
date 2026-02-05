import { Routes } from '@angular/router';

export const AdminLayout_ROUTES: Routes = [
  //Insights
  {
    path: 'operacion',
    data: {
      title: 'Servicios',
    },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../../views/pages/admin/operacion/operacion.module').then(
            (m) => m.OperacionModule
          ),
      },
    ],
  },
  {
    path: 'estado-cuenta',
    data: {
      title: 'Estado de Cuenta',
    },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../../views/pages/admin/operacion/operacion.module').then(
            (m) => m.OperacionModule
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
