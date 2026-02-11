import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appLoading]'
})
export class LoadingBtnDirective implements OnChanges {
  @Input('appLoading') isLoading: boolean = false;
  
  private spinnerElement: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoading']) {
      if (this.isLoading) {
        this.addSpinner();
      } else {
        this.removeSpinner();
      }
    }
  }

  private addSpinner() {
    // Deshabilitar el botón
    this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
    
    // Crear el spinner usando clases de Bootstrap 5
    this.spinnerElement = this.renderer.createElement('span');
    this.renderer.addClass(this.spinnerElement, 'spinner-border');
    this.renderer.addClass(this.spinnerElement, 'spinner-border-sm');
    this.renderer.addClass(this.spinnerElement, 'me-2'); // Margen a la derecha
    this.renderer.setAttribute(this.spinnerElement, 'role', 'status');
    this.renderer.setAttribute(this.spinnerElement, 'aria-hidden', 'true');
    
    // Insertar el spinner al principio del contenido del botón
    this.renderer.insertBefore(this.el.nativeElement, this.spinnerElement, this.el.nativeElement.firstChild);
  }

  private removeSpinner() {
    // Habilitar el botón
    this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
    
    // Remover el spinner si existe
    if (this.spinnerElement) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerElement);
      this.spinnerElement = null;
    }
  }
}
