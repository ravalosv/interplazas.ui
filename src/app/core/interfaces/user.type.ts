export interface IUser {
  user: User;
  token: string;
  refreshToken: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isDisabled: boolean;
  createdByUserId: number;
  grupoId: null;
  createdAt: Date;
  updatedAt: Date;
  unidadesNegocio: UnidadesNegocio[];
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
