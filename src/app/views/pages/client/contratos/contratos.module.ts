import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContratosComponent } from './contratos.component';

const routes: Routes = [
  {
    path: '',
    component: ContratosComponent
  }
];

@NgModule({
  declarations: [ContratosComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    RouterModule.forChild(routes)
  ]
})
export class ContratosModule { }
