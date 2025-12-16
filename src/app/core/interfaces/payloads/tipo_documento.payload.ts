export interface TipoDocumentoAdminPayload {
  id: number;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoDocumentoDeletePayload {
  id: number;
}
