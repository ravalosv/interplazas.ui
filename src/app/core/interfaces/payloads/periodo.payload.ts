export interface PeriodoPayload {
  id: number;
  mes: number;
  anio: number;
  nombre: string;
  activo: boolean;
  estadoCuentaGenerado: boolean;
  createdAt: Date;
  updatedAt: Date;
  cedulas?: { id: number }[];
}
