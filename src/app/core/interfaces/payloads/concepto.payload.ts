export interface ConceptoPayload {
  id: number;
  nombre: string;
  montoMXN: number;
  montoUSD: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConceptoAdminPayload {
  id: number;
  nombre: string;
  montoMXN: number;
  montoUSD: number;
  createdAt?: string;
  updatedAt?: string;
}
