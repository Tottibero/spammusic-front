// services/SwalService.ts

import Swal from 'sweetalert2';
import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

interface ConfirmOptions {
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default {
  /**
   * Muestra un mensaje de éxito (toast en la esquina superior).
   * @param message Texto a mostrar (opcional).
   */
  success(message: string = 'Operación realizada con éxito'): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      position: 'top-end',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
    });
  },

  /**
   * Muestra un mensaje de error (toast en la esquina superior).
   * @param message Texto a mostrar (opcional).
   */
  error(message: string = 'Ocurrió un error, inténtalo de nuevo'): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      position: 'top-end',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
    });
  },

  /**
   * Muestra una alerta de confirmación.
   * @param options Opciones para personalizar el mensaje y botones.
   */
  confirm({
    message = '¿Estás seguro?',
    confirmButtonText = 'Sí',
    cancelButtonText = 'No',
  }: ConfirmOptions = {}): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: 'Confirmación',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    });
  },

  /**
   * Método genérico por si necesitas alertas altamente personalizadas.
   * Recibe cualquier opción válida de SweetAlert2.
   */
  generic(config: SweetAlertOptions): Promise<SweetAlertResult<any>> {
    return Swal.fire(config);
  },
};
