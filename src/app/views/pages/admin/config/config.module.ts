import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigComponent } from './config.component';
import { FilialesCrudComponent } from './filiales-crud/filiales-crud.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosNewComponent } from './usuarios-new/usuarios-new.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TipoDocumentoCrudComponent } from './tipo-documento-crud/tipo-documento-crud.component';
import { StatusCrudComponent } from './status-crud/status-crud.component';
import { TipoServicioCrudComponent } from './tipo-servicio-crud/tipo-servicio-crud.component';
import { ConceptoCrudComponent } from './concepto-crud/concepto-crud.component';
import { MotivoNoOtorgadoCrudComponent } from './motivo-no-otorgado-crud/motivo-no-otorgado-crud.component';
import { EstadoCtaStatusCrudComponent } from './estado-cta-status-crud/estado-cta-status-crud.component';
import { GruposCrudComponent } from './grupos-crud/grupos-crud.component';
import { SucursalesCrudComponent } from './sucursales-crud/sucursales-crud.component';
import { CanalesComunicacionCrudComponent } from './canales-comunicacion-crud/canales-comunicacion-crud.component';

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
    ConfigComponent,
    FilialesCrudComponent,
    SucursalesCrudComponent,
    TipoDocumentoCrudComponent,
    TipoServicioCrudComponent,
    ConceptoCrudComponent,
    MotivoNoOtorgadoCrudComponent,
    EstadoCtaStatusCrudComponent,
    GruposCrudComponent,
    StatusCrudComponent,
    UsuariosComponent,
    UsuariosNewComponent,
    CanalesComunicacionCrudComponent,
  ],
  imports: [
    CommonModule,
    ConfigRoutingModule,
    NgZorroModule,
    NgbModule,
    ...antdModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
})
export class ConfigModule {}
