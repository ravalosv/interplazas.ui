export interface IAvisoPayload {
  id: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
  mostrarA: string;
  visto: boolean;
  createdByUserId: number;
  updatedAt: Date;
  createdAt: Date;
  activatedAt: Date;
  usuarios: UsuarioElement[];
}

export interface UsuarioElement {
  id: number;
  userId: number;
  usuario: UsuarioUsuario;
}

export interface UsuarioUsuario {
  name: string;
}
