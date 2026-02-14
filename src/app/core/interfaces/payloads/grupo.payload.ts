export interface GrupoAdminPayload {
  id: number;
  nombre: string;
  cobroEntreFiliales: boolean;
  cedula_destinatarios_email?: string;
  cedula_template_id?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrupoDeletePayload {
  id: number;
}
