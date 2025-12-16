import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseComponent } from './views/layout/base/base.component';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';
import { AdminGuard } from './core/guard/admin.guard';
import { ClientGuard } from './core/guard/client.guard';
import { AdminLayout_ROUTES } from './core/routes/admin-layout.routes';
import { ClientLayout_ROUTES } from './core/routes/client-layout.routes';
import { environment } from 'src/environments/environment';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/events/list',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    component: BaseComponent,
    children: AdminLayout_ROUTES,
  },
  {
    path: 'client',
    canActivate: [ClientGuard],
    component: BaseComponent,
    children: ClientLayout_ROUTES,
  },
  /*   {
    path: '',
    component: FullLayoutComponent,
    children: FullLayout_ROUTES,
  },  
 */

  {
    path: 'auth',
    loadChildren: () =>
      import('./views/pages/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'error/404',
    component: ErrorPageComponent,
    data: {
      type: 404,
      title: 'Página No Encontrada',
      desc: 'Oopps!! La página que estas buscando, parece que no existe.',
    },
  },
  { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      enableTracing: environment.enable_routing_debug,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
