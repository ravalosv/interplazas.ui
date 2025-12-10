import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArchwizardModule } from 'angular-archwizard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgZorroModule } from 'src/app/ng-zorro.module';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TableService } from 'src/app/core/services/table.service';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventConfigComponent } from './event-config/event-config.component';
import { EventEditComponent } from './event-edit/event-edit.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HabitacionComponent } from './components/habitacion/habitacion.component';
import { InvitadoEditComponent } from './invitado-edit/invitado-edit.component';

import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
//import { InvitadosState } from './state/invitados.state';
import { environment } from 'src/environments/environment';
import { ConditionalDragDirective } from './directives/drag-directive';
import { TrackingComponent } from './tracking/tracking.component';
import { EventConfigMesasListComponent } from './event-config-mesas-list/event-config-mesas-list.component';
import { EventConfigMesasDistribucionComponent } from './event-config-mesas-distribucion/event-config-mesas-distribucion.component';
import { EventConfigHabitacionesListComponent } from './event-config-habitaciones-list/event-config-habitaciones-list.component';
import { EventConfigHabitacionesDistribucionComponent } from './event-config-habitaciones-distribucion/event-config-habitaciones-distribucion.component';
import { EventEditHabitacionesComponent } from './event-edit-habitaciones/event-edit-habitaciones.component';
import { EventEditMesasComponent } from './event-edit-mesas/event-edit-mesas.component';
import { MesaComponent } from './components/mesa/mesa.component';
import { InvitadosMesaComponent } from './components/invitados-mesa/invitados-mesa.component';
import { InvitadosHabitacionComponent } from './components/invitados-habitacion/invitados-habitacion.component';
import { EventConfigAsignarMesaReservaComponent } from './event-config-asignar-mesa-reserva/event-config-asignar-mesa-reserva.component';
import { EventConfigAsignarHabitacionReservaComponent } from './event-config-asignar-habitacion-reserva/event-config-asignar-habitacion-reserva.component';
import { EventCuentaListComponent } from './event-cuenta-list/event-cuenta-list.component';
import { EventConfigReasignarHabitacionComponent } from './event-config-reasignar-habitacion/event-config-reasignar-habitacion.component';
import { EventConfigReasignarMesaComponent } from './event-config-reasignar-mesa/event-config-reasignar-mesa.component';

const antdModule = [
  NzButtonModule,
  NzCardModule,
  NzAvatarModule,
  NzRateModule,
  NzBadgeModule,
  NzProgressModule,
  NzRadioModule,
  NzTableModule,
  NzDropDownModule,
  NzTimelineModule,
  NzTabsModule,
  NzTagModule,
  NzListModule,
  NzCalendarModule,
  NzToolTipModule,
  NzFormModule,
  NzModalModule,
  NzSelectModule,
  NzUploadModule,
  NzInputModule,
  NzPaginationModule,
  NzDatePickerModule,
  NzCheckboxModule,
  NzMessageModule,
  NzTreeSelectModule,
  NzIconModule,
];

@NgModule({
  declarations: [
    EventsComponent,
    EventListComponent,
    EventConfigComponent,
    EventEditComponent,
    HabitacionComponent,
    InvitadoEditComponent,
    ConditionalDragDirective,
    TrackingComponent,
    EventConfigMesasListComponent,
    EventConfigMesasDistribucionComponent,
    EventConfigHabitacionesListComponent,
    EventConfigHabitacionesDistribucionComponent,
    EventEditHabitacionesComponent,
    EventEditMesasComponent,
    MesaComponent,
    InvitadosMesaComponent,
    InvitadosHabitacionComponent,
    EventConfigAsignarMesaReservaComponent,
    EventConfigAsignarHabitacionReservaComponent,
    EventCuentaListComponent,
    EventConfigReasignarHabitacionComponent,
    EventConfigReasignarMesaComponent,
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,

    ArchwizardModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgZorroModule,
    ...antdModule,
    NgbNavModule,
    PerfectScrollbarModule,
    NgbModule,
    DragDropModule,
    NgxsModule.forRoot([], {
      developmentMode: !environment.production,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production,
    }),
  ],
  providers: [TableService],
  exports: [ConditionalDragDirective],
})
export class EventsModule {}
