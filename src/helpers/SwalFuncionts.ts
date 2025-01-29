// services/SwalService.js

import Swal from 'sweetalert2';

export default {
  /**
   * Mostrar un mensaje de éxito (toast en la parte superior)
   * @param {string} message - El texto que quieres mostrar en el SweetAlert
   */
  success(message = 'Operación realizada con éxito') {
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
   * Mostrar un mensaje de error (toast en la parte superior)
   * @param {string} message - El texto que quieres mostrar en el SweetAlert
   */
  error(message = 'Ocurrió un error, inténtalo de nuevo') {
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
   * Si necesitas alertas 'confirm' o personalizadas, puedes añadir más métodos.
   * Por ejemplo, un método para confirmar una acción:
   */
  confirm(message = '¿Estás seguro?', confirmButtonText = 'Sí', cancelButtonText = 'No') {
    return Swal.fire({
      title: 'Confirmación',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    });
  }
};
