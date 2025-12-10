import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
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
      title: message,
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
