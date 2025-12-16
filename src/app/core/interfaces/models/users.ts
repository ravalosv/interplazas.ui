export interface IUsersPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  grupoId: string;
  tipoUsuarioId?: number;
  filialId?: number | null;
  isDisabled: boolean;
  createdByUserId: number;
  grupo?: IGrupoPayload;
  unidadesNegocio: IUsersUNPayload[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUsersUNPayload {
  id: string;
}

export interface IGrupoPayload {
  id: string;
  nombre: string;
}
