import { FilialAdminPayload } from './filial.payload';

export interface SucursalAdminPayload {
  id: number;
  nombre: string;
  filialId: number;
  filial?: FilialAdminPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface SucursalDeletePayload {
  id: number;
}
