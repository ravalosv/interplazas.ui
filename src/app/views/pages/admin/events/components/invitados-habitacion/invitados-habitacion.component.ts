import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { Subscription } from 'rxjs';
import { IDroppedItem, IInvitado } from '../../interfaces/events.interface';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-evento-invitados-habitacion',
  templateUrl: './invitados-habitacion.component.html',
  styleUrls: ['./invitados-habitacion.component.scss'],
})
export class InvitadosHabitacionComponent implements OnInit {
  @Input() eventoId: string = '';
  @Input() grupoId: string = '';
  @Input() readOnlyMode: boolean = false;
  @Output() droppedItemEvent = new EventEmitter<IDroppedItem>();
  @Output() editEvent = new EventEmitter<IInvitado>();

  listaInvitados: IInvitado[] = [];
  listaInvitadosFiltrada: IInvitado[] = [];
  isDragging: any;

  constructor(private sharedService: SharedService) {}

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    var s = this.sharedService.listaInvitadosHabitaciones.subscribe(
      (listaInvitados) => {
        this.listaInvitados = listaInvitados;
        this.listaInvitadosFiltrada = listaInvitados;
      }
    );

    this.subscriptions.push(s);

    s = this.sharedService.filtroInvitadosHabitaciones.subscribe(
      (filtro: any) => {
        this.filtrarInvitados(filtro);
      }
    );

    this.subscriptions.push(s);
  }

  filtrarInvitados(filtro: any) {
    if (filtro == null) return;

    const listaInterna: IInvitado[] = [];

    filtro.forEach((f: NzTreeNode) => {
      if (f.level == 0) {
        listaInterna.push(...this.listaInvitados);
        return;
      }
      if (f.level == 1) {
        listaInterna.push(
          ...this.listaInvitados.filter((i) => {
            return i.unidadNegocioId.toString() == f.key.replace('u-', '');
          })
        );
      }
      if (f.level == 2) {
        listaInterna.push(
          ...this.listaInvitados.filter((i) => {
            return i.filialId.toString() == f.key.replace('f-', '');
          })
        );
      }
    });

    this.listaInvitadosFiltrada = listaInterna;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  dragEntered($event: any) {
    this.isDragging = true;
  }

  dragExited($event: any) {
    this.isDragging = false;
  }

  drop(event: CdkDragDrop<IInvitado[]>) {
    this.isDragging = false;
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      this.droppedItemEvent.emit({
        originType: 'habitacion',
        originId: event.previousContainer.id,
        originItemId: event.previousContainer.data[event.previousIndex],
        destinationType: 'invitado',
        destinationId: event.container.id,
        confirmedOverCapacity: false,
      });
    }
  }

  onClick(invitado: IInvitado) {
    this.editEvent.emit(invitado);
  }
}
