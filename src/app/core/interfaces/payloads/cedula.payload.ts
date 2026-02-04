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
  penalizado?: boolean;
  esFilialesHermanas?: boolean;
  montoDevuelto?: number;
  aceptaConvenio?: boolean;
  montoEnContrato?: number;
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
  subTotalFavor: number;
  subTotalPagar: number;
  totalUsa: number;
  totalComisiones: number;
  comisionPF?: number;
  saldosEfectivamenteCobradosTotal?: number;
  totalFinal?: number;
  totalMontoContrato?: number;
  createdAt: Date;
  updatedAt: Date;
  filial?: any;
  detalles?: CedulaDetallePayload[];
}
