export interface FilialAdminPayload {
  id: number;
  nombre: string;
  extranjera: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilialDeletePayload {
  id: number;
}

