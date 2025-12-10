/* import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AddInvitado, ClearInvitado } from './invitados.actions';
import { IInvitado, InvitadosStateModel } from './invitados.models';

@State<InvitadosStateModel>({
  name: 'invitados',
  defaults: {
    invitados: [],
  },
})
@Injectable()
export class InvitadosState {
  @Selector()
  static getInvitados(state: InvitadosStateModel) {
    return state.invitados;
  }

  @Action(AddInvitado)
  add(
    { getState, patchState }: StateContext<InvitadosStateModel>,
    { payload }: AddInvitado
  ) {
    const state = getState();
    patchState({ invitados: [...state.invitados, payload] });
  }

  @Action(ClearInvitado)
  clear({ setState }: StateContext<InvitadosStateModel>) {
    setState({ invitados: [] });
  }
}
 */
