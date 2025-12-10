import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Directive({
  selector: '[appConditionalDrag]',
})
export class ConditionalDragDirective implements OnChanges {
  @Input() appConditionalDrag: boolean;

  constructor(private cdkDrag: CdkDrag) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appConditionalDrag']) {
      this.cdkDrag.disabled = !this.appConditionalDrag;
    }
  }
}
