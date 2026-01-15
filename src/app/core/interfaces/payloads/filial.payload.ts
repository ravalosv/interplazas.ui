import { GrupoAdminPayload } from './grupo.payload';

export interface FilialAdminPayload {
  id: number;
  nombre: string;
  extranjera: boolean;
  grupoId: number;
  grupo?: GrupoAdminPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilialDeletePayload {
  id: number;
}

