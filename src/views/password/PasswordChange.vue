<template>
    <div class="container mx-auto px-4 py-8 max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-center">Cambiar Contraseña</h2>
      <form @submit.prevent="changePassword" class="bg-white p-6 rounded-lg shadow-md">
        <div class="mb-4">
          <label for="password" class="block font-medium">Nueva Contraseña</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Ingrese su nueva contraseña"
            required
          />
          <p v-if="passwordError" class="text-red-500 text-sm mt-1">
            {{ passwordError }}
          </p>
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="block font-medium">Confirmar Contraseña</label>
          <input
            v-model="confirmPassword"
            type="password"
            id="confirmPassword"
            class="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Confirme su nueva contraseña"
            required
          />
        </div>
        
        <p v-if="passwordMismatch" class="text-red-500 text-sm mb-2">
          Las contraseñas no coinciden
        </p>
        
        <p v-if="errorMessage" class="text-red-500 text-sm mb-2">
          {{ errorMessage }}
        </p>
        
        <button
          type="submit"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Guardar Contraseña
        </button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, computed } from "vue";
  import SwalService from "@services/swal/SwalService";
  import { useUserStore } from "@stores/user/users";
  
  export default {
    name: "ChangePassword",
    setup() {
      const password = ref("");
      const confirmPassword = ref("");
      const errorMessage = ref(""); 
      const userStore = useUserStore();
  
      const passwordMismatch = computed(() => password.value !== confirmPassword.value);
      
      const passwordError = computed(() => {
        if (password.value.length < 6) {
          return "La contraseña debe tener al menos 6 caracteres.";
        }
        if (!/[A-Z]/.test(password.value)) {
          return "La contraseña debe incluir al menos una letra mayúscula.";
        }
        if (!/[a-z]/.test(password.value)) {
          return "La contraseña debe incluir al menos una letra minúscula.";
        }
        if (!/[0-9]/.test(password.value)) {
          return "La contraseña debe incluir al menos un número.";
        }
        return "";
      });
  
      const changePassword = async () => {
        if (passwordMismatch.value || passwordError.value) return;
  
        try {
          await userStore.updateUserStore({ password: password.value });
  
          SwalService.success("Contraseña cambiada con éxito");
  
          password.value = "";
          confirmPassword.value = "";
          errorMessage.value = "";
        } catch (error) {
          if (error.response && error.response.status === 400) {
            errorMessage.value = error.response.data.message || "Error al cambiar la contraseña";
          } else {
            errorMessage.value = "Ocurrió un error inesperado";
          }
        }
      };
  
      return {
        password,
        confirmPassword,
        passwordMismatch,
        passwordError,
        changePassword,
        errorMessage, 
      };
    },
  };
  </script>
  
  <style scoped>
  .container {
    background-color: #f9fafb;
  }
  </style>
  