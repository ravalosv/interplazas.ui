import { MenuItem } from './menu.model';

//https://feathericons.com/
export const MENU_SUPER_ADMIN: MenuItem[] = [
  // OFFERS
  {
    label: 'Operación',
    isTitle: true,
  },
  {
    label: 'Servicios',
    icon: 'activity',
    link: 'operacion/servicios',
  },
  {
    label: 'Cédulas',
    icon: 'file-text',
    link: 'operacion/cedulas',
  },  
  {
    label: 'Periodos',
    icon: 'activity',
    link: 'operacion/periodos',
  },

    // Configuración
  {
    label: 'Estado de cuenta',
    isTitle: true,
  },

    {
    label: 'Movimientos',
    icon: 'list',
    link: 'estado-cuenta/movimientos',
  },
  {
    label: 'Concentrado',
    icon: 'bar-chart-2',
    link: 'estado-cuenta/concentrado',
  },
  {
    label: 'Detallado',
    icon: 'bar-chart-2',
    link: 'estado-cuenta/detallado',
  },


  // Configuración
  {
    label: 'Estructura',
    isTitle: true,
  },

  {
    label: 'Grupos',
    icon: 'layers',
    link: 'config/grupos-admin',
  },
  {
    label: 'Filiales',
    icon: 'settings',
    link: 'config/filiales-admin',
  },
  {
    label: 'Sucursales',
    icon: 'map-pin',
    link: 'config/sucursales-admin',
  },
   {
    label: 'Usuarios',
    icon: 'users',
    link: 'config/usuarios',
  },
  {
    label: 'Configuración',
    isTitle: true,
  },
  {
    label: 'Tipos de documento',
    icon: 'file-text',
    link: 'config/tipo-documento-admin',
  },
  {
    label: 'Tipos de servicio',
    icon: 'briefcase',
    link: 'config/tipo-servicio-admin',
  },
  {
    label: 'Conceptos',
    icon: 'box',
    link: 'config/concepto-crud',
  },
  {
    label: 'Motivos no otorgado',
    icon: 'slash',
    link: 'config/motivo-no-otorgado-admin',
  },
  {
    label: 'Canales de comunicación',
    icon: 'message-square',
    link: 'config/canales-comunicacion-admin',
  },
];


export const MENU_ADMIN: MenuItem[] = [
  // OFFERS
  {
    label: 'Operación',
    isTitle: true,
  },
  {
    label: 'Servicios',
    icon: 'activity',
    link: 'operacion/servicios',
  },
  {
    label: 'Cédulas',
    icon: 'file-text',
    link: 'operacion/cedulas',
  },  
  {
    label: 'Periodos',
    icon: 'activity',
    link: 'operacion/periodos',
  },

    // Configuración
  {
    label: 'Estado de cuenta',
    isTitle: true,
  },

    {
    label: 'Movimientos',
    icon: 'list',
    link: 'estado-cuenta/movimientos',
  },
  {
    label: 'Concentrado',
    icon: 'bar-chart-2',
    link: 'estado-cuenta/concentrado',
  },
  {
    label: 'Detallado',
    icon: 'bar-chart-2',
    link: 'estado-cuenta/detallado',
  },


  // Configuración
  {
    label: 'Estructura',
    isTitle: true,
  },

  {
    label: 'Grupos',
    icon: 'layers',
    link: 'config/grupos-admin',
  },
  {
    label: 'Filiales',
    icon: 'settings',
    link: 'config/filiales-admin',
  },
  {
    label: 'Sucursales',
    icon: 'map-pin',
    link: 'config/sucursales-admin',
  },
   {
    label: 'Usuarios',
    icon: 'users',
    link: 'config/usuarios',
  },
  {
    label: 'Configuración',
    isTitle: true,
  },
  {
    label: 'Canales de comunicación',
    icon: 'message-square',
    link: 'config/canales-comunicacion-admin',
  },
];

export const MENU_CAPTURA: MenuItem[] = [
  // OFFERS
  {
    label: 'Operación',
    isTitle: true,
  },
  {
    label: 'Servicios',
    icon: 'activity',
    link: 'operacion/servicios',
  }
];

export const MENU_CLIENTE: MenuItem[] = [
  {
    label: 'Contratos',
    isTitle: true,
  },
  {
    label: 'Consultar',
    icon: 'file-text',
    link: 'contratos',
  }
];
