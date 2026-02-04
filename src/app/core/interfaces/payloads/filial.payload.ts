import { GrupoAdminPayload } from './grupo.payload';

export interface FilialAdminPayload {
  id: number;
  nombre: string;
  extranjera: boolean;
  grupoId: number;
  apiUrl?: string;
  apiKey?: string;
  grupo?: GrupoAdminPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilialDeletePayload {
  id: number;
}

