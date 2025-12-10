import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ITipoHabitacionXGrupoPayload,
  ITipoMesaXGrupoPayload,
} from 'src/app/core/interfaces/models/evento.dto';
import { IDroppedItem, IInvitado } from '../../interfaces/events.interface';
import { SharedService } from '../../services/shared.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { IUser } from 'src/app/core/interfaces/user.type';
import { AlertsService } from 'src/app/core/services/alerts.service';

@Component({
  selector: 'app-evento-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss'],
})
export class MesaComponent implements OnInit {
  @Input() mesa: ITipoMesaXGrupoPayload;
  @Input() readOnlyMode: boolean = false;
  @Output() droppedItemEvent = new EventEmitter<IDroppedItem>();
  @Output() editEvent = new EventEmitter<IInvitado>();

  listaInvitados: IInvitado[] = [];
  isDragging: any;
  habId: string;
  currentUser: IUser | null = null;

  constructor(
    private sharedService: SharedService,
    private authService: AuthenticationService,
    private alertsService: AlertsService
  ) {}

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.habId = this.mesa.id.toString();

    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user!;
    });

    this.listaInvitados = this.mesa.invitados;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async drop(event: CdkDragDrop<IInvitado[]>) {
    var confirmedOverCapacity = false;

    this.isDragging = false;

    if (this.mesa.maximo <= this.mesa.invitados.length) {
      if (this.currentUser?.user.role !== 'admin') return;

      const result = await this.confirmOverCapacity();
      if (!result) {
        return;
      }
      confirmedOverCapacity = true;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // avisar a el componente padre que se ha movido un item
      this.droppedItemEvent.emit({
        originType:
          event.previousContainer.id == 'invitados' ? 'invitado' : 'habitacion',
        originId: event.previousContainer.id,
        originItemId: event.previousContainer.data[event.previousIndex],
        destinationType: 'habitacion',
        destinationId: `${
          this.mesa.id
        }|${this.mesa.tipoMesaId.toString()}|${this.mesa.unidadNegocioId.toString()}`,
        confirmedOverCapacity: confirmedOverCapacity,
      });
    }
  }

  async confirmOverCapacity(): Promise<boolean> {
    const result = await new Promise<boolean>((resolve, reject) => {
      this.alertsService.confirm({
        titulo: 'Mesa con sobrecupo',
        message:
          'La mesa tiene más ocupantes que los permitidos. ¿Desea continuar?',
        okCallback: () => resolve(true),
        noCallback: () => resolve(false),
      });
    });

    return result;
  }

  dragEntered($event: any) {
    this.isDragging = true;
  }

  dragExited($event: any) {
    this.isDragging = false;
  }
  // convierte la lista de invitados (IInvitados) en una lista de strings
  generarListaInvitados() {}

  validateMaxCapacity(item: any) {
    if (this.mesa == undefined) {
      return true;
    }

    if (this.mesa.maximo > this.mesa.invitados.length) {
      return true;
    } else {
      return false;
    }
  }

  onClick(invitado: IInvitado) {
    this.editEvent.emit(invitado);
  }
}
