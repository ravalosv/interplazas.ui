import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAddInvitadoToEventPayload } from 'src/app/core/interfaces/models/evento.dto';

/*

  -- en el comoponente que envía el valor
  this.sharedService.changeGrupoId($event.id);

  -- en el componente que recibe el valor
  ngOnInit(): void {

    this.sharedService.grupoId.subscribe((grupoId) => {
      if (grupoId !== null) {
        // Llama a tu función aquí
      }
    });
  }

*/

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor() {}

  /// GrupoId
  private _grupoId = new BehaviorSubject<any>(null);
  grupoId = this._grupoId.asObservable();

  changeGrupoId(grupoId: any) {
    this._grupoId.next(grupoId);
  }

  /// ListaInvitadosHabitaciones
  private _listaInvitadosHabitaciones = new BehaviorSubject<any>(null);
  listaInvitadosHabitaciones = this._listaInvitadosHabitaciones.asObservable();

  changeListaInvitadosHabitaciones(listaInvitados: any) {
    this._listaInvitadosHabitaciones.next(listaInvitados);
  }

  // Filtro invitados Habitaciones
  private _filtroInvitadosHabitaciones = new BehaviorSubject<any>(null);
  filtroInvitadosHabitaciones =
    this._filtroInvitadosHabitaciones.asObservable();
  changeFiltroInvitadosHabitaciones(filtroInvitados: any) {
    this._filtroInvitadosHabitaciones.next(filtroInvitados);
  }

  /// ListaInvitadosMesas
  private _listaInvitadosMesas = new BehaviorSubject<any>(null);
  listaInvitadosMesas = this._listaInvitadosMesas.asObservable();
  changeListaInvitadosMesas(listaInvitados: any) {
    this._listaInvitadosMesas.next(listaInvitados);
  }

  // Filtro invitados Mesas
  private _filtroInvitadosMesas = new BehaviorSubject<any>(null);
  filtroInvitadosMesas = this._filtroInvitadosMesas.asObservable();
  changeFiltroInvitadosMesas(filtroInvitados: any) {
    this._filtroInvitadosMesas.next(filtroInvitados);
  }

  // Invitado guardado
  private _InvitadoGuardado = new BehaviorSubject<any>(null);
  invitadoGuardado = this._InvitadoGuardado.asObservable();
  changeInvitadoGuardado(intivado: IAddInvitadoToEventPayload | null) {
    this._InvitadoGuardado.next(intivado);
  }

  // Invitado guardado
  private _InvitadoEliminado = new BehaviorSubject<any>(null);
  invitadoEliminado = this._InvitadoEliminado.asObservable();
  changeInvitadoEliminado(invitado: any) {
    this._InvitadoEliminado.next(invitado);
  }
}
