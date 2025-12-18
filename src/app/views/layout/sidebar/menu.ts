import { MenuItem } from './menu.model';

//https://feathericons.com/
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
    label: 'Periodos',
    icon: 'activity',
    link: 'operacion/periodos',
  },

  // Configuración
  {
    label: 'Configuración',
    isTitle: true,
  },

  {
    label: 'Filiales',
    icon: 'settings',
    link: 'config/filiales-admin',
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
    label: 'Tipos de ataúd',
    icon: 'box',
    link: 'config/tipo-ataud-admin',
  },
  {
    label: 'Motivos no otorgado',
    icon: 'slash',
    link: 'config/motivo-no-otorgado-admin',
  },
 {
    label: 'Usuarios',
    icon: 'users',
    link: 'config/usuarios',
  },
];

export const MENU_CLIENTE: MenuItem[] = [
  // OFFERS
/*   {
    label: 'Eventos',
    isTitle: true,
  },
  {
    label: 'Mis eventos',
    icon: 'book-open',
    link: 'events/list',
  }, */
];
