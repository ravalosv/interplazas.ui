export interface IngresosEgresosAddDTO {
  eventoId: number;
  tipoMovimiento: string;
  aportacion?: number;
  gasto?: number;
  idTipo?: number;
  idForma?: number;
  idCuenta?: number;
  idConcepto?: number;
  idCategoria?: number;
  referencia?: string;
  idStatus?: number;
  comentario?: string;
  comprobante?: string;
}
