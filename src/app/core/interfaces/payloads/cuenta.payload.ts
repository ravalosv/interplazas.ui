export interface IngresosEgresosTipoPayload {
  id: number;
  tipo: string;
  tipoMovimiento: string;
}

export interface IngresosEgresosFormaPayload {
  id: number;
  forma: string;
}

export interface IngresosEgresosConceptosPayload {
  id: number;
  concepto: string;
}

export interface IngresosEgresosCategoriasPayload {
  id: number;
  categoria: string;
}

export interface IngresosEgresosStatusPayload {
  id: number;
  status: string;
}

export interface IngresosEgresosAddPayload {
  id?: number;
  createdByUserId?: number;
  eventoId?: number;
  tipoMovimiento?: string;
  aportacion?: number;
  gasto?: number;
  idTipo?: number;
  idForma?: number;
  idCuenta?: number;
  idConcepto?: number;
  idCategoria?: number;
  referencia?: number;
  idStatus?: number;
  comentario?: number;
  comprobante?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IngresosEgresosGetPayload {
  id: number;
  eventoId: number;
  tipoMovimiento?: string;
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
  downloadToken?: string;
  createdByUserId: number;
  createdAt?: Date;
  updatedAt?: Date;
  tipo?: Tipo;
  forma?: Forma;
  concepto?: Concepto;
  categoria?: Categoria;
  status?: Status;
  cuenta?: Cuenta;
  usuario?: Usuario;
}

export interface Categoria {
  id?: number;
  categoria?: string;
}

export interface Concepto {
  id?: number;
  concepto?: string;
}

export interface Forma {
  id?: number;
  forma?: string;
}

export interface Status {
  id?: number;
  status?: string;
}

export interface Tipo {
  id?: number;
  tipo?: string;
}

export interface Cuenta {
  id?: number;
  nombre?: string;
}

export interface Usuario {
  id?: number;
  name?: string;
}
