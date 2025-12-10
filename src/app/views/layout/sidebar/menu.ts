import { MenuItem } from './menu.model';

//https://feathericons.com/
export const MENU_ADMIN: MenuItem[] = [
  // OFFERS
  {
    label: 'Eventos',
    isTitle: true,
  },
  {
    label: 'Mis eventos',
    icon: 'book-open',
    link: 'events/list',
  },
  /*   {
    label: 'Nuevo evento',
    icon: 'file-plus',
    link: 'events/new',
  }, */

  // Herramientas
  {
    label: 'Herramientas',
    isTitle: true,
  },

  {
    label: 'Avisos',
    icon: 'bell',
    link: 'herramientas/avisos',
  },

  // Configuración
  {
    label: 'Configuración',
    isTitle: true,
  },

  {
    label: 'Organización',
    icon: 'settings',
    link: 'config/estructura',
  },
  /*   {
    label: 'Grupos',
    icon: 'settings',
    link: 'config/grupos',
  },
  {
    label: 'Unidades de negocio',
    icon: 'settings',
    link: 'config/unidades-negocio',
  },
  {
    label: 'Filiales',
    icon: 'settings',
    link: 'config/filiales',
  },
 */ {
    label: 'Usuarios',
    icon: 'users',
    link: 'config/usuarios',
  },
];

export const MENU_CLIENTE: MenuItem[] = [
  // OFFERS
  {
    label: 'Eventos',
    isTitle: true,
  },
  {
    label: 'Mis eventos',
    icon: 'book-open',
    link: 'events/list',
  },
];
