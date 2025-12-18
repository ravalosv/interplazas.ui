import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiciosRoutingModule } from './servicios-routing.module';
import { ServicioCrudComponent } from './servicios-crud/servicio-crud.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgZorroModule } from 'src/app/ng-zorro.module';

@NgModule({
  declarations: [
    ServicioCrudComponent
  ],
  imports: [
    CommonModule,
    ServiciosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,
    NgZorroModule
  ]
})
export class ServiciosModule { }
