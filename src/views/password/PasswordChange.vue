<template>
  <div v-if="ready" class="mx-auto max-w-5xl px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- IZQUIERDA: Avatares -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 text-center">Selecciona un Avatar</h2>

        <!-- Placeholder hasta que estén cargadas las imágenes -->
        <div v-if="!avatarsReady" class="grid grid-cols-4 gap-3 place-items-center">
          <div v-for="n in 12" :key="n" class="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
        </div>

        <!-- Grid final -->
        <div v-else class="grid grid-cols-4 gap-3 place-items-center w-full">
          <button
            v-for="avatar in avatars"
            :key="avatar"
            type="button"
            @click="selectAvatar(avatar)"
            class="grid place-items-center w-20 h-20 rounded-full overflow-hidden border-4 transition-transform duration-200 hover:scale-105"
            :class="avatar === selectedAvatar ? 'border-[#d9e021] shadow-md' : 'border-gray-300'">
            <img
              :src="avatar"
              alt="Avatar"
              class="block w-full h-full object-cover"
              width="80" height="80"
              loading="eager" decoding="async"
            />
          </button>
        </div>

        <button
          type="button"
          @click="saveAvatar"
          class="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
          Guardar Avatar
        </button>
      </section>

      <!-- DERECHA: Cambiar contraseña -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 text-center">Cambiar Contraseña</h2>

        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="password" class="block font-medium mb-1">Nueva Contraseña</label>
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

          <div>
            <label for="confirmPassword" class="block font-medium mb-1">Confirmar Contraseña</label>
            <input
              v-model="confirmPassword"
              type="password"
              id="confirmPassword"
              class="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Confirme su nueva contraseña"
              required
            />
          </div>

          <p v-if="passwordMismatch" class="text-red-500 text-sm -mt-2">
            Las contraseñas no coinciden
          </p>

          <p v-if="errorMessage" class="text-red-500 text-sm">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
            Guardar Contraseña
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from "vue";
import SwalService from "@services/swal/SwalService";
import { useUserStore } from "@stores/user/users";
import { useAuthStore } from "@stores/auth/auth";

export default {
  name: "ChangePassword",
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();

    const ready = ref(false);
    const avatarsReady = ref(false); // 👈
    const password = ref("");
    const confirmPassword = ref("");
    const errorMessage = ref("");
    const selectedAvatar = ref("");
    const avatars = ref([]);

    const passwordMismatch = computed(() => password.value !== confirmPassword.value);
    const passwordError = computed(() => {
      if (password.value.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
      if (!/[A-Z]/.test(password.value)) return "La contraseña debe incluir al menos una letra mayúscula.";
      if (!/[a-z]/.test(password.value)) return "La contraseña debe incluir al menos una letra minúscula.";
      if (!/[0-9]/.test(password.value)) return "La contraseña debe incluir al menos un número.";
      return "";
    });

    const loadAvatars = () => {
      avatars.value = [
        "/avatar/avatar1.png","/avatar/avatar2.png","/avatar/avatar3.png","/avatar/avatar4.png",
        "/avatar/avatar5.png","/avatar/avatar6.png","/avatar/avatar7.png","/avatar/avatar8.png",
        "/avatar/avatar9.png","/avatar/avatar10.png","/avatar/avatar11.png","/avatar/avatar12.png",
        "/avatar/avatar13.png","/avatar/avatar14.png","/avatar/avatar15.png","/avatar/avatar16.png",
        "/avatar/avatar17.png","/avatar/avatar18.png"
      ];
      const saved = authStore.avatarUrl || localStorage.getItem("image");
      selectedAvatar.value = saved && saved.length ? saved : avatars.value[0];
    };

    // 👇 Preload de imágenes: garantiza que la grilla salga “ya pintada”
    const preloadAvatars = (urls) => {
      const loaders = urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => resolve(true);
            img.src = url;
          })
      );
      return Promise.all(loaders);
    };

    onMounted(async () => {
      loadAvatars();
      await preloadAvatars(avatars.value); // 👈 esperar a que estén cargadas
      avatarsReady.value = true;
      await nextTick();
      ready.value = true;
    });

    const selectAvatar = (avatar) => { selectedAvatar.value = avatar; };

    const saveAvatar = async () => {
      try {
        await userStore.updateUserStore({ image: selectedAvatar.value });
        authStore.setImage(selectedAvatar.value);
        SwalService.success("Avatar actualizado correctamente");
        errorMessage.value = "";
      } catch (error) {
        errorMessage.value = error?.response?.data?.message || "Ocurrió un error inesperado";
      }
    };

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
      ready, avatarsReady,
      password, confirmPassword, passwordMismatch, passwordError,
      changePassword, errorMessage,
      avatars, selectedAvatar, selectAvatar, saveAvatar
    };
  },
};
</script>
