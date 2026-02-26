export interface IServicioLog {
  id: number;
  servicioId: number;
  usuarioId: number;
  fecha: string;
  accion: string;
  detalles: string;
  usuario?: {
    id: number;
    name: string;
    email: string;
  };
}
