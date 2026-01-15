export interface GrupoAdminPayload {
  id: number;
  nombre: string;
  cobroEntreFiliales: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrupoDeletePayload {
  id: number;
}
