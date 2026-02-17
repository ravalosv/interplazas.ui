import { GrupoAdminPayload } from './grupo.payload';

export interface FilialAdminPayload {
  id: number;
  nombre: string;
  extranjera: boolean;
  utilizaApi: boolean;
  grupoId: number;
  apiUrl?: string;
  apiKey?: string;
  templateSaldoPabsCero?: number;
  templateSaldoPabsConConvenio?: number;
  templateSaldoPabsSinConvenio?: number;
  templateSaldoPabsParcial?: number;
  destinatarios_email?: string;
  cedula_destinatarios_email?: string;
  cedula_template_id?: number;
  grupo?: GrupoAdminPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilialDeletePayload {
  id: number;
}
