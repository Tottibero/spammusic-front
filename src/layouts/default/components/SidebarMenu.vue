<template>
  <aside
    :class="[ 
      'w-64 bg-gray-800 text-white flex flex-col justify-between fixed h-screen transform transition-transform duration-300 z-10',
      menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <!-- Navegación superior -->
    <div>
      <div class="p-4 text-xl font-bold border-b border-gray-700">
        Spam Music
      </div>
      <nav class="p-4 space-y-2">
        <router-link
          v-for="route in topRoutes"
          :key="route.to"
          :to="route.to"
          class="block px-4 py-2 rounded hover:bg-gray-700"
          :active-class="route.activeClass"
        >
          {{ route.label }}
        </router-link>
      </nav>
    </div>
    <!-- Navegación inferior -->
    <nav class="p-4 space-y-2 border-t border-gray-700">
      <router-link
        v-for="route in bottomRoutes"
        :key="route.to"
        :to="route.to"
        class="block px-4 py-2 rounded hover:bg-gray-700"
        :active-class="route.activeClass"
        v-if="route?.to" 
      >
        {{ route.label }}
      </router-link>
      <button
        v-else
        @click="handleLogout"
        class="block w-full text-left px-4 py-2 rounded hover:bg-red-600"
      >
        {{ logoutLabel }}
      </button>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@stores/auth/auth.ts"; // Asegúrate de que la ruta al store sea correcta
import routes from "./routes.json"; // Archivo JSON de rutas

export default defineComponent({
  name: "SidebarMenu",
  props: {
    menuVisible: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore();

    const handleLogout = () => {
      authStore.logout();
      window.location.href = "/"; // Redirige al usuario al inicio o a otra página tras el logout
    };

    return {
      handleLogout,
      logoutLabel: "Logout", // Etiqueta personalizada para el botón de logout
      topRoutes: routes.slice(0, 4), // Rutas superiores
      bottomRoutes: routes.slice(4).filter((route) => route.to), // Excluye logout si 'to' es null
    };
  },
});
</script>

<style scoped>
@media (max-width: 768px) {
  aside {
    width: 100%;
    height: 100%;
  }
}
</style>
