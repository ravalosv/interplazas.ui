export interface IUser {
  user: User;
  token: string;
  refreshToken: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  tipoUsuarioId: number;
  isDisabled: boolean;
  createdByUserId: number;
  filialId: null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnidadesNegocio {
  id: number;
  nombre: string;
  grupoId: number;
  UserUnidadesNegocio: UserUnidadesNegocio;
}

export interface UserUnidadesNegocio {
  userId: number;
  unidadNegocioId: number;
}
