export interface CedulaDetallePayload {
  id: number;
  cedulaId: number;
  servicioId: number;
  tipo: 'FAVOR' | 'PAGAR' | 'USA';
  monto: number;
  sucursalOrigenId: number;
  sucursalOtorganteId: number;
  sucursalOrigenNombre?: string;
  sucursalOtorganteNombre?: string;
  titular?: string;
  finado?: string;
  contrato?: string;
  fecha?: string | Date;
  conceptoId?: number;
  conceptoNombre?: string;
  saldoPABS?: number;
  observacion?: string;
  saldoEfectivamenteCobrado?: number;
  createdAt: Date;
  updatedAt: Date;
  servicio?: any;
  filialOrigen?: any;
  filialOtorgante?: any;
}

export interface CedulaPayload {
  id: number;
  periodoId: number;
  periodoNombre?: string;
  filialId: number;
  filialNombre?: string;
  totalFavor: number;
  totalPagar: number;
  totalUsa: number;
  totalNeto: number;
  comisionPF?: number;
  saldosEfectivamenteCobradosTotal?: number;
  totalFinal?: number;
  createdAt: Date;
  updatedAt: Date;
  filial?: any;
  detalles?: CedulaDetallePayload[];
}
