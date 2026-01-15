import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private errorMessages: { [key: string]: string } = {
    // General
    INTERNAL_SERVER_ERROR: 'Ocurrió un error interno en el servidor.',
    INVALID_QUERY: 'La consulta realizada es inválida.',

    // Auth & Users
    USER_ALREADY_EXISTS: 'El usuario ya se encuentra registrado.',
    USER_NOT_FOUND: 'Usuario no encontrado.',
    'invalid token': 'La sesión es inválida.',
    'invalid token: user not found': 'Usuario de la sesión no encontrado.',
    TIPO_USUARIO_NOT_FOUND: 'El tipo de usuario no existe.',

    // Configuration / Catalogs
    GRUPO_NOT_FOUND: 'El grupo no existe.',
    GRUPO_HAS_FILIALES:
      'No se puede eliminar el grupo porque tiene filiales asociadas.',

    FILIAL_NOT_FOUND: 'La filial no existe.',
    FILIAL_HAS_SUCURSALES:
      'No se puede eliminar la filial porque tiene sucursales asociadas.',

    SUCURSAL_NOT_FOUND: 'La sucursal no existe.',

    CONCEPTO_NOT_FOUND: 'El concepto no existe.',
    COSTO_NOT_FOUND: 'El costo no existe.',
    STATUS_NOT_FOUND: 'El estatus no existe.',
    ESTADO_CTA_STATUS_NOT_FOUND: 'El estado de cuenta no existe.',
    MOTIVO_NO_OTORGADO_NOT_FOUND: 'El motivo de no otorgado no existe.',
    TIPO_SERVICIO_NOT_FOUND: 'El tipo de servicio no existe.',
    TIPO_DOCUMENTO_NOT_FOUND: 'El tipo de documento no existe.',
  };

  constructor() {}

  confirm(options: {
    titulo: string;
    message: string;
    okCallback?: () => any;
    noCallback?: () => any;
  }) {
    Swal.fire({
      title: options.titulo,
      text: options.message,
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if (options.okCallback) options.okCallback();
      } else if (result.isDismissed) {
        if (options.noCallback) options.noCallback();
      }
    });
  }

  success(message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      title: message,
      icon: 'success',
    });
  }

  error(message: string) {
    const translatedMessage = this.errorMessages[message] || message;

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'error',
      title: translatedMessage,
    });
  }

  waitingMessage(message: string) {
    Swal.fire({
      toast: false,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      //timerProgressBar: true,
      title: message,
      icon: 'success',
    });
  }
}
