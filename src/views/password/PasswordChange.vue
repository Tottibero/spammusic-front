<template>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <!-- Selector de Avatares -->
    <div class="mb-6">
      <label class="block font-medium mb-2">Selecciona un Avatar</label>
      <div class="flex flex-wrap gap-2 justify-center">
        <div v-for="avatar in avatars" :key="avatar" @click="selectAvatar(avatar)"
          class="cursor-pointer border-2 rounded-full overflow-hidden w-20 h-20 flex items-center justify-center transition-transform duration-300 hover:scale-110"
          :class="avatar === selectedAvatar
              ? 'border-[#d9e021] shadow-md'
              : 'border-gray-300'
            ">
          <img :src="avatar" class="w-full h-full object-cover" alt="Avatar" />
        </div>
      </div>

      <!-- Botón para guardar solo el avatar -->
      <button type="button" @click="saveAvatar"
        class="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Guardar Avatar
      </button>
    </div>

    <h2 class="text-2xl font-bold mb-4 mt-5 text-center">Cambiar Contraseña</h2>
    <form @submit.prevent="changePassword" class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <label for="password" class="block font-medium">Nueva Contraseña</label>
        <input v-model="password" type="password" id="password" class="w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Ingrese su nueva contraseña" required />
        <p v-if="passwordError" class="text-red-500 text-sm mt-1">
          {{ passwordError }}
        </p>
      </div>
      <div class="mb-4">
        <label for="confirmPassword" class="block font-medium">Confirmar Contraseña</label>
        <input v-model="confirmPassword" type="password" id="confirmPassword"
          class="w-full p-2 border border-gray-300 rounded-lg" placeholder="Confirme su nueva contraseña" required />
      </div>

      <p v-if="passwordMismatch" class="text-red-500 text-sm mb-2">
        Las contraseñas no coinciden
      </p>

      <p v-if="errorMessage" class="text-red-500 text-sm mb-2">
        {{ errorMessage }}
      </p>

      <button type="submit"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
        Guardar Contraseña
      </button>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import SwalService from "@services/swal/SwalService";
import { useUserStore } from "@stores/user/users";
import { useAuthStore } from "@stores/auth/auth";

export default {
  name: "ChangePassword",
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore(); // 👈 auth

    const password = ref("");
    const confirmPassword = ref("");
    const errorMessage = ref("");

    const selectedAvatar = ref(""); // Avatar seleccionado
    const avatars = ref([]); // Lista de avatares disponibles

    const passwordMismatch = computed(() => password.value !== confirmPassword.value);
    const passwordError = computed(() => {
      if (password.value.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
      if (!/[A-Z]/.test(password.value)) return "La contraseña debe incluir al menos una letra mayúscula.";
      if (!/[a-z]/.test(password.value)) return "La contraseña debe incluir al menos una letra minúscula.";
      if (!/[0-9]/.test(password.value)) return "La contraseña debe incluir al menos un número.";
      return "";
    });

    // Cargar avatares y preseleccionar el del login
    const loadAvatars = () => {
      avatars.value = [
        "/avatar/avatar1.png","/avatar/avatar2.png","/avatar/avatar3.png","/avatar/avatar4.png",
        "/avatar/avatar5.png","/avatar/avatar6.png","/avatar/avatar7.png","/avatar/avatar8.png",
        "/avatar/avatar9.png","/avatar/avatar10.png","/avatar/avatar11.png","/avatar/avatar12.png",
        "/avatar/avatar13.png","/avatar/avatar14.png","/avatar/avatar15.png","/avatar/avatar16.png",
        "/avatar/avatar17.png","/avatar/avatar18.png"
      ];

      // 👇 tomamos la imagen ya guardada tras el login
      const saved = authStore.avatarUrl || localStorage.getItem("image");
      selectedAvatar.value = saved && saved.length ? saved : avatars.value[0];
    };

    onMounted(loadAvatars);

    // Seleccionar un avatar en la UI
    const selectAvatar = (avatar) => { selectedAvatar.value = avatar; };

    // Guardar solo el avatar
    const saveAvatar = async () => {
      try {
        await userStore.updateUserStore({ image: selectedAvatar.value }); // persistir en backend
        authStore.setImage(selectedAvatar.value); // 👈 sincronizar auth/localStorage
        SwalService.success("Avatar actualizado correctamente");
        errorMessage.value = "";
      } catch (error) {
        errorMessage.value = error?.response?.data?.message || "Ocurrió un error inesperado";
      }
    };

    // Guardar cambios de contraseña
    const changePassword = async () => {
      if (passwordMismatch.value || passwordError.value) return;
      try {
        await userStore.updateUserStore({ password: password.value });
        SwalService.success("Contraseña cambiada con éxito");
        password.value = "";
        confirmPassword.value = "";
        errorMessage.value = "";
      } catch (error) {
        errorMessage.value = error?.response?.data?.message || "Ocurrió un error inesperado";
      }
    };

    return {
      password,
      confirmPassword,
      passwordMismatch,
      passwordError,
      changePassword,
      errorMessage,
      avatars,
      selectedAvatar,
      selectAvatar,
      saveAvatar
    };
  },
};
</script>

<style scoped>
.container {
  background-color: #f9fafb;
}
</style>
