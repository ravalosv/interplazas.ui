export interface PeriodoPayload {
  id: number;
  mes: number;
  anio: number;
  nombre: string;
  activo: boolean;
  estadoCuentaGenerado: boolean;
  fecha_revision?: string;
  fecha_reenvio_cedulas?: string;
  fecha_visto_bueno?: string;
  fecha_cierre_periodo?: string;
  createdAt: Date;
  updatedAt: Date;
  cedulas?: { id: number }[];
}
