import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { EventConfigComponent } from './event-config/event-config.component';
import { EventEditComponent } from './event-edit/event-edit.component';
import { EventCuentaListComponent } from './event-cuenta-list/event-cuenta-list.component';

//const routes: Routes = [{ path: '', component: EventsComponent }];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  { path: 'list', component: EventListComponent },
  { path: 'new', component: EventConfigComponent },
  {
    path: 'edit/:id',
    component: EventEditComponent,
  },
  {
    path: 'configure/:id',
    component: EventConfigComponent,
  },
  {
    path: 'cuenta/:id',
    component: EventCuentaListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
