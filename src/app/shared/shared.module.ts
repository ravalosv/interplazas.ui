import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingBtnDirective } from './directives/loading-btn.directive';

@NgModule({
  declarations: [
    LoadingBtnDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoadingBtnDirective
  ]
})
export class SharedModule { }
